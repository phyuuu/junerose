"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/order";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
];

type UpdateOrderStatusResult = {
  error?: string;
};

export async function updateOrderStatusAction(
  orderNumber: string,
  status: OrderStatus,
): Promise<UpdateOrderStatusResult> {
  await requireAdmin();

  const normalizedOrderNumber = orderNumber.trim();

  if (!normalizedOrderNumber) {
    return {
      error: "Order number is required.",
    };
  }

  if (!ORDER_STATUSES.includes(status)) {
    return {
      error: "Select a valid order status.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("order_number", normalizedOrderNumber)
    .select("order_number")
    .single();

  if (error) {
    console.error("Unable to update order status:", error);

    return {
      error: "Unable to update order status.",
    };
  }

  revalidatePath(routes.adminOrders);
  revalidatePath(`${routes.adminOrders}/${normalizedOrderNumber}`);

  return {};
}
