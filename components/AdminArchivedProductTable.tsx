import Image from "next/image";
import AdminProductRestoreButton from "@/components/AdminProductRestoreButton";
import AdminStatusBadge from "@/components/AdminStatusBadge";
import { formatMMK } from "@/lib/formatPrice";
import { getMainProductImage } from "@/lib/product-image";
import type { InternalProduct } from "@/types/product";

type AdminArchivedProductTableProps = {
  products: InternalProduct[];
};

export default function AdminArchivedProductTable({
  products,
}: AdminArchivedProductTableProps) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
      <div className="grid min-w-[900px] grid-cols-[80px_1.6fr_1fr_1fr_1fr_1fr] bg-[#eadfce] px-4 py-3 text-sm font-semibold text-[#6f6258]">
        <div>Image</div>
        <div>Name</div>
        <div>Code</div>
        <div>Department / Type</div>
        <div>Price</div>
        <div>Actions</div>
      </div>

      {products.length === 0 ? (
        <div className="min-w-[900px] border-t border-[#d6c4aa] px-4 py-6 text-sm text-[#8a7a6d]">
          No archived products.
        </div>
      ) : (
        products.map((product) => (
          <div
            key={product.id}
            className="grid min-w-[900px] grid-cols-[80px_1.6fr_1fr_1fr_1fr_1fr] border-t border-[#d6c4aa] px-4 py-3 text-sm text-[#3f342b]"
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
                <AdminStatusBadge label="Archived" tone="gray" />
              </div>
            </div>

            <div>{product.code}</div>

            <div>{product.department.name} / {product.productType.name}</div>

            <div>{formatMMK(product.priceMMK)}</div>

            <div className="flex flex-wrap gap-2">
              <AdminProductRestoreButton
                productId={product.id}
                productName={product.name}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
