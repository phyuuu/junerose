-- Match auth.users.email (varchar) to the public function's text contract.

begin;

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

revoke all on function public.list_staff_access()
from public, anon, authenticated;

grant execute on function public.list_staff_access()
to authenticated;

commit;
