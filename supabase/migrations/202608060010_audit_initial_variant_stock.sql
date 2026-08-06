-- Create product variants and their initial inventory history atomically.

begin;

create or replace function public.add_product_variant_with_initial_stock(
  target_product_id bigint,
  target_size_id bigint,
  target_color_id bigint,
  initial_quantity integer
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_size_name text;
  selected_color_name text;
  created_variant_id bigint;
begin
  if not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  if target_product_id is null or not exists (
    select 1
    from public.products
    where id = target_product_id
      and deleted_at is null
  ) then
    raise exception using
      errcode = '22023',
      message = 'Product not found.';
  end if;

  if initial_quantity is null or initial_quantity < 0 then
    raise exception using
      errcode = '22023',
      message = 'Initial quantity cannot be negative.';
  end if;

  select name
  into selected_size_name
  from public.sizes
  where id = target_size_id
    and is_active = true;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'Select an active size.';
  end if;

  select name
  into selected_color_name
  from public.colors
  where id = target_color_id
    and is_active = true;

  if not found then
    raise exception using
      errcode = '22023',
      message = 'Select an active color.';
  end if;

  insert into public.product_variants (
    product_id,
    size,
    color,
    size_id,
    color_id,
    quantity
  )
  values (
    target_product_id,
    selected_size_name,
    selected_color_name,
    target_size_id,
    target_color_id,
    initial_quantity
  )
  returning id into created_variant_id;

  if initial_quantity > 0 then
    insert into public.inventory_adjustments (
      product_variant_id,
      quantity_change,
      changed_by
    )
    values (
      created_variant_id,
      initial_quantity,
      auth.uid()
    );
  end if;

  return created_variant_id;
end;
$$;

revoke all on function public.add_product_variant_with_initial_stock(
  bigint,
  bigint,
  bigint,
  integer
)
from public, anon, authenticated;

grant execute on function public.add_product_variant_with_initial_stock(
  bigint,
  bigint,
  bigint,
  integer
)
to authenticated;

-- Variant creation must use the function so initial stock cannot bypass history.
revoke insert on table public.product_variants from authenticated;

commit;
