"use client";

import Link from "next/link";
import { useCartItems } from "@/hooks/useCartItems";
import { routes } from "@/lib/routes";

export default function CartNavigationLink({ mobile = false }: { mobile?: boolean }) {
  const cartItems = useCartItems();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      href={routes.cart}
      className={
        mobile
          ? "flex min-h-11 items-center justify-between px-3 py-3 hover:bg-[#f8edf2]"
          : "flex items-center gap-2 transition-colors hover:text-[#b62568]"
      }
    >
      <span>Cart</span>
      <span
        aria-label={`${itemCount} ${itemCount === 1 ? "item" : "items"} in cart`}
        className="inline-flex size-6 items-center justify-center rounded-full bg-[#f8edf2] text-[11px] text-[#9b1e5d]"
      >
        {itemCount}
      </span>
    </Link>
  );
}
