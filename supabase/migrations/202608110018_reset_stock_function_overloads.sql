-- Remove every hosted overload of adjust_product_stock, then recreate one
-- canonical API signature. This resolves PGRST203 regardless of which legacy
-- parameter types were created before migration history was introduced.

begin;

do $$
declare
  stock_function regprocedure;
begin
  for stock_function in
    select procedure.oid::regprocedure
    from pg_proc as procedure
    join pg_namespace as namespace
      on namespace.oid = procedure.pronamespace
    where namespace.nspname = 'public'
      and procedure.proname = 'adjust_product_stock'
  loop
    execute format('drop function %s', stock_function);
  end loop;
end;
$$;

create function public.adjust_product_stock(
  target_variant_id bigint,
  adjustment_amount integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_quantity integer;
  acting_user_id uuid := auth.uid();
begin
  if acting_user_id is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  if adjustment_amount is null or adjustment_amount = 0 then
    raise exception 'Adjustment cannot be zero.';
  end if;

  select quantity
  into current_quantity
  from public.product_variants
  where id = target_variant_id
  for update;

  if not found then
    raise exception 'Product variant not found.';
  end if;

  if current_quantity + adjustment_amount < 0 then
    raise exception 'Stock cannot be negative.';
  end if;

  update public.product_variants
  set quantity = current_quantity + adjustment_amount
  where id = target_variant_id;

  insert into public.inventory_adjustments (
    product_variant_id,
    quantity_change,
    changed_by
  )
  values (
    target_variant_id,
    adjustment_amount,
    acting_user_id
  );
end;
$$;

alter function public.adjust_product_stock(bigint, integer)
owner to postgres;

revoke all on function public.adjust_product_stock(bigint, integer)
from public, anon, authenticated;

grant execute on function public.adjust_product_stock(bigint, integer)
to authenticated;

notify pgrst, 'reload schema';

commit;
