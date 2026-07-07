import type { OrderRequest } from "../types/order";

const ORDER_STORAGE_KEY = "junerose_orders";

export function getOrders(): OrderRequest[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedOrders = window.localStorage.getItem(ORDER_STORAGE_KEY);

  if (!storedOrders) {
    return [];
  }

  try {
    return JSON.parse(storedOrders) as OrderRequest[];
  } catch {
    return [];
  }
}

export function saveOrder(order: OrderRequest) {
  const currentOrders = getOrders();

  window.localStorage.setItem(
    ORDER_STORAGE_KEY,
    JSON.stringify([...currentOrders, order])
  );
}

export function getOrderByNumber(
  orderNumber: string
): OrderRequest | undefined {
  return getOrders().find((order) => order.orderNumber === orderNumber);
}