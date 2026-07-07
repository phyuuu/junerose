import Image from "next/image";
import type { PublicProduct } from "@/types/product";
import {
  getExtraProductImages,
  getMainProductImage,
} from "@/lib/product-image";

type ProductGalleryProps = {
  product: PublicProduct;
};

export default function ProductGallery({ product }: ProductGalleryProps) {
  const extraImages = getExtraProductImages(product);

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#eadfce]">
        <Image
          src={getMainProductImage(product)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {extraImages.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {extraImages.map((image) => (
            <div
              key={image}
              className="relative aspect-square overflow-hidden rounded-xl border border-[#eadfce] bg-white"
            >
              <Image
                src={image}
                alt={product.name}
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}