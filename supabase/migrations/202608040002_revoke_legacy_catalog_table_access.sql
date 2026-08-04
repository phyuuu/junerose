-- Follow-up for projects that already applied migration 202608040001 before its
-- catalog grants were tightened. Public reads use the security-definer DTOs.

begin;

revoke all privileges on table public.products from anon;
revoke all privileges on table public.product_images from anon;
revoke all privileges on table public.product_variants from anon;

commit;
