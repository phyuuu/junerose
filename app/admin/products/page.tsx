import Link from "next/link";
import AdminProductTable from "@/components/AdminProductTable";
import AdminProductFilters from "@/components/AdminProductFilters";
import AdminShell from "@/components/AdminShell";
import AdminSummaryCard from "@/components/AdminSummaryCard";
import SectionHeader from "@/components/SectionHeader";
import { getAdminProducts } from "@/lib/admin-products";
import { getAdminProductSummary } from "@/lib/admin-product-summary";
import {
  filterAdminProducts,
  parseAdminProductFilters,
} from "@/lib/admin-product-filters";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";

type AdminProductsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireStaff();

  const [products, resolvedSearchParams] = await Promise.all([
    getAdminProducts(),
    searchParams,
  ]);
  const filters = parseAdminProductFilters(resolvedSearchParams);
  const filteredProducts = filterAdminProducts(products, filters);
  const summary = getAdminProductSummary(products);

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            eyebrow="STAFF AREA"
            title="Products"
            description="Manage public listings, variants, images, visibility, and exact stock."
          />

          <div className="flex flex-wrap gap-2">
            <Link
              href={routes.adminArchivedProducts}
              className="inline-flex min-h-10 items-center rounded-[4px] border border-[#cfd3d6] bg-white px-4 text-sm font-medium text-[#4f4a47] hover:border-[#9ea3a7]"
            >
              Archived products
            </Link>

            <Link
              href={routes.adminProductNew}
              className="inline-flex min-h-10 items-center rounded-[4px] bg-[#211f1e] px-4 text-sm font-medium text-white hover:bg-[#b62568]"
            >
              Add product
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <AdminSummaryCard
            label="Total products"
            value={summary.totalProductCount}
            href={routes.adminProducts}
            active={
              !filters.search &&
              filters.visibility === "all" &&
              filters.stock === "all"
            }
          />
          <AdminSummaryCard
            label="Visible products"
            value={summary.visibleProductCount}
            href={`${routes.adminProducts}?visibility=visible`}
            active={filters.visibility === "visible"}
          />
          <AdminSummaryCard
            label="Hidden products"
            value={summary.hiddenProductCount}
            href={`${routes.adminProducts}?visibility=hidden`}
            active={filters.visibility === "hidden"}
          />
          <AdminSummaryCard label="Total stock" value={summary.totalStock} />
          <AdminSummaryCard
            label="Needs restock"
            value={summary.needsRestockProductCount}
            href={`${routes.adminProducts}?stock=needs_restock`}
            active={filters.stock === "needs_restock"}
          />
        </div>

        <div className="mt-6 space-y-4">
          <AdminProductFilters
            filters={filters}
            resultCount={filteredProducts.length}
            totalCount={products.length}
          />
          <AdminProductTable
            products={filteredProducts}
            emptyMessage="No products match these filters."
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-[#6c6764]">
          This is an internal staff view. Product code and exact stock details
          are shown here, but they are not exposed on customer-facing product
          pages. Total stock is calculated from the size/color stock rows.
        </p>
      </section>
    </AdminShell>
  );
}
