import Image from "next/image";
import {
  deleteProductImageAction,
  setMainProductImageAction,
  setProductImageColorAction,
} from "@/app/admin/products/image-actions";
import AdminProductImageActionForm from "@/components/AdminProductImageActionForm";
import AdminProductImageUploadForm from "@/components/AdminProductImageUploadForm";
import type { AdminProductImage } from "@/lib/admin-product-images";
import type { InternalProduct } from "@/types/product";
import type { ProductOption } from "@/lib/admin-product-options";

type AdminProductImagePanelProps = {
  images: AdminProductImage[];
  product: InternalProduct;
  message?: string;
  colors: ProductOption[];
};

export default function AdminProductImagePanel({
  images,
  product,
  message,
  colors,
}: AdminProductImagePanelProps) {
  const productColors = colors.filter((color) =>
    product.colors.includes(color.name),
  );
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

                <form action={setProductImageColorAction} className="grid gap-2">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="imageId" value={image.id} />
                  <label className="grid gap-1 text-xs text-[#6f6258]">
                    Image color
                    <select
                      name="colorId"
                      defaultValue={image.color_id ?? ""}
                      className="rounded-lg border border-[#d6c4aa] bg-white px-2 py-1 text-sm text-[#2f241d]"
                    >
                      <option value="">General</option>
                      {image.color_id !== null &&
                        !productColors.some((color) => color.id === image.color_id) && (
                          <option value={image.color_id}>{image.color_name}</option>
                        )}
                      {productColors.map((color) => (
                        <option key={color.id} value={color.id}>{color.name}</option>
                      ))}
                    </select>
                  </label>
                  <button type="submit" className="justify-self-start rounded-lg border border-[#9c7a4f] px-3 py-1 text-xs text-[#6d4c2f]">
                    Save color
                  </button>
                </form>

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

      <AdminProductImageUploadForm
        productId={product.id}
        colors={productColors}
      />
    </section>
  );
}
