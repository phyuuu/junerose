import Image from "next/image";
import type { InternalProduct } from "@/types/product";
import { formatMMK } from "@/lib/formatPrice";
import { getMainProductImage } from "@/lib/product-image";
import {
  calculateTotalStock,
  isProductStockConsistent,
} from "@/lib/product-stock";
import AdminStatusBadge from "./AdminStatusBadge";
import AdminProductArchiveButton from "@/components/AdminProductArchiveButton";
import AdminProductVisibilityButton from "@/components/AdminProductVisibilityButton";
import Link from "next/link";

type AdminProductTableProps = {
  products: InternalProduct[];
};

export default function AdminProductTable({
  products,
}: AdminProductTableProps) {
  return (
    <div className="overflow-hidden rounded-[4px] border border-[#d7dadd] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="bg-[#f1f2f3] text-xs uppercase text-[#686360]">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Classification</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Availability</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e5e7e9]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-[#6c6764]">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="align-top hover:bg-[#fafbfb]">
                  <td className="px-4 py-3">
                    <div className="flex min-w-[220px] items-start gap-3">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-[3px] bg-[#f1f2f3]">
                        <Image
                          src={getMainProductImage(product)}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-[#242220]">
                          {product.name}
                        </p>
                        <div className="mt-2">
                          <AdminStatusBadge
                            label={product.isVisible ? "Visible" : "Hidden"}
                            tone={product.isVisible ? "green" : "gray"}
                          />
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs text-[#5f5a57]">
                    {product.code}
                  </td>

                  <td className="px-4 py-3">
                    <p>{product.department.name}</p>
                    <p className="mt-1 text-xs text-[#6c6764]">
                      {product.productType.name}
                    </p>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatMMK(product.priceMMK)}
                  </td>

                  <td className="px-4 py-3">
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
                  </td>

                  <td className="px-4 py-3">
                    <details className="min-w-[150px]">
                      <summary className="cursor-pointer text-sm font-medium text-[#242220]">
                        {calculateTotalStock(product.stockItems)} total
                      </summary>

                      {!isProductStockConsistent(product) && (
                        <p className="mt-2 text-xs font-medium text-red-700">
                          Stock mismatch
                        </p>
                      )}

                      <div className="mt-2 space-y-1 text-xs text-[#6c6764]">
                        {product.stockItems.length > 0 ? (
                          product.stockItems.map((item, index) => (
                            <p key={`${item.size}-${item.color}-${index}`}>
                              {item.size} / {item.color}: {item.quantity}
                            </p>
                          ))
                        ) : (
                          <p>No stock rows</p>
                        )}
                      </div>
                    </details>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex min-w-[210px] flex-wrap gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex min-h-9 items-center rounded-[4px] border border-[#cfd3d6] px-3 text-xs font-medium hover:bg-[#f1f2f3]"
                      >
                        Edit
                      </Link>

                      <AdminProductVisibilityButton
                        productId={product.id}
                        isVisible={product.isVisible}
                        productName={product.name}
                      />

                      <AdminProductArchiveButton
                        productId={product.id}
                        productName={product.name}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
