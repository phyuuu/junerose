"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
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
          : "group flex min-h-11 items-center gap-1.5 transition-colors hover:text-[#b62568]"
      }
      aria-label={`Cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
      title={mobile ? undefined : "Cart"}
    >
      {mobile ? (
        <span>Cart</span>
      ) : (
        <ShoppingCart aria-hidden="true" className="size-[21px] stroke-[1.6]" />
      )}
      <span
        aria-hidden="true"
        className={
          mobile
            ? "inline-flex size-6 items-center justify-center rounded-full bg-[#f8edf2] text-[11px] text-[#9b1e5d]"
            : "min-w-4 text-center text-xs tabular-nums text-[#9b1e5d] group-hover:text-[#b62568]"
        }
      >
        {itemCount}
      </span>
    </Link>
  );
}
