"use client";

import Link from "next/link";
import { useState } from "react";
import { addCartItem } from "@/lib/cartStorage";
import { routes } from "@/lib/routes";
import type { PublicProduct } from "@/types/product";
import { getProductImageForColor } from "@/lib/product-image";

type ProductOptionsProps = {
  product: PublicProduct;
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
};

export default function ProductOptions({
  product,
  selectedColor,
  onColorChange,
}: ProductOptionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const availableColors = [
    ...new Set(
      product.variants
        .filter((variant) => variant.isAvailable)
        .map((variant) => variant.color),
    ),
  ];
  const availableSizes = selectedColor
    ? [
        ...new Set(
          product.variants
            .filter(
              (variant) => variant.color === selectedColor && variant.isAvailable,
            )
            .map((variant) => variant.size),
        ),
      ]
    : [];
  const selectedVariant = product.variants.find(
    (variant) =>
      variant.size === selectedSize &&
      variant.color === selectedColor &&
      variant.isAvailable,
  );
  const canAddToCart = selectedVariant !== undefined;

  function handleAddToCart() {
    if (!selectedSize || !selectedColor || !selectedVariant) {
      return;
    }

    addCartItem({
      variantId: selectedVariant.variantId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceMMK: product.priceMMK,
      image: getProductImageForColor(product, selectedColor),
      selectedSize,
      selectedColor,
      quantity: 1,
    });

    setMessage("Added to cart.");
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="text-sm font-medium">Choose Color</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {product.colors.map((color) => {
            const isAvailable = availableColors.includes(color);

            return (
              <button
                key={color}
                type="button"
                disabled={!isAvailable}
                aria-pressed={selectedColor === color}
                onClick={() => {
                  onColorChange(color);
                  setSelectedSize(null);
                  setMessage("");
                }}
                className={`rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed ${
                  selectedColor === color
                    ? "border-[#2f241d] bg-[#2f241d] text-[#f8f3eb]"
                    : isAvailable
                      ? "border-[#d6c4aa] text-[#2f241d] hover:border-[#9c7a4f]"
                      : "border-[#e4d6c3] text-[#b8aa98] opacity-60"
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Choose Size</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const isAvailable = selectedColor !== null && availableSizes.includes(size);

            return (
              <button
                key={size}
                type="button"
                disabled={!isAvailable}
                aria-pressed={selectedSize === size}
                onClick={() => {
                  setSelectedSize(size);
                  setMessage("");
                }}
                className={`rounded-full border px-4 py-2 text-sm transition disabled:cursor-not-allowed ${
                  selectedSize === size
                    ? "border-[#2f241d] bg-[#2f241d] text-[#f8f3eb]"
                    : isAvailable
                      ? "border-[#d6c4aa] text-[#2f241d] hover:border-[#9c7a4f]"
                      : "border-[#e4d6c3] text-[#b8aa98] opacity-60"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        {!selectedColor && (
          <p className="mt-3 text-sm text-[#8a7a6d]">
            Select a color first.
          </p>
        )}
      </div>

      <div>
        <button
          type="button"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="rounded-full bg-[#2f241d] px-6 py-3 text-sm text-[#f8f3eb] hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:bg-[#b8aa98]"
        >
          {product.availability === "Sold out" ? "Sold out" : "Add to Cart"}
        </button>

        {message && (
          <div className="mt-3 flex items-center gap-4">
            <p className="text-sm text-[#6f6258]">{message}</p>

            <Link
              href={routes.cart}
              className="text-sm text-[#9c7a4f] hover:underline"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
