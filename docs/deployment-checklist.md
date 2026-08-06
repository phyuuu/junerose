# JuneRose Deployment Checklist

Use this checklist for the first production deployment and for releases that
change database behavior, authentication, orders, or inventory.

## 1. Repository and application

- [ ] The intended branch contains all application and migration changes.
- [ ] `npm ci` succeeds from the lockfile.
- [ ] `npm run check` passes.
- [ ] `npm run build` passes with production environment variables.
- [ ] `npm audit` reports no unresolved production-risk vulnerability.
- [ ] `.env.local`, service-role keys, database passwords, and customer data are
      not tracked by Git.

## 2. Supabase

- [ ] A fresh project receives migrations in filename order.
- [ ] The existing hosted project skips the baseline and receives only new,
      unapplied migrations.
- [ ] The `product-images` bucket and staff Storage policies exist.
- [ ] RLS is enabled on every application table.
- [ ] Anonymous roles have no direct access to private tables.
- [ ] Public function execute grants match the intended catalog/order surface.
- [ ] Retention summary and single-order privacy functions are executable only
      by the authenticated role and reject users who are not active staff.
- [ ] The legacy bulk anonymization function is absent after migration `007`.
- [ ] Migration `008` promotes the intended account to `admin` and all other
      authorized accounts have the `staff` role.
- [ ] Security Advisor has no permissive RLS or public bucket-listing warnings.
- [ ] Non-admin staff cannot open `/admin/staff` or execute staff-access RPCs.
- [ ] Every administrator has an active `staff_users` row; old staff accounts are
      deactivated.
- [ ] Supabase Security Advisor has no unexplained finding.
- [ ] Supabase account and source-control accounts use MFA.
- [ ] SSL enforcement, backup retention, and recovery options are reviewed for
      the selected Supabase plan.

## 3. Vercel or another Next.js host

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is configured for production.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is configured for production.
- [ ] No service-role key is configured in the frontend deployment.
- [ ] The production domain uses HTTPS.
- [ ] The deployment is built from the intended commit.
- [ ] Response headers include CSP framing protection, Permissions Policy,
      Referrer Policy, `nosniff`, frame denial, and production HSTS.

## 4. Data protection and operations

- [ ] Staff understand that customer contact data and notes are private.
- [ ] A staff owner is assigned to review the Data Retention page regularly.
- [ ] Server logs are checked for redacted structured errors only.
- [ ] A staff owner knows how to use an error reference ID to locate a failure.
- [ ] A database backup/recovery procedure and responsible person are identified.
- [ ] A rollback plan exists for both the application deployment and new SQL.
- [ ] A test order is clearly identified and removed or retained according to shop
      policy after verification.

## 5. Post-deployment

- [ ] Run every item in `docs/regression-checklist.md` against production.
- [ ] Verify product images load through the production domain.
- [ ] Verify an unauthorized browser is redirected from `/admin`.
- [ ] Confirm a real staff account can sign in and sign out.
- [ ] Review browser console and server logs during the test.
- [ ] Record the deployed commit and applied migration names.

Do not test production cancellation or stock release on a real customer order.
Use a dedicated test product and test order.
