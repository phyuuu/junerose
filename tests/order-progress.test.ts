import { describe, expect, it } from "vitest";
import { getCustomerOrderProgress } from "@/lib/order-progress";
import type { OrderStatus } from "@/types/order";

describe("getCustomerOrderProgress", () => {
  it.each<{
    status: Exclude<OrderStatus, "cancelled">;
    expectedCompleted: number;
  }>([
    { status: "pending", expectedCompleted: 0 },
    { status: "confirmed", expectedCompleted: 1 },
    { status: "preparing", expectedCompleted: 2 },
    { status: "ready", expectedCompleted: 3 },
    { status: "completed", expectedCompleted: 4 },
  ])("marks the correct progress for $status", ({ status, expectedCompleted }) => {
    const progress = getCustomerOrderProgress(status);

    expect(progress.isCancelled).toBe(false);
    expect(
      progress.steps.filter((step) => step.state === "completed"),
    ).toHaveLength(expectedCompleted);
    expect(
      progress.steps.find((step) => step.state === "current")?.status,
    ).toBe(status);
  });

  it("uses a separate stopped state for cancelled orders", () => {
    const progress = getCustomerOrderProgress("cancelled");

    expect(progress.isCancelled).toBe(true);
    expect(progress.steps.every((step) => step.state === "upcoming")).toBe(
      true,
    );
    expect(progress.currentDescription).toContain("cancelled");
  });
});
