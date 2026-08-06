-- Replace legacy permissive policies with one canonical staff authorization
-- model and add a single-admin staff access workflow.

begin;

alter table public.staff_users
add column if not exists role text;

alter table public.staff_users
add column if not exists updated_at timestamp with time zone
not null default now();

drop trigger if exists staff_users_set_updated_at on public.staff_users;
create trigger staff_users_set_updated_at
before update on public.staff_users
for each row execute function public.set_updated_at();

update public.staff_users
set role = 'staff'
where role is null;

do $$
declare
  active_staff_count integer;
  first_active_staff uuid;
begin
  if not exists (
    select 1
    from public.staff_users
    where role = 'admin'
  ) then
    select count(*)::integer
    into active_staff_count
    from public.staff_users
    where is_active = true;

    if active_staff_count <> 1 then
      raise exception
        'Migration 008 requires exactly one active existing staff account before assigning the admin role.';
    end if;

    select user_id
    into first_active_staff
    from public.staff_users
    where is_active = true
    order by created_at, user_id
    limit 1;

    update public.staff_users
    set role = 'admin'
    where user_id = first_active_staff;
  end if;
end;
$$;

alter table public.staff_users
alter column role set default 'staff';

alter table public.staff_users
alter column role set not null;

alter table public.staff_users
add constraint staff_users_role_check
check (role in ('admin', 'staff'));

create unique index staff_users_single_admin_idx
on public.staff_users ((role))
where role = 'admin';

create or replace function public.current_user_is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.staff_users
      where user_id = auth.uid()
        and is_active = true
        and role = 'admin'
    );
$$;

revoke all on function public.current_user_is_active_admin()
from public, anon, authenticated;

-- Remove every existing policy on the tables covered by the canonical model.
do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'products',
        'product_variants',
        'product_images',
        'sizes',
        'colors',
        'orders',
        'order_items',
        'staff_users'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end;
$$;

revoke all privileges on table public.products from anon, authenticated;
revoke all privileges on table public.product_variants from anon, authenticated;
revoke all privileges on table public.product_images from anon, authenticated;
revoke all privileges on table public.sizes from anon, authenticated;
revoke all privileges on table public.colors from anon, authenticated;
revoke all privileges on table public.orders from anon, authenticated;
revoke all privileges on table public.order_items from anon, authenticated;
revoke all privileges on table public.staff_users from anon, authenticated;

grant select, update on table public.products to authenticated;
grant select, insert on table public.product_variants to authenticated;
grant select, insert, update, delete on table public.product_images
to authenticated;
grant select, insert, update, delete on table public.sizes
to authenticated;
grant select, insert, update, delete on table public.colors
to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;
grant select (user_id, is_active, role, created_at, updated_at)
on table public.staff_users to authenticated;

create policy staff_manage_products
on public.products for all to authenticated
using (public.current_user_is_active_staff())
with check (public.current_user_is_active_staff());

create policy staff_manage_product_variants
on public.product_variants for all to authenticated
using (public.current_user_is_active_staff())
with check (public.current_user_is_active_staff());

create policy staff_manage_product_images
on public.product_images for all to authenticated
using (public.current_user_is_active_staff())
with check (public.current_user_is_active_staff());

create policy staff_manage_sizes
on public.sizes for all to authenticated
using (public.current_user_is_active_staff())
with check (public.current_user_is_active_staff());

create policy staff_manage_colors
on public.colors for all to authenticated
using (public.current_user_is_active_staff())
with check (public.current_user_is_active_staff());

create policy staff_read_orders
on public.orders for select to authenticated
using (public.current_user_is_active_staff());

create policy staff_read_order_items
on public.order_items for select to authenticated
using (public.current_user_is_active_staff());

create policy staff_read_own_access
on public.staff_users for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Anyone can view product images" on storage.objects;
drop policy if exists "Authenticated users can upload product images" on storage.objects;
drop policy if exists "Authenticated users can update product images" on storage.objects;
drop policy if exists "Authenticated users can delete product images" on storage.objects;
drop policy if exists staff_insert_product_images on storage.objects;
drop policy if exists staff_update_product_images on storage.objects;
drop policy if exists staff_delete_product_images on storage.objects;

create policy staff_insert_product_images
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and public.current_user_is_active_staff()
);

create policy staff_update_product_images
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and public.current_user_is_active_staff()
)
with check (
  bucket_id = 'product-images'
  and public.current_user_is_active_staff()
);

create policy staff_delete_product_images
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and public.current_user_is_active_staff()
);

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

create or replace function public.list_staff_access()
returns table (
  user_id uuid,
  email text,
  role text,
  is_active boolean,
  created_at timestamp with time zone,
  last_sign_in_at timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not coalesce(public.current_user_is_active_admin(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active admin access is required.';
  end if;

  return query
  select
    staff.user_id,
    coalesce(users.email, '')::text,
    staff.role,
    staff.is_active,
    staff.created_at,
    users.last_sign_in_at
  from public.staff_users as staff
  join auth.users as users on users.id = staff.user_id
  order by
    case when staff.role = 'admin' then 0 else 1 end,
    staff.created_at;
end;
$$;

create or replace function public.add_staff_access(target_email text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  existing_staff public.staff_users%rowtype;
begin
  if not coalesce(public.current_user_is_active_admin(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active admin access is required.';
  end if;

  if char_length(trim(coalesce(target_email, ''))) not between 3 and 254 then
    raise exception 'Enter a valid staff email address.';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = lower(trim(target_email));

  if not found then
    raise exception 'No Supabase Auth account exists for this email.';
  end if;

  select *
  into existing_staff
  from public.staff_users
  where user_id = target_user_id
  for update;

  if found then
    if existing_staff.role = 'admin' then
      raise exception 'Admin access cannot be changed from the website.';
    end if;

    if existing_staff.is_active then
      raise exception 'This account already has active staff access.';
    end if;

    update public.staff_users
    set is_active = true,
        role = 'staff'
    where user_id = target_user_id;
  else
    insert into public.staff_users (user_id, role, is_active)
    values (target_user_id, 'staff', true);
  end if;

  return target_user_id;
end;
$$;

create or replace function public.set_staff_access_active(
  target_user_id uuid,
  next_is_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_staff public.staff_users%rowtype;
begin
  if not coalesce(public.current_user_is_active_admin(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active admin access is required.';
  end if;

  select *
  into target_staff
  from public.staff_users
  where user_id = target_user_id
  for update;

  if not found then
    raise exception 'Staff access record not found.';
  end if;

  if target_staff.role = 'admin' then
    raise exception 'Admin access cannot be changed from the website.';
  end if;

  update public.staff_users
  set is_active = next_is_active
  where user_id = target_user_id;
end;
$$;

revoke all on function public.list_staff_access()
from public, anon, authenticated;
revoke all on function public.add_staff_access(text)
from public, anon, authenticated;
revoke all on function public.set_staff_access_active(uuid, boolean)
from public, anon, authenticated;

grant execute on function public.list_staff_access()
to authenticated;
grant execute on function public.add_staff_access(text)
to authenticated;
grant execute on function public.set_staff_access_active(uuid, boolean)
to authenticated;

commit;
