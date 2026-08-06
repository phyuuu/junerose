# Supabase Database Setup

The files in `migrations/` are the canonical executable database history for a
fresh JuneRose Supabase project. Apply them in filename order.

## Migration Order

| Migration | Purpose |
| --- | --- |
| `202608030000_initial_schema.sql` | Complete fresh-project baseline: tables, indexes, RLS, staff policies, functions, and the product image bucket |
| `202608040001_harden_public_catalog_and_order_creation.sql` | Public-safe catalog functions and database-authoritative order creation |
| `202608040002_revoke_legacy_catalog_table_access.sql` | Removes legacy anonymous catalog table privileges |
| `202608040003_atomic_order_status_and_stock.sql` | Atomic status transitions, stock reservation, and stock release |
| `202608040004_public_order_rate_limits.sql` | Order submission and customer lookup abuse limits |
| `202608040005_product_publishing_and_availability.sql` | Publication guards and stock-derived availability |
| `202608050006_customer_data_retention.sql` | Staff-only 12-month customer-data anonymization workflow |
| `202608050007_single_order_privacy_requests.sql` | Replaces bulk anonymization with verified single-order privacy requests |
| `202608050008_staff_roles_and_policy_hardening.sql` | Adds admin/staff roles and replaces legacy permissive policies |
| `202608060009_fix_staff_access_email_type.sql` | Fixes the staff-list email return type for hosted Auth schemas |
| `202608060010_audit_initial_variant_stock.sql` | Creates variants and their initial inventory records atomically |
| `202608060011_staff_display_names.sql` | Adds admin-managed staff names and name-resolved inventory history |
| `202608060012_fix_inventory_history_return_types.sql` | Normalizes hosted inventory-history return types |

## Existing Hosted JuneRose Project

The hosted project was created manually before the baseline migration existed.
Do not run `202608030000_initial_schema.sql` against that database. Migrations
`202608040001` through `202608060011` have already been applied manually.

Migration `202608060012` is the next migration to apply to the existing hosted
project after reviewing it in a separate project.

For each future migration:

1. Review and test it in a separate project.
2. Run only that new migration in the hosted project's SQL Editor or deployment
   process.
3. Verify its intended functions, grants, policies, and application workflow.
4. Commit the migration with the dependent application change.

## Fresh Project

1. Create a Supabase project.
2. Run every migration in filename order.
3. Create a Supabase Auth user for the first administrator.
4. Add the Auth user to `public.staff_users`:

   ```sql
   insert into public.staff_users (user_id)
   values ('AUTH-USER-UUID');
   ```

5. Confirm the `product-images` bucket exists and is public.
6. Confirm the staff Storage policies from the baseline migration exist.
7. Run Supabase Security Advisor and resolve unexpected findings.

## Application Configuration

Use the project's URL and publishable key in the Next.js environment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

The publishable key is intentionally usable by the browser; database grants,
RLS policies, and function authorization provide access control. Never place a
service-role key in this repository, `.env.local`, or the deployed frontend.

## Reference SQL

SQL files under `docs/` preserve focused function/index documentation from the
project's development history. Use `supabase/migrations` as the source of truth
when provisioning or upgrading a database.
