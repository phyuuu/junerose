import { describe, expect, it } from "vitest";
import { isTerminalOrderStatus } from "@/lib/order-status";
import type { OrderStatus } from "@/types/order";

describe("isTerminalOrderStatus", () => {
  it.each<OrderStatus>(["completed", "cancelled"])(
    "treats %s as terminal",
    (status) => {
      expect(isTerminalOrderStatus(status)).toBe(true);
    },
  );

  it.each<OrderStatus>(["pending", "confirmed", "preparing", "ready"])(
    "allows staff workflow changes for %s",
    (status) => {
      expect(isTerminalOrderStatus(status)).toBe(false);
    },
  );
});
