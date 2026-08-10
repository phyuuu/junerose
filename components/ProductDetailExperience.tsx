"use client";

import { useState, type ReactNode } from "react";
import ProductGallery from "@/components/ProductGallery";
import ProductOptions from "@/components/ProductOptions";
import type { PublicProduct } from "@/types/product";

export default function ProductDetailExperience({
  product,
  initialColor,
  children,
}: {
  product: PublicProduct;
  initialColor?: string;
  children: ReactNode;
}) {
  const availableInitialColor = product.colors.find(
    (color) =>
      color.toLowerCase() === initialColor?.toLowerCase() &&
      product.variants.some(
        (variant) => variant.color === color && variant.isAvailable,
      ),
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    availableInitialColor ?? null,
  );
  const initialImageIndex = availableInitialColor
    ? product.images.findIndex(
        (image) =>
          image.colorName?.toLowerCase() === availableInitialColor.toLowerCase(),
      )
    : 0;
  const [selectedImageIndex, setSelectedImageIndex] = useState(
    Math.max(initialImageIndex, 0),
  );

  function selectColor(color: string | null) {
    setSelectedColor(color);
    if (!color) return;

    const colorImageIndex = product.images.findIndex(
      (image) => image.colorName?.toLowerCase() === color.toLowerCase(),
    );
    if (colorImageIndex >= 0) setSelectedImageIndex(colorImageIndex);
  }

  return (
    <div className="grid gap-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-14 xl:gap-20">
      <ProductGallery
        product={product}
        selectedImageIndex={selectedImageIndex}
        onImageIndexChange={setSelectedImageIndex}
      />
      <aside className="self-start lg:sticky lg:top-28">
        {children}
        <ProductOptions
          product={product}
          selectedColor={selectedColor}
          onColorChange={selectColor}
        />
        <div className="mt-8 border-t border-[#e7e1de] pt-5 text-xs leading-6 text-[#6f6864]">
          Availability, final total, and pickup or delivery details are confirmed
          after the order request is received.
        </div>
      </aside>
    </div>
  );
}
