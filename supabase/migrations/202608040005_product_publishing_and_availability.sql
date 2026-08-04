-- Treat new products as drafts, validate first publication, and derive public
-- availability from real stock without exposing exact quantities.

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

revoke all on function public.get_public_products()
from public;

grant execute on function public.get_public_products()
to anon, authenticated;

create or replace function public.validate_product_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_visible = true
    and (
      tg_op = 'INSERT'
      or old.is_visible = false
    ) then
    if new.deleted_at is not null then
      raise exception 'Archived products cannot be shown.';
    end if;

    if not exists (
      select 1
      from public.product_images
      where product_id = new.id
    ) then
      raise exception
        'Add at least one product image before showing this product.';
    end if;

    if not exists (
      select 1
      from public.product_variants
      where product_id = new.id
        and quantity > 0
    ) then
      raise exception
        'Add at least one in-stock variant before showing this product.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_product_publication
on public.products;

create trigger validate_product_publication
before insert or update of is_visible on public.products
for each row
execute function public.validate_product_publication();

revoke all on function public.validate_product_publication()
from public, anon, authenticated;

create or replace function public.protect_visible_product_image()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.products
    where id = old.product_id
      and is_visible = true
      and deleted_at is null
  ) and not exists (
    select 1
    from public.product_images
    where product_id = old.product_id
      and id <> old.id
  ) then
    raise exception 'Hide this product before deleting its only image.';
  end if;

  return old;
end;
$$;

drop trigger if exists protect_visible_product_image
on public.product_images;

create trigger protect_visible_product_image
before delete on public.product_images
for each row
execute function public.protect_visible_product_image();

revoke all on function public.protect_visible_product_image()
from public, anon, authenticated;

create or replace function public.set_product_visibility(
  target_product_id bigint,
  next_is_visible boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  update public.products
  set is_visible = next_is_visible
  where id = target_product_id
    and deleted_at is null;

  if not found then
    raise exception 'Product not found.';
  end if;
end;
$$;

revoke all on function public.set_product_visibility(bigint, boolean)
from public, anon, authenticated;

grant execute on function public.set_product_visibility(bigint, boolean)
to authenticated;

commit;
