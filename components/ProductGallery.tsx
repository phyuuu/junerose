"use client";

import Image from "next/image";
import { getMainProductImage } from "@/lib/product-image";
import type { PublicProduct } from "@/types/product";

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
  const selectedImage =
    images[selectedImageIndex]?.url ?? getMainProductImage(product);

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
    <div className="min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] bg-[#f3f0ee]">
        <Image
          src={selectedImage}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          priority
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center bg-white/90 text-[#211d1b] shadow-sm transition-colors hover:bg-white"
              aria-label="View previous product image"
            >
              <span aria-hidden="true" className="text-2xl leading-none">‹</span>
            </button>

            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center bg-white/90 text-[#211d1b] shadow-sm transition-colors hover:bg-white"
              aria-label="View next product image"
            >
              <span aria-hidden="true" className="text-2xl leading-none">›</span>
            </button>

            <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-2 text-xs font-medium text-[#211d1b] shadow-sm">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => onImageIndexChange(index)}
              aria-label={`View product image ${index + 1}${
                image.colorName ? ` for ${image.colorName}` : ""
              }`}
              aria-pressed={selectedImageIndex === index}
              className={`relative aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-[3px] border-2 sm:w-24 ${
                selectedImageIndex === index
                  ? "border-[#b62568]"
                  : "border-transparent hover:border-[#cfc8c4]"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
