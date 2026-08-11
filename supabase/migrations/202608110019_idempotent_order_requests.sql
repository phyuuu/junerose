-- Prevent duplicate customer orders when the same checkout request is retried.

begin;

alter table public.orders
add column if not exists request_token uuid null;

create unique index if not exists orders_request_token_key
on public.orders (request_token)
where request_token is not null;

-- Remove every hosted overload before installing the one canonical RPC shape.
do $$
declare
  function_arguments text;
begin
  for function_arguments in
    select pg_get_function_identity_arguments(procedure.oid)
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'create_order_request'
  loop
    execute format(
      'drop function public.create_order_request(%s)',
      function_arguments
    );
  end loop;
end;
$$;

create function public.create_order_request(
  order_customer_name text,
  order_customer_phone text,
  order_customer_address text,
  order_preferred_contact text,
  order_customer_note text,
  order_items jsonb,
  order_request_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_order record;
  new_order_id bigint;
  new_order_number text;
  new_order_created_at timestamp with time zone;
  requested_item record;
  canonical_item record;
  canonical_items jsonb := '[]'::jsonb;
  total_mmk bigint := 0;
  order_number_attempts integer := 0;
begin
  if order_request_token is null then
    raise exception 'Order request token is required.';
  end if;

  -- The transaction lock makes simultaneous retries wait for the first request.
  perform pg_advisory_xact_lock(
    hashtextextended(order_request_token::text, 20260811)
  );

  select
    stored_order.order_number,
    stored_order.created_at,
    stored_order.total_mmk
  into existing_order
  from public.orders as stored_order
  where stored_order.request_token = order_request_token;

  if found then
    return jsonb_build_object(
      'order_number', existing_order.order_number,
      'created_at', existing_order.created_at,
      'total_mmk', existing_order.total_mmk,
      'items', '[]'::jsonb,
      'duplicate_prevented', true
    );
  end if;

  if char_length(trim(coalesce(order_customer_name, ''))) not between 1 and 120 then
    raise exception 'Customer name must be between 1 and 120 characters.';
  end if;

  if char_length(trim(coalesce(order_customer_phone, ''))) not between 1 and 30
    or char_length(regexp_replace(coalesce(order_customer_phone, ''), '[^0-9]', '', 'g')) not between 7 and 15 then
    raise exception 'Customer phone is invalid.';
  end if;

  if char_length(trim(coalesce(order_customer_address, ''))) not between 1 and 500 then
    raise exception 'Customer address must be between 1 and 500 characters.';
  end if;

  if char_length(trim(coalesce(order_customer_note, ''))) > 1000 then
    raise exception 'Customer note must be 1000 characters or fewer.';
  end if;

  if coalesce(order_preferred_contact, '') not in ('Viber', 'Messenger', 'Phone') then
    raise exception 'Preferred contact is invalid.';
  end if;

  if order_items is null
    or jsonb_typeof(order_items) is distinct from 'array' then
    raise exception 'Order items must be an array.';
  end if;

  if jsonb_array_length(order_items) not between 1 and 50 then
    raise exception 'An order must contain between 1 and 50 items.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(order_items) as submitted(item)
    where jsonb_typeof(submitted.item) <> 'object'
      or coalesce(submitted.item->>'variant_id', '') !~ '^[1-9][0-9]*$'
      or coalesce(submitted.item->>'quantity', '') !~ '^[1-9][0-9]*$'
  ) then
    raise exception 'Each order item must contain a valid variant and quantity.';
  end if;

  for requested_item in
    select
      (submitted.item->>'variant_id')::bigint as variant_id,
      sum((submitted.item->>'quantity')::integer)::integer as quantity
    from jsonb_array_elements(order_items)
      with ordinality as submitted(item, item_order)
    group by (submitted.item->>'variant_id')::bigint
    order by min(submitted.item_order)
  loop
    if requested_item.quantity > 20 then
      raise exception 'A product variant quantity cannot exceed 20.';
    end if;

    select
      product_variants.id as variant_id,
      products.id as product_id,
      products.slug as product_slug,
      products.name as product_name,
      products.price_mmk as unit_price_mmk,
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
      ) as image_url,
      coalesce(sizes.name, product_variants.size) as selected_size,
      coalesce(colors.name, product_variants.color) as selected_color,
      product_variants.quantity as available_quantity
    into canonical_item
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
    where product_variants.id = requested_item.variant_id
      and products.is_visible = true
      and products.deleted_at is null
      and departments.is_active = true
      and product_types.is_active = true;

    if not found
      or canonical_item.selected_size is null
      or canonical_item.selected_color is null then
      raise exception 'One or more selected products are no longer available.';
    end if;

    if canonical_item.available_quantity < requested_item.quantity then
      raise exception 'One or more selected products do not have enough stock.';
    end if;

    total_mmk := total_mmk
      + (canonical_item.unit_price_mmk * requested_item.quantity);

    canonical_items := canonical_items || jsonb_build_array(
      jsonb_build_object(
        'variant_id', canonical_item.variant_id,
        'product_id', canonical_item.product_id,
        'product_slug', canonical_item.product_slug,
        'product_name', canonical_item.product_name,
        'unit_price_mmk', canonical_item.unit_price_mmk,
        'image_url', canonical_item.image_url,
        'selected_size', canonical_item.selected_size,
        'selected_color', canonical_item.selected_color,
        'quantity', requested_item.quantity,
        'line_total_mmk', canonical_item.unit_price_mmk * requested_item.quantity
      )
    );
  end loop;

  loop
    order_number_attempts := order_number_attempts + 1;

    if order_number_attempts > 10 then
      raise exception 'Unable to generate a unique order number.';
    end if;

    new_order_number := 'JR-'
      || to_char(timezone('Asia/Yangon', now()), 'YYYYMMDD')
      || '-'
      || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10));

    begin
      insert into public.orders (
        order_number,
        customer_name,
        customer_phone,
        customer_address,
        preferred_contact,
        customer_note,
        total_mmk,
        status,
        request_token
      )
      values (
        new_order_number,
        trim(order_customer_name),
        trim(order_customer_phone),
        trim(order_customer_address),
        order_preferred_contact,
        nullif(trim(coalesce(order_customer_note, '')), ''),
        total_mmk,
        'pending',
        order_request_token
      )
      returning id, created_at
      into new_order_id, new_order_created_at;

      exit;
    exception
      when unique_violation then
        -- The request-token lock prevents token conflicts; retry order numbers.
    end;
  end loop;

  insert into public.order_items (
    order_id,
    product_id,
    product_variant_id,
    product_slug,
    product_name,
    unit_price_mmk,
    image_url,
    selected_size,
    selected_color,
    quantity,
    line_total_mmk
  )
  select
    new_order_id,
    (saved.item->>'product_id')::bigint,
    (saved.item->>'variant_id')::bigint,
    saved.item->>'product_slug',
    saved.item->>'product_name',
    (saved.item->>'unit_price_mmk')::bigint,
    saved.item->>'image_url',
    saved.item->>'selected_size',
    saved.item->>'selected_color',
    (saved.item->>'quantity')::integer,
    (saved.item->>'line_total_mmk')::bigint
  from jsonb_array_elements(canonical_items) as saved(item);

  return jsonb_build_object(
    'order_number', new_order_number,
    'created_at', new_order_created_at,
    'total_mmk', total_mmk,
    'items', canonical_items,
    'duplicate_prevented', false
  );
end;
$$;

revoke all on function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb,
  uuid
)
from public;

grant execute on function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb,
  uuid
)
to anon, authenticated;

notify pgrst, 'reload schema';

commit;
