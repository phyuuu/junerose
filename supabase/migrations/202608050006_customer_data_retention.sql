-- Enforce the published customer-data retention policy without deleting the
-- non-personal order, item, total, status, or inventory history.

begin;

alter table public.orders
add column if not exists customer_data_anonymized_at
timestamp with time zone null;

alter table public.orders
add column if not exists customer_data_anonymized_by uuid null
references auth.users(id) on delete set null;

create index if not exists orders_closed_data_retention_idx
on public.orders (updated_at)
where customer_data_anonymized_at is null
  and status in ('completed', 'cancelled');

create index if not exists orders_pending_data_retention_idx
on public.orders (created_at)
where customer_data_anonymized_at is null
  and status = 'pending';

create or replace function public.get_order_retention_summary()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  retention_cutoff timestamp with time zone := now() - interval '12 months';
  eligible_count integer;
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  select count(*)::integer
  into eligible_count
  from public.orders
  where customer_data_anonymized_at is null
    and (
      (
        status in ('completed', 'cancelled')
        and updated_at < retention_cutoff
      )
      or (
        status = 'pending'
        and created_at < retention_cutoff
      )
    );

  return jsonb_build_object(
    'eligible_count', eligible_count,
    'cutoff_at', retention_cutoff,
    'retention_months', 12
  );
end;
$$;

create or replace function public.anonymize_expired_order_customer_data()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  retention_cutoff timestamp with time zone := now() - interval '12 months';
  eligible_order_ids bigint[];
  anonymized_count integer := 0;
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  select coalesce(
    array_agg(eligible_order.id order by eligible_order.id),
    array[]::bigint[]
  )
  into eligible_order_ids
  from (
    select id
    from public.orders
    where customer_data_anonymized_at is null
      and (
        (
          status in ('completed', 'cancelled')
          and updated_at < retention_cutoff
        )
        or (
          status = 'pending'
          and created_at < retention_cutoff
        )
      )
    for update
  ) as eligible_order;

  if cardinality(eligible_order_ids) = 0 then
    return 0;
  end if;

  delete from public.order_notes
  where order_id = any(eligible_order_ids);

  delete from public.order_lookup_limits
  where order_id = any(eligible_order_ids);

  update public.orders
  set
    customer_name = 'Anonymized customer',
    customer_phone = 'Anonymized',
    customer_address = 'Anonymized',
    customer_note = null,
    customer_data_anonymized_at = now(),
    customer_data_anonymized_by = auth.uid()
  where id = any(eligible_order_ids)
    and customer_data_anonymized_at is null;

  get diagnostics anonymized_count = row_count;

  return anonymized_count;
end;
$$;

revoke all on function public.get_order_retention_summary()
from public, anon, authenticated;

revoke all on function public.anonymize_expired_order_customer_data()
from public, anon, authenticated;

grant execute on function public.get_order_retention_summary()
to authenticated;

grant execute on function public.anonymize_expired_order_customer_data()
to authenticated;

commit;
