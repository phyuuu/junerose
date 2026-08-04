# JuneRose Architecture

## System Purpose

JuneRose is a catalog-based e-commerce application for a physical store. It
implements product, cart, order, inventory, and staff workflows while keeping
payment and final delivery arrangements outside the website.

## Trust Boundaries

The browser is not trusted. Cart values, product prices, variant IDs, order
numbers, and customer-supplied text must be validated by the server or database.

Public users receive only catalog fields required for shopping. Exact stock,
internal product codes, customer details, staff membership, inventory history,
and internal notes stay behind authenticated staff access.

## Application Layers

### Presentation

- `app/` contains App Router pages, layouts, error boundaries, and server actions.
- `components/` contains customer and admin interface components.
- Customer and admin shells provide separate navigation and error experiences.

### Application and validation

- `lib/validation/` validates customer and admin inputs.
- Server actions require staff authorization before admin writes.
- Customer order submission sends only variant IDs and quantities to the
  database; browser-provided names and prices are not authoritative.
- `lib/server/report-error.ts` records redacted server errors with reference IDs.

### Data access

- `lib/products.ts` uses public-safe database functions for catalog reads.
- `lib/admin-*.ts` contains server-only staff data loaders.
- `lib/supabase/` creates browser, server, and proxy Supabase clients.
- `lib/env.ts` validates the required public Supabase configuration once.

### Database

- PostgreSQL tables store products, variants, images, orders, order snapshots,
  inventory adjustments, staff membership, notes, and lookup rate limits.
- Row Level Security is enabled on application tables.
- Public access is limited to explicitly granted database functions.
- Staff authorization combines Supabase Auth with an active `staff_users` row.
- Security-definer functions perform sensitive multi-table transactions.

## Main Workflows

### Public catalog

1. A server component calls the public product, image, and variant functions.
2. The functions return only visible, non-archived, customer-safe data.
3. Exact quantities and internal product codes are never returned.
4. Product availability is derived from current variant stock.

### Order request

1. The browser validates the contact form and cart shape.
2. A server action validates the request again with Zod.
3. `create_order_request` validates visible products, variants, quantities, and
   current prices inside PostgreSQL.
4. The function creates the order and immutable item snapshots atomically.
5. The customer receives an order number, but stock is not reserved yet.

### Customer order lookup

1. The customer supplies both order number and phone number.
2. `find_order_request` rate-limits attempts and requires both values to match.
3. Full details are returned only after successful verification.
4. A new order success page may consume one short-lived session value once;
   complete orders are never persisted in browser local storage.

### Admin authorization

1. The session proxy refreshes Supabase authentication cookies.
2. Protected pages and actions call `requireAdmin()` on the server.
3. The guard requires valid claims and `current_user_is_active_staff() = true`.
4. Database RLS and function checks enforce the same boundary below the UI.

### Order status and inventory

1. Staff submits a target status from the protected order detail page.
2. `update_order_status` validates the transition.
3. Entering confirmed, preparing, ready, or completed reserves stock once.
4. Cancelling a reserved order releases stock once.
5. Stock changes and inventory history are written in the same transaction.

### Product publishing

1. New and restored products remain hidden.
2. Staff adds product information, images, and variants.
3. Database publication checks require an image and an in-stock variant.
4. Archived products are removed from public catalog functions.

## Browser Storage

- `localStorage` contains cart selections only.
- Legacy locally stored orders are removed automatically.
- `sessionStorage` may briefly contain order number and phone access for the
  immediate success-page redirect; it expires after ten minutes and is consumed
  once.

## Error and Privacy Model

- Customer error screens never display database errors.
- Unexpected failures receive a reference ID for server-log correlation.
- Server logs contain operation names, technical error codes, and safe internal
  IDs only. They exclude names, phones, addresses, order numbers, and note text.
- No service-role key is used by the Next.js application.

## Deliberate Boundaries

- There is no online payment provider.
- There is no public customer account system.
- Internal notes are the staff explanation surface; a second general activity
  panel is not added unless multi-staff auditing becomes a real requirement.
- Inventory adjustments already provide the audit history for stock changes.
