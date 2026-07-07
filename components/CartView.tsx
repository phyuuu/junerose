"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatMMK } from "../lib/formatPrice";
import {
  getCartItems,
  removeCartItem,
  updateCartItemQuantity,
} from "../lib/cartStorage";
import { routes } from "../lib/routes";
import type { CartItem } from "../types/cart";

export default function CartView() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  function refreshCart() {
    setCartItems(getCartItems());
  }

  useEffect(() => {
    refreshCart();
  }, []);

  function handleQuantityChange(item: CartItem, quantity: number) {
    updateCartItemQuantity(item, quantity);
    refreshCart();
  }

  function handleRemove(item: CartItem) {
    removeCartItem(item);
    refreshCart();
  }

  if (cartItems.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <p className="text-sm text-[#8a7a6d]">Your cart is empty.</p>

        <Link
          href={routes.catalog}
          className="mt-4 inline-block rounded-full bg-[#2f241d] px-5 py-2 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  const totalMMK = cartItems.reduce(
    (total, item) => total + item.priceMMK * item.quantity,
    0
  );

  return (
    <div className="mt-8 space-y-4">
      {cartItems.map((item) => (
        <div
          key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
          className="flex gap-4 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-4"
        >
          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[#eadfce]">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <p className="text-sm font-medium">{item.name}</p>

            <p className="mt-1 text-xs text-[#8a7a6d]">
              Size: {item.selectedSize} · Color: {item.selectedColor}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                className="h-8 w-8 rounded-full border border-[#d6c4aa] text-sm hover:border-[#9c7a4f]"
              >
                −
              </button>

              <span className="w-6 text-center text-sm">{item.quantity}</span>

              <button
                type="button"
                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                className="h-8 w-8 rounded-full border border-[#d6c4aa] text-sm hover:border-[#9c7a4f]"
              >
                +
              </button>

              <button
                type="button"
                onClick={() => handleRemove(item)}
                className="ml-2 text-xs text-[#8a7a6d] hover:text-[#2f241d]"
              >
                Remove
              </button>
            </div>

            <p className="mt-3 text-sm text-[#6f6258]">
              {formatMMK(item.priceMMK * item.quantity)}
            </p>
          </div>
        </div>
      ))}

      <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
        <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Estimated Total</p>
            <p className="text-sm font-semibold">{formatMMK(totalMMK)}</p>
        </div>

        <p className="mt-2 text-xs leading-5 text-[#8a7a6d]">
            Final availability, total price, and pickup or delivery details will
            be confirmed by JuneRose staff.
        </p>

        <Link
            href={routes.order}
            className="mt-5 inline-block rounded-full bg-[#2f241d] px-6 py-3 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
        >
            Proceed to Order Request
        </Link>
        </div>
    </div>
  );
}