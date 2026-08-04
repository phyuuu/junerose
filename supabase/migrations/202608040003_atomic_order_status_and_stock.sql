-- Keep order status, stock quantities, reservation timestamps, and inventory
-- history in one transaction. Only an active staff user may start the workflow.

begin;

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
  item record;
  updated_variant_id bigint;
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

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

  if not exists (
    select 1
    from public.order_items
    where order_id = target_order.id
  ) then
    raise exception 'The order does not contain any items.';
  end if;

  for item in
    select
      resolved.resolved_variant_id as variant_id,
      sum(resolved.quantity)::bigint as quantity,
      min(resolved.selected_size) as selected_size,
      min(resolved.selected_color) as selected_color
    from (
      select
        coalesce(order_items.product_variant_id, legacy_variant.id)
          as resolved_variant_id,
        order_items.quantity,
        order_items.selected_size,
        order_items.selected_color
      from public.order_items
      left join lateral (
        select product_variants.id
        from public.product_variants
        left join public.sizes
          on sizes.id = product_variants.size_id
        left join public.colors
          on colors.id = product_variants.color_id
        where order_items.product_variant_id is null
          and product_variants.product_id = order_items.product_id
          and coalesce(sizes.name, product_variants.size)
            = order_items.selected_size
          and coalesce(colors.name, product_variants.color)
            = order_items.selected_color
        order by product_variants.id
        limit 1
      ) as legacy_variant on true
      where order_items.order_id = target_order.id
    ) as resolved
    group by resolved.resolved_variant_id
    order by resolved.resolved_variant_id nulls first
  loop
    if item.variant_id is null then
      raise exception 'Product variant not found for % / %.',
        item.selected_size,
        item.selected_color;
    end if;

    update public.product_variants
    set quantity = quantity - item.quantity
    where id = item.variant_id
      and quantity >= item.quantity
    returning id into updated_variant_id;

    if not found then
      raise exception 'Not enough stock for % / %.',
        item.selected_size,
        item.selected_color;
    end if;

    insert into public.inventory_adjustments (
      product_variant_id,
      quantity_change,
      changed_by
    )
    values (
      updated_variant_id,
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
  item record;
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  select *
  into target_order
  from public.orders
  where order_number = trim(target_order_number)
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if target_order.stock_reserved_at is null
    or target_order.stock_released_at is not null then
    return;
  end if;

  for item in
    select
      resolved.resolved_variant_id as variant_id,
      sum(resolved.quantity)::bigint as quantity,
      min(resolved.selected_size) as selected_size,
      min(resolved.selected_color) as selected_color
    from (
      select
        coalesce(order_items.product_variant_id, legacy_variant.id)
          as resolved_variant_id,
        order_items.quantity,
        order_items.selected_size,
        order_items.selected_color
      from public.order_items
      left join lateral (
        select product_variants.id
        from public.product_variants
        left join public.sizes
          on sizes.id = product_variants.size_id
        left join public.colors
          on colors.id = product_variants.color_id
        where order_items.product_variant_id is null
          and product_variants.product_id = order_items.product_id
          and coalesce(sizes.name, product_variants.size)
            = order_items.selected_size
          and coalesce(colors.name, product_variants.color)
            = order_items.selected_color
        order by product_variants.id
        limit 1
      ) as legacy_variant on true
      where order_items.order_id = target_order.id
    ) as resolved
    group by resolved.resolved_variant_id
    order by resolved.resolved_variant_id nulls first
  loop
    if item.variant_id is null then
      raise exception 'Product variant not found for % / %.',
        item.selected_size,
        item.selected_color;
    end if;

    update public.product_variants
    set quantity = quantity + item.quantity
    where id = item.variant_id;

    if not found then
      raise exception 'Product variant not found for % / %.',
        item.selected_size,
        item.selected_color;
    end if;

    insert into public.inventory_adjustments (
      product_variant_id,
      quantity_change,
      changed_by
    )
    values (
      item.variant_id,
      item.quantity,
      auth.uid()
    );
  end loop;

  update public.orders
  set stock_released_at = now()
  where id = target_order.id;
end;
$$;

create or replace function public.update_order_status(
  target_order_number text,
  target_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  requested_status text := lower(trim(coalesce(target_status, '')));
  new_status public.orders.status%type;
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  if requested_status not in (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'completed',
    'cancelled'
  ) then
    raise exception 'Select a valid order status.';
  end if;

  new_status := requested_status;

  select *
  into target_order
  from public.orders
  where order_number = trim(target_order_number)
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if target_order.status::text = requested_status then
    return;
  end if;

  if target_order.status::text = 'completed'
    and requested_status = 'cancelled' then
    raise exception 'Completed orders cannot be cancelled.';
  end if;

  if target_order.status::text = 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened.';
  end if;

  if requested_status = 'pending'
    and target_order.stock_reserved_at is not null then
    raise exception
      'Reserved orders cannot be moved back to pending. Cancel the order to release stock.';
  end if;

  if requested_status = 'completed'
    and target_order.stock_reserved_at is null then
    raise exception 'Confirm the order before marking it completed.';
  end if;

  if requested_status in ('confirmed', 'preparing', 'ready', 'completed')
    and target_order.stock_reserved_at is null then
    perform public.reserve_order_stock(trim(target_order_number));
  end if;

  if requested_status = 'cancelled'
    and target_order.stock_reserved_at is not null
    and target_order.stock_released_at is null then
    perform public.release_order_stock(trim(target_order_number));
  end if;

  update public.orders
  set status = new_status
  where id = target_order.id;
end;
$$;

-- The helper functions are implementation details. Authenticated clients can
-- only request the atomic workflow, which performs its own active-staff check.
revoke all on function public.reserve_order_stock(text)
from public, anon, authenticated;

revoke all on function public.release_order_stock(text)
from public, anon, authenticated;

revoke all on function public.update_order_status(text, text)
from public, anon, authenticated;

grant execute on function public.update_order_status(text, text)
to authenticated;

commit;
