-- The manually created hosted database retained an integer-ID overload of the
-- stock function. PostgREST cannot choose between integer and bigint overloads
-- when both expose the same JSON argument names.

begin;

drop function if exists public.adjust_product_stock(integer, integer);

-- Keep the canonical bigint function from migration 016 as the only public
-- API candidate and refresh PostgREST's function metadata immediately.
revoke all on function public.adjust_product_stock(bigint, integer)
from public, anon, authenticated;

grant execute on function public.adjust_product_stock(bigint, integer)
to authenticated;

notify pgrst, 'reload schema';

commit;
