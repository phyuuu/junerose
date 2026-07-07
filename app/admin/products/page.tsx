import AdminShell from "../../../components/AdminShell";
import SectionHeader from "../../../components/SectionHeader";
import { getAdminProducts } from "../../../lib/admin-products";
import { formatMMK } from "../../../lib/formatPrice";
import AdminNotice from "../../../components/AdminNotice";
import AdminProductFormPlaceholder from "../../../components/AdminProductFormPlaceholder";

export default function AdminProductsPage() {
  const products = getAdminProducts();

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Products"
          description="Staff will be able to add products, edit prices, upload photos, hide unavailable items, and manage public product information."
        />

        <div className="mt-6 flex justify-end">
          <button className="rounded-full bg-[#9c7a4f] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#7f623f]">
            Add product
          </button>
        </div>

        <div className="mt-6">
          <AdminProductFormPlaceholder />
        </div>

        <div className="mt-6">
          <AdminNotice title="Temporary admin page">
            This page is not protected by authentication yet. It is currently used for
            local development only. Before real use, admin authentication must be added
            so customer users cannot access internal product data.
          </AdminNotice>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] bg-[#eadfce] px-4 py-3 text-sm font-semibold text-[#6f6258]">
            <div>Name</div>
            <div>Code</div>
            <div>Category</div>
            <div>Price</div>
            <div>Stock</div>
          </div>

          {products.map((product) => (
            <div
              key={product.id}
              className="grid grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr] border-t border-[#d6c4aa] px-4 py-3 text-sm text-[#3f342b]"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="mt-1 text-xs text-[#8a7a6d]">
                  {product.isVisible ? "Visible to customers" : "Hidden from customers"}
                </p>
              </div>

              <div>{product.code}</div>
              <div>{product.category}</div>
              <div>{formatMMK(product.priceMMK)}</div>
              <div>{product.stockQty}</div>
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-[#8a7a6d]">
          This is an internal staff view. Product code and exact stock are shown
          here, but they are not exposed on customer-facing product pages.
        </p>
      </section>
    </AdminShell>
  );
}