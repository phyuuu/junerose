import Image from "next/image";
import type { InternalProduct } from "@/types/product";
import { formatMMK } from "@/lib/formatPrice";
import { getMainProductImage } from "@/lib/product-image";
import {
  calculateTotalStock,
  isProductStockConsistent,
} from "@/lib/product-stock";
import AdminStatusBadge from "./AdminStatusBadge";
import AdminTableActionButton from "@/components/AdminTableActionButton";

type AdminProductTableProps = {
  products: InternalProduct[];
};

export default function AdminProductTable({
  products,
}: AdminProductTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
      <div className="grid min-w-[1050px] grid-cols-[80px_1.4fr_1fr_1fr_1fr_1.2fr_1fr] bg-[#eadfce] px-4 py-3 text-sm font-semibold text-[#6f6258]">
        <div>Image</div>
        <div>Name</div>
        <div>Code</div>
        <div>Category</div>
        <div>Price</div>
        <div>Stock details</div>
        <div>Actions</div>
      </div>

      {products.length === 0 ? (
        <div className="min-w-[1050px] border-t border-[#d6c4aa] px-4 py-6 text-sm text-[#8a7a6d]">
          No products found.
        </div>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            className="grid min-w-[1050px] grid-cols-[80px_1.4fr_1fr_1fr_1fr_1.2fr_1fr] border-t border-[#d6c4aa] px-4 py-3 text-sm text-[#3f342b]"
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
              <div className="mt-2">
                <AdminStatusBadge
                  label={product.isVisible ? "Visible" : "Hidden"}
                  tone={product.isVisible ? "green" : "gray"}
                />
              </div>
            </div>

            <div>{product.code}</div>

            <div>
              <p>{product.category}</p>
              <div className="mt-2">
                <AdminStatusBadge
                  label={product.availability}
                  tone={
                    product.availability === "Available"
                      ? "green"
                      : product.availability === "Low stock"
                        ? "amber"
                        : "gray"
                  }
                />
              </div>
            </div>

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

            <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
                <AdminTableActionButton
                variant="primary"
                disabledReason="Product editing will be enabled after database, authentication, and protected admin actions are added."
                >
                Edit
                </AdminTableActionButton>

                <AdminTableActionButton
                disabledReason="Product visibility changes will be enabled after protected admin actions are added."
                >
                {product.isVisible ? "Hide" : "Show"}
                </AdminTableActionButton>
            </div>

            <p className="text-[11px] leading-4 text-slate-400">
                Disabled for local mock data.
            </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}