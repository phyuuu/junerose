"use client";

import Link from "next/link";
import { useState } from "react";
import { addCartItem } from "@/lib/cartStorage";
import { routes } from "@/lib/routes";
import type { PublicProduct } from "@/types/product";
import { getMainProductImage } from "@/lib/product-image";

type ProductOptionsProps = {
  product: PublicProduct;
};

export default function ProductOptions({ product }: ProductOptionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const canAddToCart = selectedSize !== null && selectedColor !== null;

  function handleAddToCart() {
    if (!selectedSize || !selectedColor) {
      return;
    }

    addCartItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      priceMMK: product.priceMMK,
      image: getMainProductImage(product),
      selectedSize,
      selectedColor,
      quantity: 1,
    });

    setMessage("Added to cart.");
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="text-sm font-medium">Choose Size</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setSelectedSize(size);
                setMessage("");
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedSize === size
                  ? "border-[#2f241d] bg-[#2f241d] text-[#f8f3eb]"
                  : "border-[#d6c4aa] text-[#2f241d] hover:border-[#9c7a4f]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">Choose Color</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {product.colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => {
                setSelectedColor(color);
                setMessage("");
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedColor === color
                  ? "border-[#2f241d] bg-[#2f241d] text-[#f8f3eb]"
                  : "border-[#d6c4aa] text-[#2f241d] hover:border-[#9c7a4f]"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <button
          type="button"
          disabled={!canAddToCart}
          onClick={handleAddToCart}
          className="rounded-full bg-[#2f241d] px-6 py-3 text-sm text-[#f8f3eb] hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:bg-[#b8aa98]"
        >
          Add to Cart
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