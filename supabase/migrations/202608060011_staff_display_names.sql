-- Add admin-managed staff display names without changing immutable audit IDs.

begin;

alter table public.staff_users
add column if not exists display_name text;

alter table public.staff_users
drop constraint if exists staff_users_display_name_check;

alter table public.staff_users
add constraint staff_users_display_name_check
check (
  display_name is null
  or (
    display_name = btrim(display_name)
    and char_length(display_name) between 1 and 80
    and display_name !~ '[[:cntrl:]]'
  )
);

drop function if exists public.list_staff_access();

create function public.list_staff_access()
returns table (
  user_id uuid,
  email text,
  display_name text,
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
    staff.display_name,
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

revoke all on function public.add_staff_access(text)
from public, anon, authenticated;

drop function public.add_staff_access(text);

create function public.add_staff_access(
  target_email text,
  target_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  normalized_display_name text := btrim(coalesce(target_display_name, ''));
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

  if char_length(normalized_display_name) not between 1 and 80
    or normalized_display_name ~ '[[:cntrl:]]' then
    raise exception 'Enter a valid staff display name.';
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
        role = 'staff',
        display_name = normalized_display_name
    where user_id = target_user_id;
  else
    insert into public.staff_users (
      user_id,
      role,
      is_active,
      display_name
    )
    values (
      target_user_id,
      'staff',
      true,
      normalized_display_name
    );
  end if;

  return target_user_id;
end;
$$;

create or replace function public.update_staff_display_name(
  target_user_id uuid,
  next_display_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_display_name text := btrim(coalesce(next_display_name, ''));
begin
  if not coalesce(public.current_user_is_active_admin(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active admin access is required.';
  end if;

  if char_length(normalized_display_name) not between 1 and 80
    or normalized_display_name ~ '[[:cntrl:]]' then
    raise exception 'Enter a valid staff display name.';
  end if;

  update public.staff_users
  set display_name = normalized_display_name
  where user_id = target_user_id;

  if not found then
    raise exception 'Staff access record not found.';
  end if;
end;
$$;

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

revoke all on function public.list_staff_access()
from public, anon, authenticated;
revoke all on function public.add_staff_access(text, text)
from public, anon, authenticated;
revoke all on function public.update_staff_display_name(uuid, text)
from public, anon, authenticated;
revoke all on function public.get_inventory_adjustment_history()
from public, anon, authenticated;

grant execute on function public.list_staff_access()
to authenticated;
grant execute on function public.add_staff_access(text, text)
to authenticated;
grant execute on function public.update_staff_display_name(uuid, text)
to authenticated;
grant execute on function public.get_inventory_adjustment_history()
to authenticated;

commit;
