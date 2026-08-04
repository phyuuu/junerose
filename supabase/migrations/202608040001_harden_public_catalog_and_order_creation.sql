-- Public catalog DTOs expose only customer-safe fields. The functions run with
-- the migration owner's privileges so anon never needs direct table access.

begin;

create or replace function public.get_public_products()
returns table (
  id bigint,
  slug text,
  name text,
  description text,
  price_mmk bigint,
  category text,
  availability text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    products.id::bigint,
    products.slug::text,
    products.name::text,
    products.description::text,
    products.price_mmk::bigint,
    products.category::text,
    case
      when coalesce(stock.total_quantity, 0) <= 0 then 'Sold out'
      when products.availability = 'Ask staff' then 'Ask staff'
      when products.availability = 'Low stock'
        or stock.total_quantity <= 5 then 'Low stock'
      else 'Available'
    end::text
  from public.products
  left join lateral (
    select sum(product_variants.quantity) as total_quantity
    from public.product_variants
    where product_variants.product_id = products.id
  ) as stock on true
  where products.is_visible = true
    and products.deleted_at is null
  order by products.id;
$$;

create or replace function public.get_public_product_images()
returns table (
  product_id bigint,
  image_url text,
  display_order integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    product_images.product_id::bigint,
    product_images.image_url::text,
    product_images.display_order::integer
  from public.product_images
  join public.products
    on products.id = product_images.product_id
  where products.is_visible = true
    and products.deleted_at is null
  order by product_images.product_id, product_images.display_order, product_images.id;
$$;

create or replace function public.get_public_product_variants()
returns table (
  variant_id bigint,
  product_id bigint,
  size_name text,
  color_name text,
  is_available boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    product_variants.id::bigint,
    product_variants.product_id::bigint,
    coalesce(sizes.name, product_variants.size)::text,
    coalesce(colors.name, product_variants.color)::text,
    product_variants.quantity > 0
  from public.product_variants
  join public.products
    on products.id = product_variants.product_id
  left join public.sizes
    on sizes.id = product_variants.size_id
  left join public.colors
    on colors.id = product_variants.color_id
  where products.is_visible = true
    and products.deleted_at is null
    and coalesce(sizes.name, product_variants.size) is not null
    and coalesce(colors.name, product_variants.color) is not null
  order by product_variants.product_id, product_variants.id;
$$;

revoke all on function public.get_public_products() from public;
revoke all on function public.get_public_product_images() from public;
revoke all on function public.get_public_product_variants() from public;

grant execute on function public.get_public_products() to anon, authenticated;
grant execute on function public.get_public_product_images() to anon, authenticated;
grant execute on function public.get_public_product_variants() to anon, authenticated;

-- Remove all legacy anonymous catalog-table grants. Public reads now go through
-- the DTO functions above; authenticated admin access remains unchanged.
revoke all privileges on table public.products from anon;
revoke all privileges on table public.product_images from anon;
revoke all privileges on table public.product_variants from anon;

alter table public.order_items
add column if not exists product_variant_id bigint null
references public.product_variants(id) on delete set null;

create index if not exists order_items_product_variant_id_idx
on public.order_items (product_variant_id);

drop function if exists public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb
);

create function public.create_order_request(
  order_customer_name text,
  order_customer_phone text,
  order_customer_address text,
  order_preferred_contact text,
  order_customer_note text,
  order_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id bigint;
  new_order_number text;
  new_order_created_at timestamp with time zone;
  requested_item record;
  canonical_item record;
  canonical_items jsonb := '[]'::jsonb;
  total_mmk bigint := 0;
  order_number_attempts integer := 0;
begin
  if char_length(trim(coalesce(order_customer_name, ''))) not between 1 and 120 then
    raise exception 'Customer name must be between 1 and 120 characters.';
  end if;

  if char_length(trim(coalesce(order_customer_phone, ''))) not between 1 and 30 then
    raise exception 'Customer phone must be between 1 and 30 characters.';
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
          order by product_images.display_order, product_images.id
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
    left join public.sizes
      on sizes.id = product_variants.size_id
    left join public.colors
      on colors.id = product_variants.color_id
    where product_variants.id = requested_item.variant_id
      and products.is_visible = true
      and products.deleted_at is null;

    if not found then
      raise exception 'One or more selected products are no longer available.';
    end if;

    if canonical_item.selected_size is null
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
        status
      )
      values (
        new_order_number,
        trim(order_customer_name),
        trim(order_customer_phone),
        trim(order_customer_address),
        order_preferred_contact,
        nullif(trim(coalesce(order_customer_note, '')), ''),
        total_mmk,
        'pending'
      )
      returning id, created_at
      into new_order_id, new_order_created_at;

      exit;
    exception
      when unique_violation then
        -- Retry with a new opaque order number.
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
    'items', canonical_items
  );
end;
$$;

revoke all on function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb
) from public;

grant execute on function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb
) to anon, authenticated;

commit;
