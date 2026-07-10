"use client";

import { useMemo, useSyncExternalStore } from "react";
import { CART_STORAGE_EVENT, getCartItems } from "@/lib/cartStorage";
import type { CartItem } from "@/types/cart";

const EMPTY_CART_SNAPSHOT = "[]";

function subscribeToCart(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(CART_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(CART_STORAGE_EVENT, onStoreChange);
  };
}

function getCartSnapshot() {
  return JSON.stringify(getCartItems());
}

function getServerCartSnapshot() {
  return EMPTY_CART_SNAPSHOT;
}

export function useCartItems(): CartItem[] {
  const snapshot = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );

  return useMemo(() => JSON.parse(snapshot) as CartItem[], [snapshot]);
}