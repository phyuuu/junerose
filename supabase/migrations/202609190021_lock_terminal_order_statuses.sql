-- Make completed and cancelled orders terminal while preserving the existing
-- atomic stock reservation and release workflow for active orders.

begin;

create or replace function public.update_order_status(
  target_order_number text,
  target_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.orders%rowtype;
  requested_status text := lower(trim(coalesce(target_status, '')));
  new_status public.orders.status%type;
begin
  if auth.uid() is null
    or not coalesce(public.current_user_is_active_staff(), false) then
    raise exception using
      errcode = '42501',
      message = 'Active staff access is required.';
  end if;

  if requested_status not in (
    'pending',
    'confirmed',
    'preparing',
    'ready',
    'completed',
    'cancelled'
  ) then
    raise exception 'Select a valid order status.';
  end if;

  new_status := requested_status;

  select *
  into target_order
  from public.orders
  where order_number = trim(target_order_number)
  for update;

  if not found then
    raise exception 'Order not found.';
  end if;

  if target_order.status::text = requested_status then
    return;
  end if;

  if target_order.status::text = 'completed' then
    raise exception 'Completed orders cannot be changed.';
  end if;

  if target_order.status::text = 'cancelled' then
    raise exception 'Cancelled orders cannot be reopened.';
  end if;

  if requested_status = 'pending'
    and target_order.stock_reserved_at is not null then
    raise exception
      'Reserved orders cannot be moved back to pending. Cancel the order to release stock.';
  end if;

  if requested_status = 'completed'
    and target_order.stock_reserved_at is null then
    raise exception 'Confirm the order before marking it completed.';
  end if;

  if requested_status in ('confirmed', 'preparing', 'ready', 'completed')
    and target_order.stock_reserved_at is null then
    perform public.reserve_order_stock(trim(target_order_number));
  end if;

  if requested_status = 'cancelled'
    and target_order.stock_reserved_at is not null
    and target_order.stock_released_at is null then
    perform public.release_order_stock(trim(target_order_number));
  end if;

  update public.orders
  set status = new_status
  where id = target_order.id;
end;
$$;

revoke all on function public.update_order_status(text, text)
from public, anon, authenticated;

grant execute on function public.update_order_status(text, text)
to authenticated;

commit;
