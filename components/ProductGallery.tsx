"use client";

import Image from "next/image";
import type { PublicProduct } from "@/types/product";
import { getMainProductImage } from "@/lib/product-image";

type ProductGalleryProps = {
  product: PublicProduct;
  selectedImageIndex: number;
  onImageIndexChange: (index: number | ((current: number) => number)) => void;
};

export default function ProductGallery({
  product,
  selectedImageIndex,
  onImageIndexChange,
}: ProductGalleryProps) {
  const images = product.images;
  const selectedImage = images[selectedImageIndex]?.url ?? getMainProductImage(product);

  function showPreviousImage() {
    onImageIndexChange((current) =>
      current === 0 ? Math.max(images.length - 1, 0) : current - 1,
    );
  }

  function showNextImage() {
    onImageIndexChange((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  }

  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#eadfce]">
        <Image
          src={selectedImage}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          loading="eager"
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#2f241d] shadow-sm transition hover:bg-white"
              aria-label="View previous product image"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                &lsaquo;
              </span>
            </button>

            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-[#2f241d] shadow-sm transition hover:bg-white"
              aria-label="View next product image"
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                &rsaquo;
              </span>
            </button>

            <div className="absolute bottom-3 left-1/2 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-[#2f241d] shadow-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
