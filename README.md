# JuneRose

JuneRose is a functional catalog and order-request website for a physical
retail shop in Myanmar. Customers can browse products, choose real size/color
variants, manage a cart, and submit an order request. Staff confirm payment,
pickup, or delivery outside the website; the application intentionally does
not process online payments.

## Current Features

### Customer

- Public catalog backed by privacy-safe Supabase functions
- Product galleries and valid size/color selection
- Browser cart with quantity limits
- Database-authoritative order creation and totals
- Order lookup using both order number and phone number
- Protected success details with short-lived, one-time browser access
- Public order submission and lookup rate limits
- Customer privacy notice and server-validated acknowledgement

### Admin

- Supabase Auth and active-staff authorization
- Product creation, editing, publishing, archiving, and restoration
- Reusable size and color management
- Product image management through Supabase Storage
- Variant-level stock adjustments and inventory history
- Searchable, filterable, sortable, paginated orders
- Atomic order status transitions with stock reservation and release
- Private order notes with edit and delete support
- Manual 12-month privacy review and verified single-order anonymization
- Admin/staff roles with admin-only staff access management
- Canonical least-privilege database and Storage policies

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Supabase PostgreSQL, Auth, and Storage
- `@supabase/ssr`
- Zod validation
- Vitest and GitHub Actions

## Local Setup

Requirements: Node.js 20.9 or newer and access to a Supabase project.

1. Install the locked dependencies:

   ```bash
   npm ci
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env.local
   ```

3. Add the Supabase project URL and publishable key to `.env.local`.
   Never use a Supabase service-role key in this application.

4. Prepare the database by following [supabase/README.md](supabase/README.md).

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

Required environment variables are validated when Next.js loads. A missing or
invalid value stops the application with the variable name, without printing
secret values.

## Quality Checks

```bash
npm run check
npm run build
npm audit
```

`npm run check` runs ESLint, TypeScript, and the Vitest suite. The same check is
also configured in GitHub Actions.

## Database Changes

The executable schema history is in `supabase/migrations`. Apply migrations in
filename order for a fresh project. The existing hosted JuneRose database has
special baseline instructions in [supabase/README.md](supabase/README.md).

Files under `docs/*.sql` are supporting/reference SQL, not the canonical fresh
database history. New database changes should be added as a new migration and
committed with the application code that depends on them.

## Documentation

- [Architecture](docs/architecture.md)
- [Database design](docs/database-plan.md)
- [Deployment checklist](docs/deployment-checklist.md)
- [Regression checklist](docs/regression-checklist.md)

## Payment Boundary

JuneRose records order requests, reserves inventory after staff confirmation,
and supports the operational workflow of a real shop. Payment collection and
customer communication remain manual business processes outside this system.
