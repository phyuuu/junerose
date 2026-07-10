"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getOrders, ORDER_STORAGE_EVENT } from "@/lib/orderStorage";
import type { OrderRequest } from "@/types/order";

const EMPTY_ORDERS_SNAPSHOT = "[]";

function subscribeToOrders(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ORDER_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ORDER_STORAGE_EVENT, onStoreChange);
  };
}

function getOrdersSnapshot() {
  return JSON.stringify(getOrders());
}

function getServerOrdersSnapshot() {
  return EMPTY_ORDERS_SNAPSHOT;
}

export function useOrders(): OrderRequest[] {
  const snapshot = useSyncExternalStore(
    subscribeToOrders,
    getOrdersSnapshot,
    getServerOrdersSnapshot,
  );

  return useMemo(() => JSON.parse(snapshot) as OrderRequest[], [snapshot]);
}