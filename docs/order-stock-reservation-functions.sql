alter table public.orders
add column if not exists stock_reserved_at timestamp with time zone null,
add column if not exists stock_released_at timestamp with time zone null;

create or replace function public.reserve_order_stock(
  target_order_number text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  item public.order_items%rowtype;
  matched_variant_id bigint;
  matched_quantity bigint;
begin
  select *
  into target_order
  from public.orders
  where order_number = trim(target_order_number)
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if target_order.stock_reserved_at is not null then
    return;
  end if;

  if target_order.stock_released_at is not null then
    raise exception 'Stock was already released for this order.';
  end if;

  for item in
    select *
    from public.order_items
    where order_id = target_order.id
    order by id
  loop
    select product_variants.id, product_variants.quantity
    into matched_variant_id, matched_quantity
    from public.product_variants
    where product_variants.product_id = item.product_id
      and coalesce(
        (select sizes.name from public.sizes where sizes.id = product_variants.size_id),
        product_variants.size
      ) = item.selected_size
      and coalesce(
        (select colors.name from public.colors where colors.id = product_variants.color_id),
        product_variants.color
      ) = item.selected_color
    for update;

    if matched_variant_id is null then
      raise exception 'Product variant not found for % / %.',
        item.selected_size,
        item.selected_color;
    end if;

    if matched_quantity < item.quantity then
      raise exception 'Not enough stock for % / %.',
        item.selected_size,
        item.selected_color;
    end if;
  end loop;

  for item in
    select *
    from public.order_items
    where order_id = target_order.id
    order by id
  loop
    select product_variants.id
    into matched_variant_id
    from public.product_variants
    where product_variants.product_id = item.product_id
      and coalesce(
        (select sizes.name from public.sizes where sizes.id = product_variants.size_id),
        product_variants.size
      ) = item.selected_size
      and coalesce(
        (select colors.name from public.colors where colors.id = product_variants.color_id),
        product_variants.color
      ) = item.selected_color
    for update;

    update public.product_variants
    set quantity = quantity - item.quantity
    where id = matched_variant_id;

    insert into public.inventory_adjustments (
      product_variant_id,
      quantity_change,
      changed_by
    )
    values (
      matched_variant_id,
      -item.quantity,
      auth.uid()
    );
  end loop;

  update public.orders
  set
    stock_reserved_at = now(),
    stock_released_at = null
  where id = target_order.id;
end;
$$;

create or replace function public.release_order_stock(
  target_order_number text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  item public.order_items%rowtype;
  matched_variant_id bigint;
begin
  select *
  into target_order
  from public.orders
  where order_number = trim(target_order_number)
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if target_order.stock_reserved_at is null then
    return;
  end if;

  if target_order.stock_released_at is not null then
    return;
  end if;

  for item in
    select *
    from public.order_items
    where order_id = target_order.id
    order by id
  loop
    select product_variants.id
    into matched_variant_id
    from public.product_variants
    where product_variants.product_id = item.product_id
      and coalesce(
        (select sizes.name from public.sizes where sizes.id = product_variants.size_id),
        product_variants.size
      ) = item.selected_size
      and coalesce(
        (select colors.name from public.colors where colors.id = product_variants.color_id),
        product_variants.color
      ) = item.selected_color
    for update;

    if matched_variant_id is null then
      raise exception 'Product variant not found for % / %.',
        item.selected_size,
        item.selected_color;
    end if;

    update public.product_variants
    set quantity = quantity + item.quantity
    where id = matched_variant_id;

    insert into public.inventory_adjustments (
      product_variant_id,
      quantity_change,
      changed_by
    )
    values (
      matched_variant_id,
      item.quantity,
      auth.uid()
    );
  end loop;

  update public.orders
  set stock_released_at = now()
  where id = target_order.id;
end;
$$;

revoke all on function public.reserve_order_stock(text) from public;
revoke all on function public.release_order_stock(text) from public;

grant execute on function public.reserve_order_stock(text) to authenticated;
grant execute on function public.release_order_stock(text) to authenticated;