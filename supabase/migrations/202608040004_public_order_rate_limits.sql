-- Limit public order creation and failed order-detail lookups at the database
-- boundary so callers cannot bypass the controls by skipping the website UI.

begin;

alter table public.orders
add column if not exists customer_phone_normalized text
generated always as (
  regexp_replace(customer_phone, '[^0-9]', '', 'g')
) stored;

create index if not exists orders_phone_created_at_idx
on public.orders (customer_phone_normalized, created_at desc);

create or replace function public.enforce_order_submission_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(
    coalesce(new.customer_phone, ''),
    '[^0-9]',
    '',
    'g'
  );
  recent_hour_count integer;
  recent_day_count integer;
begin
  if char_length(normalized_phone) not between 7 and 15 then
    raise exception 'Enter a valid phone number.';
  end if;

  -- Serialize submissions for the same normalized phone number so concurrent
  -- requests cannot all pass the count before any of them commits.
  perform pg_advisory_xact_lock(hashtextextended(normalized_phone, 20260804));

  select
    count(*) filter (where created_at >= now() - interval '1 hour'),
    count(*) filter (where created_at >= now() - interval '1 day')
  into recent_hour_count, recent_day_count
  from public.orders
  where customer_phone_normalized = normalized_phone
    and created_at >= now() - interval '1 day';

  if recent_hour_count >= 5 or recent_day_count >= 20 then
    raise exception 'Too many order requests for this phone number.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_order_submission_limit
on public.orders;

create trigger enforce_order_submission_limit
before insert on public.orders
for each row
execute function public.enforce_order_submission_limit();

revoke all on function public.enforce_order_submission_limit()
from public, anon, authenticated;

create table if not exists public.order_lookup_limits (
  order_id bigint primary key
    references public.orders(id) on delete cascade,
  window_started_at timestamp with time zone not null default now(),
  failed_attempts integer not null default 0
    check (failed_attempts >= 0)
);

alter table public.order_lookup_limits enable row level security;
revoke all privileges on table public.order_lookup_limits
from anon, authenticated;

drop function if exists public.find_order_request(text, text);

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
  target_order public.orders%rowtype;
  lookup_limit public.order_lookup_limits%rowtype;
  normalized_phone text := regexp_replace(
    coalesce(lookup_customer_phone, ''),
    '[^0-9]',
    '',
    'g'
  );
  result jsonb;
begin
  if char_length(trim(coalesce(lookup_order_number, ''))) not between 1 and 40
    or char_length(normalized_phone) not between 7 and 15 then
    return null;
  end if;

  select *
  into target_order
  from public.orders
  where upper(order_number) = upper(trim(lookup_order_number));

  if not found then
    return null;
  end if;

  insert into public.order_lookup_limits (order_id)
  values (target_order.id)
  on conflict (order_id) do nothing;

  select *
  into lookup_limit
  from public.order_lookup_limits
  where order_id = target_order.id
  for update;

  if lookup_limit.window_started_at < now() - interval '15 minutes' then
    update public.order_lookup_limits
    set
      window_started_at = now(),
      failed_attempts = 0
    where order_id = target_order.id
    returning * into lookup_limit;
  end if;

  if lookup_limit.failed_attempts >= 10 then
    raise exception 'Too many order lookup attempts.';
  end if;

  if target_order.customer_phone_normalized <> normalized_phone then
    update public.order_lookup_limits
    set failed_attempts = failed_attempts + 1
    where order_id = target_order.id;

    return null;
  end if;

  delete from public.order_lookup_limits
  where order_id = target_order.id;

  select jsonb_build_object(
    'order_number', orders.order_number,
    'customer_name', orders.customer_name,
    'customer_phone', orders.customer_phone,
    'customer_address', orders.customer_address,
    'preferred_contact', orders.preferred_contact,
    'customer_note', orders.customer_note,
    'total_mmk', orders.total_mmk,
    'status', orders.status,
    'created_at', orders.created_at,
    'items', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'product_variant_id', order_items.product_variant_id,
            'product_id', order_items.product_id,
            'product_slug', order_items.product_slug,
            'product_name', order_items.product_name,
            'unit_price_mmk', order_items.unit_price_mmk,
            'image_url', order_items.image_url,
            'selected_size', order_items.selected_size,
            'selected_color', order_items.selected_color,
            'quantity', order_items.quantity
          )
          order by order_items.id
        )
        from public.order_items
        where order_items.order_id = orders.id
      ),
      '[]'::jsonb
    )
  )
  into result
  from public.orders
  where orders.id = target_order.id;

  return result;
end;
$$;

revoke all on function public.find_order_request(text, text)
from public;

grant execute on function public.find_order_request(text, text)
to anon, authenticated;

commit;
