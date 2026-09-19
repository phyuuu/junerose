import type { OrderStatus } from "@/types/order";

const TERMINAL_ORDER_STATUSES: OrderStatus[] = ["completed", "cancelled"];

export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return TERMINAL_ORDER_STATUSES.includes(status);
}
