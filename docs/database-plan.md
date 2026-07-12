# JuneRose Database and Authentication Plan

## Goal

Move JuneRose from local mock data and localStorage to a real backend.

The real version must support:

- Public customer product browsing
- Cart and order request submission
- Staff/admin product management
- Staff/admin order management
- Protected admin access
- Public-safe product data exposure

---

## Current Prototype State

The current project uses:

- `data/products.ts` for mock product data
- `localStorage` for cart data
- `localStorage` for order requests
- Mock admin pages without authentication

This is acceptable for the prototype, but not for real store usage.

---

## Recommended Stack

Use:

- Next.js
- TypeScript
- Tailwind
- Supabase PostgreSQL database
- Supabase Auth for admin login
- Next.js Server Actions for protected writes

Reason:

Supabase gives PostgreSQL, authentication, and a dashboard without requiring us to build every backend feature from zero.

---

## Core Database Tables

### products

Stores product-level information.

Fields:

- id
- slug
- name
- description
- price_mmk
- category
- images
- is_visible
- code
- created_at
- updated_at

Public pages can use:

- id
- slug
- name
- description
- price_mmk
- category
- images

Admin pages can also use:

- code
- is_visible

---

### product_stock_items

Stores stock by size and color.

Fields:

- id
- product_id
- size
- color
- quantity
- created_at
- updated_at

Public pages should not expose exact stock quantity.

Admin pages can see exact stock quantity.

---

### orders

Stores customer order request information.

Fields:

- id
- order_number
- customer_name
- phone
- address
- preferred_contact
- note
- total_mmk
- status
- created_at
- updated_at

Allowed statuses:

- pending
- confirmed
- completed
- cancelled

---

### order_items

Stores ordered products as snapshots.

Fields:

- id
- order_id
- product_id
- product_name_snapshot
- product_slug_snapshot
- price_mmk_snapshot
- image_snapshot
- selected_size
- selected_color
- quantity
- created_at

Important:

Order items should store snapshots because product names, prices, images, or visibility may change later.

---

## Data Exposure Rule

### Public customer side

Customer-facing pages must only receive public-safe product data.

Allowed:

- id
- slug
- name
- description
- price_mmk
- category
- images
- sizes
- colors
- general availability

Not allowed:

- product code
- exact stock quantity
- stock by size/color quantity
- cost price
- supplier info
- staff notes
- visibility controls

---

### Admin side

Admin pages can access internal product and order data, but only after staff authentication.

Allowed:

- product code
- exact stock
- stock by size/color
- visibility status
- order details
- customer contact details
- order status

---

## Future Architecture

### Public product flow

Database products
→ public product query
→ PublicProduct type
→ customer pages

### Admin product flow

Database products
→ admin product query
→ InternalProduct type
→ protected admin pages

### Order flow

Customer cart
→ submit order request
→ validate product and price on server
→ create order
→ create order items
→ show order number

### Admin order flow

Admin login
→ protected orders page
→ view order list
→ view order detail
→ update order status

---

## Important Security Notes

Frontend code is not trusted.

Customers can modify browser data with DevTools, so the server must validate:

- product exists
- product is visible
- selected size/color is valid
- price is correct
- quantity is reasonable

Admin actions must be protected on the server, not only hidden in the UI.