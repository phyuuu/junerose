-- Repair the idempotent order lookup after PostgreSQL reported total_mmk as
-- ambiguous between the orders column and the function's local variable.

begin;

do $migration$
declare
  function_body text;
begin
  select procedure.prosrc
  into function_body
  from pg_proc as procedure
  where procedure.oid = to_regprocedure(
    'public.create_order_request(text,text,text,text,text,jsonb,uuid)'
  );

  if function_body is null then
    raise exception 'The migration 019 create_order_request function is missing.';
  end if;

  function_body := replace(
    function_body,
    '  select order_number, created_at, total_mmk
  into existing_order
  from public.orders
  where request_token = order_request_token;',
    '  select
    stored_order.order_number,
    stored_order.created_at,
    stored_order.total_mmk
  into existing_order
  from public.orders as stored_order
  where stored_order.request_token = order_request_token;'
  );

  if position('stored_order.total_mmk' in function_body) = 0 then
    raise exception 'Unable to repair the create_order_request lookup safely.';
  end if;

  execute format(
    'create or replace function public.create_order_request(
      order_customer_name text,
      order_customer_phone text,
      order_customer_address text,
      order_preferred_contact text,
      order_customer_note text,
      order_items jsonb,
      order_request_token uuid
    )
    returns jsonb
    language plpgsql
    security definer
    set search_path = public
    as %L',
    function_body
  );
end;
$migration$;

revoke all on function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb,
  uuid
)
from public;

grant execute on function public.create_order_request(
  text,
  text,
  text,
  text,
  text,
  jsonb,
  uuid
)
to anon, authenticated;

notify pgrst, 'reload schema';

commit;
