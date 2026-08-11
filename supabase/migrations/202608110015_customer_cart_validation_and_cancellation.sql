-- Give customers current, cart-specific availability information without
-- granting direct catalog-table access, and allow verified pending requests
-- to be cancelled before staff reserves stock.

begin;

create or replace function public.validate_cart_items(
  cart_items jsonb
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  validation_result jsonb;
begin
  if cart_items is null
    or jsonb_typeof(cart_items) is distinct from 'array' then
    raise exception 'Cart items must be an array.';
  end if;

  if jsonb_array_length(cart_items) not between 1 and 50 then
    raise exception 'A cart must contain between 1 and 50 items.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(cart_items) as submitted(item)
    where jsonb_typeof(submitted.item) <> 'object'
      or coalesce(submitted.item->>'variant_id', '') !~ '^[1-9][0-9]*$'
      or coalesce(submitted.item->>'quantity', '') !~ '^[1-9][0-9]*$'
  ) then
    raise exception 'Each cart item must contain a valid variant and quantity.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(cart_items) as submitted(item)
    where (submitted.item->>'quantity')::integer > 20
  ) then
    raise exception 'A product variant quantity cannot exceed 20.';
  end if;

  with requested_items as (
    select
      (submitted.item->>'variant_id')::bigint as variant_id,
      (submitted.item->>'quantity')::integer as requested_quantity,
      submitted.item_order
    from jsonb_array_elements(cart_items)
      with ordinality as submitted(item, item_order)
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'variant_id', requested.variant_id,
        'requested_quantity', requested.requested_quantity,
        'status', case
          when canonical.variant_id is null
            or canonical.available_quantity <= 0 then 'unavailable'
          when canonical.available_quantity < requested.requested_quantity
            then 'insufficient_stock'
          else 'available'
        end,
        'product_id', canonical.product_id,
        'product_slug', canonical.product_slug,
        'product_name', canonical.product_name,
        'unit_price_mmk', canonical.unit_price_mmk,
        'image_url', canonical.image_url,
        'selected_size', canonical.selected_size,
        'selected_color', canonical.selected_color
      )
      order by requested.item_order
    ),
    '[]'::jsonb
  )
  into validation_result
  from requested_items as requested
  left join lateral (
    select
      product_variants.id::bigint as variant_id,
      products.id::bigint as product_id,
      products.slug::text as product_slug,
      products.name::text as product_name,
      products.price_mmk::bigint as unit_price_mmk,
      coalesce(
        (
          select product_images.image_url
          from public.product_images
          where product_images.product_id = products.id
            and (
              product_images.color_id = product_variants.color_id
              or product_images.color_id is null
            )
          order by
            case
              when product_images.color_id = product_variants.color_id then 0
              else 1
            end,
            product_images.display_order,
            product_images.id
          limit 1
        ),
        '/products/soft-cotton-set.jpg'
      )::text as image_url,
      coalesce(sizes.name, product_variants.size)::text as selected_size,
      coalesce(colors.name, product_variants.color)::text as selected_color,
      product_variants.quantity::integer as available_quantity
    from public.product_variants
    join public.products
      on products.id = product_variants.product_id
    join public.departments
      on departments.id = products.department_id
    join public.product_types
      on product_types.id = products.product_type_id
    left join public.sizes
      on sizes.id = product_variants.size_id
    left join public.colors
      on colors.id = product_variants.color_id
    where product_variants.id = requested.variant_id
      and products.is_visible = true
      and products.deleted_at is null
      and departments.is_active = true
      and product_types.is_active = true
      and coalesce(sizes.name, product_variants.size) is not null
      and coalesce(colors.name, product_variants.color) is not null
  ) as canonical on true;

  return validation_result;
end;
$$;

revoke all on function public.validate_cart_items(jsonb)
from public;

grant execute on function public.validate_cart_items(jsonb)
to anon, authenticated;

create or replace function public.cancel_order_request(
  lookup_order_number text,
  lookup_customer_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  verified_order jsonb;
  target_order public.orders%rowtype;
  normalized_phone text := regexp_replace(
    coalesce(lookup_customer_phone, ''),
    '[^0-9]',
    '',
    'g'
  );
begin
  -- Reuse the protected lookup boundary so cancellation has the same phone
  -- verification and failed-attempt limit as viewing an order.
  verified_order := public.find_order_request(
    lookup_order_number,
    lookup_customer_phone
  );

  if verified_order is null then
    return jsonb_build_object('outcome', 'not_found');
  end if;

  select *
  into target_order
  from public.orders
  where order_number = verified_order->>'order_number'
  for update;

  if not found
    or target_order.customer_phone_normalized <> normalized_phone then
    return jsonb_build_object('outcome', 'not_found');
  end if;

  if target_order.status::text = 'cancelled' then
    return jsonb_build_object(
      'outcome', 'already_cancelled',
      'status', target_order.status
    );
  end if;

  if target_order.status::text <> 'pending'
    or target_order.stock_reserved_at is not null then
    return jsonb_build_object(
      'outcome', 'not_allowed',
      'status', target_order.status
    );
  end if;

  update public.orders
  set status = 'cancelled'
  where id = target_order.id;

  return jsonb_build_object(
    'outcome', 'cancelled',
    'status', 'cancelled'
  );
end;
$$;

revoke all on function public.cancel_order_request(text, text)
from public;

grant execute on function public.cancel_order_request(text, text)
to anon, authenticated;

commit;
