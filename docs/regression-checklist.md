# JuneRose Regression Checklist

Use a dedicated test product and customer details that are not real personal
data. Check desktop and a narrow mobile viewport.

## Customer workflow

- [ ] Home and catalog load visible products without exposing exact stock.
- [ ] Category filters show the correct products.
- [ ] Product galleries, main images, and navigation arrows work.
- [ ] Only real size/color combinations can be selected.
- [ ] Unavailable colors remain visible and disabled.
- [ ] Sold-out variants cannot be added to the cart.
- [ ] Cart add, quantity change, item removal, and total calculation work.
- [ ] An empty cart blocks order submission.
- [ ] Contact validation rejects missing or invalid values.
- [ ] Order submission requires acknowledgement of the privacy notice.
- [ ] The privacy page and footer link work on desktop and mobile.
- [ ] Order creation ignores browser prices and returns a new order number.
- [ ] The success page shows details after the immediate redirect.
- [ ] Opening the success URL without access requires phone verification.
- [ ] Order lookup fails when either order number or phone is wrong.
- [ ] Order lookup succeeds when both values match.
- [ ] Customer pages have no horizontal overflow or browser console errors.

## Admin authentication and privacy

- [ ] An unauthenticated user is redirected to `/admin/login`.
- [ ] A valid Auth user without an active `staff_users` row is denied.
- [ ] Active staff can sign in and sign out.
- [ ] Customer pages never display product codes, exact quantities, staff notes,
      customer lists, or inventory history.
- [ ] Admin failures show safe messages and reference IDs without database detail.

## Product and inventory workflow

- [ ] Staff can create a hidden draft product.
- [ ] Duplicate product code/slug and duplicate variants are rejected safely.
- [ ] Staff can edit product information and add size/color variants.
- [ ] Image upload validates file type and the 5 MB limit.
- [ ] Staff can change the main image and delete a non-required image.
- [ ] A product without an image cannot be published.
- [ ] A product without an in-stock variant cannot be published.
- [ ] Archive removes a product from the catalog; restore keeps it hidden.
- [ ] Adding a variant with positive initial quantity creates one inventory
      history entry under the acting staff account.
- [ ] Manual stock adjustment updates quantity and inventory history once.
- [ ] Inventory history shows the acting account's current display name while
      retaining its UUID in the database record.
- [ ] Reusable size/color options can be sorted and deactivated safely.

## Order and stock workflow

- [ ] Order search, status, date, sorting, reset, and pagination work together.
- [ ] Choosing a date applies immediately; search and status wait for Apply.
- [ ] Order details show immutable item snapshots and customer information.
- [ ] Internal notes can be added, edited, and deleted by staff only.
- [ ] The Data Retention page is denied to non-staff users.
- [ ] Privacy-request lookup requires a matching order number and phone number.
- [ ] Active orders cannot be anonymized; staff must complete or cancel them.
- [ ] Single-order anonymization requires the exact confirmation text.
- [ ] Only the selected test order has contact fields and notes anonymized while
      item, total, status, order number, and inventory history remain.
- [ ] The 12-month dashboard performs no bulk or automatic anonymization.
- [ ] Pending to confirmed reserves stock exactly once.
- [ ] Confirmed/preparing/ready/completed transitions do not reserve twice.
- [ ] Cancelling a reserved order releases stock exactly once.
- [ ] Cancelling a pending order does not change stock.
- [ ] Invalid status transitions show a business-safe message.
- [ ] Reserve, release, and manual changes appear in inventory history.

## Staff authorization

- [ ] Active admin and staff accounts can sign in; inactive accounts are signed
      out with a safe access message.
- [ ] Staff can manage catalog, inventory, orders, notes, and privacy requests.
- [ ] Staff cannot see or open Staff Access.
- [ ] Admin can add access for an existing Auth user and deactivate/reactivate a
      staff account.
- [ ] Admin can set and edit staff display names; staff still sign in by email.
- [ ] Admin access is protected from deactivation through the website.
- [ ] Anonymous and non-staff authenticated requests cannot write application
      tables or Storage objects directly.

## Final technical checks

- [ ] `npm run check` passes.
- [ ] `npm run build` passes.
- [ ] `npm audit` is reviewed.
- [ ] Required security headers are present on a production response.
- [ ] Supabase Security Advisor is reviewed after migrations.
- [ ] No unexpected personal data appears in browser or server logs.
