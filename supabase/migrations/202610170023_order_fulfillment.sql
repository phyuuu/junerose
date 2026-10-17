-- Add delivery and store-pickup fulfillment while preserving the existing
-- authoritative order creation, retry protection, and lookup rate limits.

begin;

alter table public.orders
alter column customer_address drop not null;

alter table public.orders
add column fulfillment_method text not null default 'delivery',
add column pickup_store_id bigint null
  references public.store_locations(id) on delete restrict,
add column pickup_store_name text null,
add column pickup_store_township text null,
add column pickup_store_address text null,
add column pickup_store_phone text null,
add column pickup_store_opening_hours text null,
add column pickup_store_map_url text null,
add constraint orders_fulfillment_method_check check (
  fulfillment_method in ('delivery', 'pickup')
),
add constraint orders_fulfillment_details_check check (
  (
    fulfillment_method = 'delivery'
    and char_length(trim(coalesce(customer_address, ''))) between 1 and 500
    and pickup_store_id is null
    and pickup_store_name is null
    and pickup_store_township is null
    and pickup_store_address is null
    and pickup_store_phone is null
    and pickup_store_opening_hours is null
    and pickup_store_map_url is null
  )
  or
  (
    fulfillment_method = 'pickup'
    and (customer_address is null or customer_address = 'Anonymized')
    and pickup_store_id is not null
    and char_length(trim(coalesce(pickup_store_name, ''))) between 1 and 120
    and char_length(trim(coalesce(pickup_store_township, ''))) between 1 and 120
    and char_length(trim(coalesce(pickup_store_address, ''))) between 1 and 500
  )
);

create index orders_pickup_store_id_idx
on public.orders (pickup_store_id)
where pickup_store_id is not null;

alter function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb,
  uuid
)
rename to create_order_request_core;

revoke all on function public.create_order_request_core(
  text,
  text,
  text,
  text,
  text,
  jsonb,
  uuid
)
from public, anon, authenticated;

create function public.create_order_request(
  order_customer_name text,
  order_customer_phone text,
  order_customer_address text,
  order_preferred_contact text,
  order_customer_note text,
  order_fulfillment_method text,
  order_pickup_store_id bigint,
  order_items jsonb,
  order_request_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_fulfillment_method text := lower(
    trim(coalesce(order_fulfillment_method, ''))
  );
  selected_store public.store_locations%rowtype;
  core_result jsonb;
begin
  if requested_fulfillment_method not in ('delivery', 'pickup') then
    raise exception 'Fulfillment method is invalid.';
  end if;

  if requested_fulfillment_method = 'delivery' then
    if char_length(trim(coalesce(order_customer_address, ''))) not between 1 and 500 then
      raise exception 'Customer address must be between 1 and 500 characters.';
    end if;

    if order_pickup_store_id is not null then
      raise exception 'A pickup store cannot be selected for delivery.';
    end if;
  else
    if nullif(trim(coalesce(order_customer_address, '')), '') is not null then
      raise exception 'A delivery address cannot be submitted for store pickup.';
    end if;

    if order_pickup_store_id is null then
      raise exception 'Selected pickup store is not available.';
    end if;

  end if;

  core_result := public.create_order_request_core(
    order_customer_name,
    order_customer_phone,
    case
      when requested_fulfillment_method = 'delivery'
        then order_customer_address
      else 'Store pickup'
    end,
    order_preferred_contact,
    order_customer_note,
    order_items,
    order_request_token
  );

  if not coalesce((core_result->>'duplicate_prevented')::boolean, false) then
    if requested_fulfillment_method = 'pickup' then
      select *
      into selected_store
      from public.store_locations
      where id = order_pickup_store_id
        and is_active = true;

      if not found then
        raise exception 'Selected pickup store is not available.';
      end if;
    end if;

    update public.orders
    set
      customer_address = case
        when requested_fulfillment_method = 'delivery'
          then trim(order_customer_address)
        else null
      end,
      fulfillment_method = requested_fulfillment_method,
      pickup_store_id = case
        when requested_fulfillment_method = 'pickup' then selected_store.id
        else null
      end,
      pickup_store_name = case
        when requested_fulfillment_method = 'pickup' then selected_store.name
        else null
      end,
      pickup_store_township = case
        when requested_fulfillment_method = 'pickup' then selected_store.township
        else null
      end,
      pickup_store_address = case
        when requested_fulfillment_method = 'pickup' then selected_store.address
        else null
      end,
      pickup_store_phone = case
        when requested_fulfillment_method = 'pickup' then selected_store.phone
        else null
      end,
      pickup_store_opening_hours = case
        when requested_fulfillment_method = 'pickup'
          then selected_store.opening_hours
        else null
      end,
      pickup_store_map_url = case
        when requested_fulfillment_method = 'pickup' then selected_store.map_url
        else null
      end
    where request_token = order_request_token
      and order_number = core_result->>'order_number';

    if not found then
      raise exception 'Unable to save order fulfillment.';
    end if;
  end if;

  return core_result;
end;
$$;

revoke all on function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  text,
  bigint,
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
  text,
  bigint,
  jsonb,
  uuid
)
to anon, authenticated;

alter function public.find_order_request(text, text)
rename to find_order_request_core;

revoke all on function public.find_order_request_core(text, text)
from public, anon, authenticated;

create function public.find_order_request(
  lookup_order_number text,
  lookup_customer_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  core_result jsonb;
  target_order public.orders%rowtype;
begin
  core_result := public.find_order_request_core(
    lookup_order_number,
    lookup_customer_phone
  );

  if core_result is null then
    return null;
  end if;

  select *
  into target_order
  from public.orders
  where order_number = core_result->>'order_number';

  if not found then
    return null;
  end if;

  return core_result || jsonb_build_object(
    'fulfillment_method', target_order.fulfillment_method,
    'pickup_store_id', target_order.pickup_store_id,
    'pickup_store_name', target_order.pickup_store_name,
    'pickup_store_township', target_order.pickup_store_township,
    'pickup_store_address', target_order.pickup_store_address,
    'pickup_store_phone', target_order.pickup_store_phone,
    'pickup_store_opening_hours', target_order.pickup_store_opening_hours,
    'pickup_store_map_url', target_order.pickup_store_map_url
  );
end;
$$;

revoke all on function public.find_order_request(text, text)
from public;

grant execute on function public.find_order_request(text, text)
to anon, authenticated;

notify pgrst, 'reload schema';

commit;
