-- Add a staff-managed, public-safe storefront hero and its image bucket.

begin;

create table public.storefront_settings (
  id smallint primary key default 1,
  hero_image_url text null,
  hero_image_path text null,
  hero_title text not null default 'Everyday essentials, selected with care.',
  hero_description text not null default 'Intimates, sleepwear, and comfort pieces for every day.',
  updated_at timestamp with time zone not null default now(),
  updated_by uuid null references auth.users(id) on delete set null,
  constraint storefront_settings_singleton_check check (id = 1),
  constraint storefront_settings_hero_pair_check check (
    (hero_image_url is null and hero_image_path is null)
    or (hero_image_url is not null and hero_image_path is not null)
  ),
  constraint storefront_settings_title_check check (
    char_length(trim(hero_title)) between 3 and 120
  ),
  constraint storefront_settings_description_check check (
    char_length(trim(hero_description)) between 3 and 240
  )
);

insert into public.storefront_settings (id)
values (1)
on conflict (id) do nothing;

create trigger set_storefront_settings_updated_at
before update on public.storefront_settings
for each row execute function public.set_updated_at();

alter table public.storefront_settings enable row level security;

revoke all privileges on table public.storefront_settings from anon, authenticated;
grant select, update on table public.storefront_settings to authenticated;

create policy staff_read_storefront_settings
on public.storefront_settings for select to authenticated
using (public.current_user_is_active_staff());

create policy staff_update_storefront_settings
on public.storefront_settings for update to authenticated
using (public.current_user_is_active_staff())
with check (
  id = 1
  and public.current_user_is_active_staff()
);

create function public.get_public_storefront()
returns table (
  hero_image_url text,
  hero_title text,
  hero_description text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    storefront_settings.hero_image_url::text,
    storefront_settings.hero_title::text,
    storefront_settings.hero_description::text
  from public.storefront_settings
  where storefront_settings.id = 1;
$$;

revoke all on function public.get_public_storefront() from public;
grant execute on function public.get_public_storefront() to anon, authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'storefront-assets',
  'storefront-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy staff_insert_storefront_assets
on storage.objects for insert to authenticated
with check (
  bucket_id = 'storefront-assets'
  and public.current_user_is_active_staff()
);

create policy staff_update_storefront_assets
on storage.objects for update to authenticated
using (
  bucket_id = 'storefront-assets'
  and public.current_user_is_active_staff()
)
with check (
  bucket_id = 'storefront-assets'
  and public.current_user_is_active_staff()
);

create policy staff_delete_storefront_assets
on storage.objects for delete to authenticated
using (
  bucket_id = 'storefront-assets'
  and public.current_user_is_active_staff()
);

commit;
