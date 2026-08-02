import Image from "next/image";
import {
  deleteProductImageAction,
  setMainProductImageAction,
  uploadProductImageAction,
} from "@/app/admin/products/image-actions";
import AdminProductImageActionForm from "@/components/AdminProductImageActionForm";
import type { AdminProductImage } from "@/lib/admin-product-images";
import type { InternalProduct } from "@/types/product";

type AdminProductImagePanelProps = {
  images: AdminProductImage[];
  product: InternalProduct;
  message?: string;
};

export default function AdminProductImagePanel({
  images,
  product,
  message,
}: AdminProductImagePanelProps) {
  return (
    <section className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
      <h2 className="text-lg font-semibold">Product images</h2>

      <p className="mt-2 text-sm text-[#6f6258]">
        Upload customer-facing product photos. The first image is used as the main catalog image.
      </p>

      {message && (
        <p className="mt-4 rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm text-[#6d4c2f]">
          {message}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.length > 0 ? (
          images.map((image, index) => (
            <div
              key={image.id}
              className="overflow-hidden rounded-xl border border-[#d6c4aa] bg-white"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={image.image_url}
                  alt={`${product.name} image ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>

              <div className="space-y-3 px-3 py-3">
                <p className="text-xs text-[#6f6258]">
                  {index === 0 ? "Main image" : `Image ${index + 1}`}
                </p>

                <div className="flex flex-wrap gap-2">
                  {index !== 0 && (
                    <AdminProductImageActionForm
                      action={setMainProductImageAction}
                      productId={product.id}
                      imageId={image.id}
                      label="Set main"
                      variant="normal"
                      confirmMessage="Set this as the main product image?"
                    />
                  )}

                  <AdminProductImageActionForm
                    action={deleteProductImageAction}
                    productId={product.id}
                    imageId={image.id}
                    label="Delete"
                    variant="danger"
                    confirmMessage="Delete this product image permanently?"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-[#d6c4aa] bg-white px-4 py-6 text-sm text-[#8a7a6d]">
            No product images uploaded yet.
          </p>
        )}
      </div>

      <form
        action={uploadProductImageAction}
        className="mt-6 grid gap-4 rounded-xl border border-[#d6c4aa] bg-white p-4 md:grid-cols-[1fr_auto] md:items-end"
      >
        <input type="hidden" name="productId" value={product.id} />

        <label className="grid gap-1 text-sm">
          Upload image
          <input
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="rounded-xl border border-[#d6c4aa] px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-[#2f241d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a382c]"
        >
          Upload image
        </button>
      </form>
    </section>
  );
}
