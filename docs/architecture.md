# JuneRose Architecture

JuneRose is a catalog-based e-commerce website for a physical retail shop.

The website allows customers to browse products, add items to cart, and submit an order request. It does not process online payments. Payment and final confirmation are handled manually by staff.

## Main Design Goals

- Keep the customer experience simple and elegant.
- Allow customers to browse products like an online shop.
- Generate an order number after order request submission.
- Let staff later search and manage orders by order number.
- Separate public customer data from private staff/internal data.
- Keep the codebase clean and portfolio-quality.

## Public Customer Pages

These pages are visible to customers:

- `/`
- `/catalog`
- `/product/[slug]`
- `/cart`
- `/order`
- `/order-success/[orderNumber]`

Customers can see:

- Product name
- Product image
- Selling price
- Category
- Available sizes
- Available colors
- Cart items
- Order number
- Their own submitted order summary

Customers must not see:

- Internal product code
- Cost price
- Supplier information
- Exact stock quantity
- Staff notes
- Admin order management data

## Admin Pages

These pages are for staff:

- `/admin`
- `/admin/orders`
- `/admin/products`

Admin pages will later be protected by login.

Until authentication is added, real private business data should not be displayed on admin pages in production.

## Data Exposure Rule

The project separates product data into two layers:

### InternalProduct

Used for staff/admin/business logic.

May contain:

- Internal product code
- Staff-only product fields
- Future supplier/cost/stock data

### PublicProduct

Used for customer-facing pages.

Contains only safe public data:

- Product id
- Slug
- Name
- Price
- Category
- Image
- Sizes
- Colors

Customer pages should use `PublicProduct`, not `InternalProduct`.

## Folder Structure

```txt
app/          Pages and routes
components/   Reusable UI components
data/         Temporary product/category data
types/        TypeScript data shapes
lib/          Business/helper logic
public/       Static images
docs/         Project documentation


 ## Product Image Upload Plan

During the early prototype stage, product images are stored manually in `public/products`
and referenced from `data/products.ts`.

Later, when database and admin authentication are added, images should be uploaded
from the admin website instead of manually adding files to the project.

Planned flow:

1. Admin selects one or more image files in the product form.
2. The admin UI sends the files to a protected upload API route.
3. The upload API validates that the user is an admin.
4. The upload API validates the image type and size.
5. The image is uploaded to external storage.
6. The storage provider returns a public image URL.
7. The product record stores the image URLs in `images: string[]`.
8. Customer pages receive only public-safe image URLs.

Customer-safe product data may include:
- name
- slug
- price
- description
- category
- images
- public availability status

Admin-only data must not be exposed publicly:
- product code
- exact stock
- supplier
- cost price
- staff notes