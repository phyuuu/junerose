-- Add staff-managed store locations for the future pickup workflow.

begin;

create table public.store_locations (
  id bigint generated always as identity primary key,
  name text not null,
  township text not null,
  address text not null,
  phone text null,
  opening_hours text null,
  map_url text null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  updated_by uuid null references auth.users(id) on delete set null,
  constraint store_locations_name_check check (
    char_length(trim(name)) between 1 and 120
  ),
  constraint store_locations_township_check check (
    char_length(trim(township)) between 1 and 120
  ),
  constraint store_locations_address_check check (
    char_length(trim(address)) between 1 and 500
  ),
  constraint store_locations_phone_check check (
    phone is null or char_length(trim(phone)) between 7 and 30
  ),
  constraint store_locations_opening_hours_check check (
    opening_hours is null or char_length(trim(opening_hours)) between 1 and 300
  ),
  constraint store_locations_map_url_check check (
    map_url is null or map_url ~ '^https://'
  ),
  constraint store_locations_display_order_check check (display_order >= 0)
);

create unique index store_locations_name_township_unique
on public.store_locations (lower(trim(name)), lower(trim(township)));

create trigger set_store_locations_updated_at
before update on public.store_locations
for each row execute function public.set_updated_at();

alter table public.store_locations enable row level security;

revoke all privileges on table public.store_locations from anon, authenticated;
revoke all on sequence public.store_locations_id_seq from anon, authenticated;

grant select, insert, update on table public.store_locations to authenticated;
grant usage, select on sequence public.store_locations_id_seq to authenticated;

create policy staff_manage_store_locations
on public.store_locations for all to authenticated
using (public.current_user_is_active_staff())
with check (public.current_user_is_active_staff());

create function public.get_public_store_locations()
returns table (
  id bigint,
  name text,
  township text,
  address text,
  phone text,
  opening_hours text,
  map_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    store_locations.id,
    store_locations.name,
    store_locations.township,
    store_locations.address,
    store_locations.phone,
    store_locations.opening_hours,
    store_locations.map_url
  from public.store_locations
  where store_locations.is_active = true
  order by store_locations.display_order, store_locations.id;
$$;

revoke all on function public.get_public_store_locations() from public;
grant execute on function public.get_public_store_locations() to anon, authenticated;

notify pgrst, 'reload schema';

commit;
