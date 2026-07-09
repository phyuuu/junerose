import AdminNotice from "@/components/AdminNotice";
import AdminProductTable from "@/components/AdminProductTable";
import AdminShell from "@/components/AdminShell";
import AdminSummaryCard from "@/components/AdminSummaryCard";
import SectionHeader from "@/components/SectionHeader";
import { getAdminProducts } from "@/lib/admin-products";
import { getAdminProductSummary } from "@/lib/admin-product-summary";

export default function AdminProductsPage() {
  const products = getAdminProducts();
  const summary = getAdminProductSummary(products);

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            eyebrow="STAFF AREA"
            title="Products"
            description="Staff will be able to add products, edit prices, upload photos, hide unavailable items, and manage public product information."
          />

          <button
            type="button"
            disabled
            title="Product creation will be enabled after database, authentication, and protected admin actions are added."
            className="w-fit rounded-xl bg-[#8b5e3c] px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            + Add product
          </button>
        </div>

        <div className="mt-6">
          <AdminNotice title="Temporary admin page">
            This page is not protected by authentication yet. It is currently
            used for local development only. Before real use, admin
            authentication must be added so customer users cannot access
            internal product data.
          </AdminNotice>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
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

        <div className="mt-8">
          <AdminProductTable products={products} />
        </div>

        <p className="mt-4 text-xs leading-5 text-[#8a7a6d]">
          This is an internal staff view. Product code and exact stock details
          are shown here, but they are not exposed on customer-facing product
          pages. Total stock is calculated from the size/color stock rows.
        </p>
      </section>
    </AdminShell>
  );
}