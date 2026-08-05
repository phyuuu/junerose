-- Replace bulk retention anonymization with a verified, single-order privacy
-- request workflow. The 12-month summary remains a manual review reminder.

begin;

drop function if exists public.anonymize_expired_order_customer_data();

create or replace function public.get_order_privacy_request(
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
  normalized_phone text := regexp_replace(
    coalesce(lookup_customer_phone, ''),
    '[^0-9]',
    '',
    'g'
  );
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  if char_length(trim(coalesce(lookup_order_number, ''))) not between 1 and 40
    or char_length(normalized_phone) not between 7 and 15 then
    return null;
  end if;

  select *
  into target_order
  from public.orders
  where upper(order_number) = upper(trim(lookup_order_number))
    and customer_phone_normalized = normalized_phone
    and customer_data_anonymized_at is null;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'order_number', target_order.order_number,
    'customer_name', target_order.customer_name,
    'customer_phone', target_order.customer_phone,
    'status', target_order.status,
    'created_at', target_order.created_at,
    'can_anonymize', target_order.status in ('completed', 'cancelled')
  );
end;
$$;

create or replace function public.anonymize_order_customer_data(
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
  normalized_phone text := regexp_replace(
    coalesce(lookup_customer_phone, ''),
    '[^0-9]',
    '',
    'g'
  );
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  if char_length(trim(coalesce(lookup_order_number, ''))) not between 1 and 40
    or char_length(normalized_phone) not between 7 and 15 then
    raise exception using
      errcode = '22023',
      message = 'Enter a valid order number and phone number.';
  end if;

  select *
  into target_order
  from public.orders
  where upper(order_number) = upper(trim(lookup_order_number))
    and customer_phone_normalized = normalized_phone
    and customer_data_anonymized_at is null
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'Order details did not match or customer data was already anonymized.';
  end if;

  if target_order.status not in ('completed', 'cancelled') then
    raise exception using
      errcode = 'P0001',
      message = 'Complete or cancel this order before anonymizing customer details.';
  end if;

  delete from public.order_notes
  where order_id = target_order.id;

  delete from public.order_lookup_limits
  where order_id = target_order.id;

  update public.orders
  set
    customer_name = 'Anonymized customer',
    customer_phone = 'Anonymized',
    customer_address = 'Anonymized',
    customer_note = null,
    customer_data_anonymized_at = now(),
    customer_data_anonymized_by = auth.uid()
  where id = target_order.id
    and customer_data_anonymized_at is null;

  return jsonb_build_object(
    'order_number', target_order.order_number,
    'anonymized_at', now()
  );
end;
$$;

revoke all on function public.get_order_privacy_request(text, text)
from public, anon, authenticated;

revoke all on function public.anonymize_order_customer_data(text, text)
from public, anon, authenticated;

grant execute on function public.get_order_privacy_request(text, text)
to authenticated;

grant execute on function public.anonymize_order_customer_data(text, text)
to authenticated;

commit;
