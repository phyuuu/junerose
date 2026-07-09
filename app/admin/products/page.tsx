import AdminShell from "../../../components/AdminShell";
import SectionHeader from "../../../components/SectionHeader";
import AdminNotice from "../../../components/AdminNotice";
import AdminProductCreatePanel from "../../../components/AdminProductCreatePanel";
import AdminSummaryCard from "../../../components/AdminSummaryCard";
import AdminProductTable from "../../../components/AdminProductTable";
import { getAdminProducts } from "../../../lib/admin-products";
import { calculateTotalStock } from "../../../lib/product-stock";

export default function AdminProductsPage() {
  const products = getAdminProducts();

  const visibleProductCount = products.filter(
    (product) => product.isVisible
  ).length;

  const hiddenProductCount = products.filter(
    (product) => !product.isVisible
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + calculateTotalStock(product.stockItems),
    0
  );

  const lowStockProductCount = products.filter((product) => {
    const stock = calculateTotalStock(product.stockItems);

    return stock > 0 && stock <= 5;
  }).length;

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Products"
          description="Staff will be able to add products, edit prices, upload photos, hide unavailable items, and manage public product information."
        />

        <AdminProductCreatePanel />

        <div className="mt-6">
          <AdminNotice title="Temporary admin page">
            This page is not protected by authentication yet. It is currently
            used for local development only. Before real use, admin
            authentication must be added so customer users cannot access
            internal product data.
          </AdminNotice>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <AdminSummaryCard label="Total products" value={products.length} />
          <AdminSummaryCard
            label="Visible products"
            value={visibleProductCount}
          />
          <AdminSummaryCard
            label="Hidden products"
            value={hiddenProductCount}
          />
          <AdminSummaryCard label="Total stock" value={totalStock} />
          <AdminSummaryCard
            label="Low stock products"
            value={lowStockProductCount}
          />
        </div>

        <AdminProductTable products={products} />

        <p className="mt-4 text-xs leading-5 text-[#8a7a6d]">
          This is an internal staff view. Product code and exact stock details
          are shown here, but they are not exposed on customer-facing product
          pages. Total stock is calculated from the size/color stock rows.
        </p>
      </section>
    </AdminShell>
  );
}