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
    <>
      <ProductGallery
        product={product}
        selectedImageIndex={selectedImageIndex}
        onImageIndexChange={setSelectedImageIndex}
      />
      <div className="max-w-md">
        {children}
        <ProductOptions
          product={product}
          selectedColor={selectedColor}
          onColorChange={selectColor}
        />
      </div>
    </>
  );
}
