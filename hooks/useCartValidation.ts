"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { validateCustomerCart } from "@/lib/customer-cart";
import type { CartItem, CartItemValidation } from "@/types/cart";

type CartValidationResult = {
  requestId: string;
  status: "ready" | "error";
  items: CartItemValidation[];
};

export function useCartValidation(cartItems: CartItem[]) {
  const [refreshCount, setRefreshCount] = useState(0);
  const [result, setResult] = useState<CartValidationResult>({
    requestId: "",
    status: "ready",
    items: [],
  });
  const requestKey = useMemo(
    () =>
      JSON.stringify(
        cartItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      ),
    [cartItems],
  );
  const requestId = `${requestKey}:${refreshCount}`;

  useEffect(() => {
    let isActive = true;

    if (cartItems.length === 0) {
      return () => {
        isActive = false;
      };
    }

    validateCustomerCart(cartItems)
      .then((items) => {
        if (isActive) {
          setResult({ requestId, status: "ready", items });
        }
      })
      .catch(() => {
        if (isActive) {
          setResult({ requestId, status: "error", items: [] });
        }
      });

    return () => {
      isActive = false;
    };
  }, [cartItems, requestId]);

  const status =
    cartItems.length === 0
      ? "idle"
      : result.requestId === requestId
        ? result.status
        : "checking";

  const validationByVariantId = useMemo(
    () =>
      new Map(
        status === "ready"
          ? result.items.map((item) => [item.variantId, item])
          : [],
      ),
    [result.items, status],
  );
  const hasBlockingIssues =
    status === "ready" &&
    result.items.some((item) => item.status !== "available");
  const recheck = useCallback(() => {
    setRefreshCount((count) => count + 1);
  }, []);

  return {
    status,
    validationByVariantId,
    hasBlockingIssues,
    recheck,
  };
}
