import Image from "next/image";
import AdminShell from "../../../components/AdminShell";
import SectionHeader from "../../../components/SectionHeader";
import AdminNotice from "../../../components/AdminNotice";
import AdminProductCreatePanel from "../../../components/AdminProductCreatePanel";
import { getAdminProducts } from "../../../lib/admin-products";
import { formatMMK } from "../../../lib/formatPrice";
import { getMainProductImage } from "../../../lib/product-image";
import {
  calculateTotalStock,
  isProductStockConsistent,
} from "../../../lib/product-stock";

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
          <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-4">
            <p className="text-sm text-[#8a7a6d]">Total products</p>
            <p className="mt-1 text-2xl font-semibold text-[#3f342b]">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-4">
            <p className="text-sm text-[#8a7a6d]">Visible products</p>
            <p className="mt-1 text-2xl font-semibold text-[#3f342b]">
              {visibleProductCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-4">
            <p className="text-sm text-[#8a7a6d]">Hidden products</p>
            <p className="mt-1 text-2xl font-semibold text-[#3f342b]">
              {hiddenProductCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-4">
            <p className="text-sm text-[#8a7a6d]">Total stock</p>
            <p className="mt-1 text-2xl font-semibold text-[#3f342b]">
              {totalStock}
            </p>
          </div>

          <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-4">
            <p className="text-sm text-[#8a7a6d]">Low stock products</p>
            <p className="mt-1 text-2xl font-semibold text-[#3f342b]">
              {lowStockProductCount}
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
          <div className="grid min-w-[900px] grid-cols-[80px_1.4fr_1fr_1fr_1fr_1.2fr] bg-[#eadfce] px-4 py-3 text-sm font-semibold text-[#6f6258]">
            <div>Image</div>
            <div>Name</div>
            <div>Code</div>
            <div>Category</div>
            <div>Price</div>
            <div>Stock details</div>
          </div>

          {products.length === 0 ? (
            <div className="min-w-[900px] border-t border-[#d6c4aa] px-4 py-6 text-sm text-[#8a7a6d]">
              No products found.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="grid min-w-[900px] grid-cols-[80px_1.4fr_1fr_1fr_1fr_1.2fr] border-t border-[#d6c4aa] px-4 py-3 text-sm text-[#3f342b]"
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-[#eadfce]">
                  <Image
                    src={getMainProductImage(product)}
                    alt={product.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="mt-1 text-xs text-[#8a7a6d]">
                    {product.isVisible
                      ? "Visible to customers"
                      : "Hidden from customers"}
                  </p>
                </div>

                <div>{product.code}</div>
                <div>{product.category}</div>
                <div>{formatMMK(product.priceMMK)}</div>

                <div>
                  <p className="font-medium">
                    Total: {calculateTotalStock(product.stockItems)}
                  </p>

                  {!isProductStockConsistent(product) && (
                    <p className="mt-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
                      Stock mismatch
                    </p>
                  )}

                  <div className="mt-2 space-y-1 text-xs text-[#8a7a6d]">
                    {product.stockItems.length > 0 ? (
                      product.stockItems.map((item, index) => (
                        <p
                          key={`${item.size}-${item.color}-${index}`}
                          className="rounded-lg bg-white/70 px-2 py-1"
                        >
                          {item.size} / {item.color}: {item.quantity}
                        </p>
                      ))
                    ) : (
                      <p className="rounded-lg bg-white/70 px-2 py-1">
                        No stock rows
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
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