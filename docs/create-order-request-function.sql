create or replace function public.create_order_request(
  order_customer_name text,
  order_customer_phone text,
  order_customer_address text,
  order_preferred_contact text,
  order_customer_note text,
  order_items jsonb
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id bigint;
  new_order_number text;
  item jsonb;
  total_mmk bigint := 0;
begin
  if length(trim(order_customer_name)) = 0 then
    raise exception 'Customer name is required.';
  end if;

  if length(trim(order_customer_phone)) = 0 then
    raise exception 'Customer phone is required.';
  end if;

  if length(trim(order_customer_address)) = 0 then
    raise exception 'Customer address is required.';
  end if;

  if order_preferred_contact not in ('Viber', 'Messenger', 'Phone') then
    raise exception 'Preferred contact is invalid.';
  end if;

  if jsonb_typeof(order_items) <> 'array' or jsonb_array_length(order_items) = 0 then
    raise exception 'At least one order item is required.';
  end if;

  for item in
    select value
    from jsonb_array_elements(order_items)
  loop
    if (item->>'quantity')::bigint <= 0 then
      raise exception 'Order item quantity must be positive.';
    end if;

    if (item->>'unit_price_mmk')::bigint < 0 then
      raise exception 'Order item price cannot be negative.';
    end if;

    total_mmk := total_mmk
      + ((item->>'unit_price_mmk')::bigint * (item->>'quantity')::bigint);
  end loop;

  loop
    new_order_number := 'JR-'
      || to_char(now(), 'YYYYMMDD')
      || '-'
      || lpad(floor(random() * 9000 + 1000)::int::text, 4, '0');

    exit when not exists (
      select 1
      from orders
      where order_number = new_order_number
    );
  end loop;

  insert into orders (
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
  returning id into new_order_id;

  for item in
    select value
    from jsonb_array_elements(order_items)
  loop
    insert into order_items (
      order_id,
      product_id,
      product_slug,
      product_name,
      unit_price_mmk,
      image_url,
      selected_size,
      selected_color,
      quantity,
      line_total_mmk
    )
    values (
      new_order_id,
      (item->>'product_id')::bigint,
      item->>'product_slug',
      item->>'product_name',
      (item->>'unit_price_mmk')::bigint,
      item->>'image_url',
      item->>'selected_size',
      item->>'selected_color',
      (item->>'quantity')::bigint,
      (item->>'unit_price_mmk')::bigint * (item->>'quantity')::bigint
    );
  end loop;

  return new_order_number;
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
