-- Match hosted column types to the inventory history function's contract.

begin;

create or replace function public.get_inventory_adjustment_history()
returns table (
  id bigint,
  product_name text,
  size text,
  color text,
  quantity_change integer,
  changed_by uuid,
  changed_by_name text,
  created_at timestamp with time zone
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  return query
  select
    adjustment.id::bigint,
    product.name::text,
    variant.size::text,
    variant.color::text,
    adjustment.quantity_change::integer,
    adjustment.changed_by::uuid,
    staff.display_name::text,
    adjustment.created_at::timestamp with time zone
  from public.inventory_adjustments as adjustment
  join public.product_variants as variant
    on variant.id = adjustment.product_variant_id
  join public.products as product
    on product.id = variant.product_id
  left join public.staff_users as staff
    on staff.user_id = adjustment.changed_by
  order by adjustment.created_at desc, adjustment.id desc;
end;
$$;

revoke all on function public.get_inventory_adjustment_history()
from public, anon, authenticated;

grant execute on function public.get_inventory_adjustment_history()
to authenticated;

commit;
