# JuneRose Database Design

The canonical executable schema is `supabase/migrations`. This document explains
the current design; it is not a substitute for migrations.

## Core Tables

| Table | Responsibility | Public access |
| --- | --- | --- |
| `products` | Internal and public product fields, visibility, archive state | No direct anonymous table access |
| `product_variants` | Size/color combinations and exact quantity | No direct anonymous table access |
| `product_images` | Ordered Supabase Storage image URLs | No direct anonymous table access |
| `sizes` / `colors` | Reusable product options | No direct anonymous table access |
| `orders` | Customer contact data, totals, status, stock timestamps | No direct anonymous table access |
| `order_items` | Immutable product and price snapshots | No direct anonymous table access |
| `inventory_adjustments` | Stock reserve, release, and manual adjustment history | Staff only |
| `order_notes` | Internal order notes | Staff only |
| `staff_users` | Active staff authorization mapped to Supabase Auth | Staff check only |
| `order_lookup_limits` | Public lookup abuse prevention | Function only |

## Important Database Functions

### Public

- `get_public_products()` returns visible customer-safe product data.
- `get_public_product_images()` returns images for public products.
- `get_public_product_variants()` returns valid combinations and availability,
  not exact stock quantities.
- `create_order_request(...)` validates the cart and creates an order atomically.
- `find_order_request(...)` verifies order number plus phone and enforces limits.

### Staff

- `current_user_is_active_staff()` is the central staff membership check.
- `create_product_with_variants(...)` creates hidden products safely.
- `update_product_info(...)` updates product fields.
- `adjust_product_stock(...)` changes stock and records history.
- `set_product_visibility(...)` enforces publication requirements.
- `update_order_status(...)` changes status and coordinates stock transactions.
- `get_order_retention_summary()` reports only the number and cutoff for orders
  due for manual review.
- `get_order_privacy_request(order_number, phone)` returns a minimal preview only
  when active staff provides matching order details.
- `anonymize_order_customer_data(order_number, phone)` removes customer details
  and notes from one verified completed or cancelled order while preserving its
  non-personal business history.

`reserve_order_stock(...)` and `release_order_stock(...)` are internal helpers;
clients do not receive execute permission for them.

## Data Integrity Decisions

- Order items snapshot names, slugs, prices, images, size, and color so historical
  orders remain understandable after a product changes.
- Order totals are calculated from current database prices during creation.
- Variant stock cannot be reserved below zero.
- Reservation and release timestamps make stock operations idempotent.
- Product publication is rejected without an image and an in-stock variant.
- Product availability is derived from stock rather than trusted admin text.
- Search, status/date filtering, pagination, and total sorting have supporting
  indexes for the admin order workflow.
- Orders record when and by which staff account customer details were
  anonymized.

## Authorization

- RLS is enabled on all application tables.
- The anonymous role has no direct catalog, order, staff, note, or inventory table
  privileges.
- Public users execute only the narrow functions required for catalog and order
  workflows.
- Authenticated table access is constrained by staff RLS policies.
- Protected functions also verify active staff membership before changing data.

## Change Process

1. Add a new timestamped SQL file under `supabase/migrations`.
2. Make the migration safe for the intended starting schema.
3. Test it in a separate Supabase project before production.
4. Commit the migration with the application code that depends on it.
5. Record any manual production verification in the deployment checklist or pull
   request.

Do not edit an already deployed migration to represent a new change. Add another
migration so the repository remains an auditable history.
