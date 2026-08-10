"use client";

import Link from "next/link";
import { useState } from "react";
import { addCartItem } from "@/lib/cartStorage";
import { getColorSwatchHex } from "@/lib/color-swatch";
import { getProductImageForColor } from "@/lib/product-image";
import { routes } from "@/lib/routes";
import type { PublicProduct } from "@/types/product";

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
              (variant) =>
                variant.color === selectedColor && variant.isAvailable,
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
    if (!selectedSize || !selectedColor || !selectedVariant) return;

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
    <div className="mt-8 space-y-8">
      <fieldset>
        <legend className="flex w-full items-center justify-between gap-4 text-xs font-semibold uppercase">
          <span>Color</span>
          {selectedColor && (
            <span className="font-normal normal-case text-[#6f6864]">
              {selectedColor}
            </span>
          )}
        </legend>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {product.colors.map((color) => {
            const isAvailable = availableColors.includes(color);
            const isSelected = selectedColor === color;

            return (
              <button
                key={color}
                type="button"
                disabled={!isAvailable}
                aria-pressed={isSelected}
                onClick={() => {
                  onColorChange(color);
                  setSelectedSize(null);
                  setMessage("");
                }}
                className={`flex min-h-11 items-center gap-2 rounded-[4px] border px-3 text-sm transition-colors disabled:cursor-not-allowed ${
                  isSelected
                    ? "border-[#b62568] bg-[#f8edf2] text-[#8f1f58]"
                    : isAvailable
                      ? "border-[#d8d2cf] hover:border-[#b62568]"
                      : "border-[#e7e1de] text-[#a6a09c] opacity-60"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="size-4 shrink-0 rounded-full border border-black/15"
                  style={{ backgroundColor: getColorSwatchHex(color) }}
                />
                <span className={!isAvailable ? "line-through" : undefined}>{color}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="flex w-full items-center justify-between gap-4 text-xs font-semibold uppercase">
          <span>Size</span>
          {selectedSize && (
            <span className="font-normal normal-case text-[#6f6864]">
              {selectedSize}
            </span>
          )}
        </legend>

        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => {
            const isAvailable =
              selectedColor !== null && availableSizes.includes(size);
            const isSelected = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                disabled={!isAvailable}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedSize(size);
                  setMessage("");
                }}
                className={`flex min-h-11 min-w-12 items-center justify-center rounded-[4px] border px-3 text-sm transition-colors disabled:cursor-not-allowed ${
                  isSelected
                    ? "border-[#211d1b] bg-[#211d1b] text-white"
                    : isAvailable
                      ? "border-[#d8d2cf] hover:border-[#211d1b]"
                      : "border-[#e7e1de] text-[#aaa4a0] opacity-60"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>

        {!selectedColor && (
          <p className="mt-3 text-sm text-[#6f6864]">Select a color to see its sizes.</p>
        )}
      </fieldset>

      <div>
        <button
          type="button"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="flex min-h-13 w-full items-center justify-center bg-[#211d1b] px-6 text-sm font-medium text-white transition-colors hover:bg-[#b62568] disabled:cursor-not-allowed disabled:bg-[#bcb6b2]"
        >
          {product.availability === "Sold out" ? "Sold out" : "Add to cart"}
        </button>

        {message && (
          <div className="mt-3 flex min-h-12 items-center justify-between gap-4 bg-[#f8edf2] px-4 py-3">
            <p className="text-sm text-[#6f6864]">{message}</p>
            <Link
              href={routes.cart}
              className="shrink-0 border-b border-[#8f1f58] pb-0.5 text-xs font-medium uppercase text-[#8f1f58]"
            >
              View cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
