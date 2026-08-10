import Link from "next/link";
import AdminProductTable from "@/components/AdminProductTable";
import AdminShell from "@/components/AdminShell";
import AdminSummaryCard from "@/components/AdminSummaryCard";
import SectionHeader from "@/components/SectionHeader";
import { getAdminProducts } from "@/lib/admin-products";
import { getAdminProductSummary } from "@/lib/admin-product-summary";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";

export default async function AdminProductsPage() {
  await requireStaff();

  const products = await getAdminProducts();
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
          />
          <AdminSummaryCard
            label="Visible products"
            value={summary.visibleProductCount}
          />
          <AdminSummaryCard
            label="Hidden products"
            value={summary.hiddenProductCount}
          />
          <AdminSummaryCard label="Total stock" value={summary.totalStock} />
          <AdminSummaryCard
            label="Low stock products"
            value={summary.lowStockProductCount}
          />
        </div>

        <div className="mt-6">
          <AdminProductTable products={products} />
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
