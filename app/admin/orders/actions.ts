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

const STOCK_RESERVED_STATUSES: OrderStatus[] = [
  "confirmed",
  "preparing",
  "ready",
  "completed",
];

type UpdateOrderStatusResult = {
  error?: string;
};

type AddOrderNoteResult = {
  error?: string;
};

type UpdateOrderNoteResult = {
  error?: string;
};

type DeleteOrderNoteResult = {
  error?: string;
};

type OrderStatusRow = {
  order_number: string;
  status: OrderStatus;
  stock_reserved_at: string | null;
  stock_released_at: string | null;
};

function getStockErrorMessage(
  message: string | undefined,
  fallback: string,
) {
  if (!message) {
    return fallback;
  }

  if (
    message.startsWith("Not enough stock") ||
    message.startsWith("Product variant not found") ||
    message.startsWith("Stock was already released")
  ) {
    return message;
  }

  return fallback;
}

async function getOrderIdByNumber(orderNumber: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) {
    console.error("Unable to load order:", error);
    return null;
  }

  return {
    supabase,
    orderId: order.id as number,
  };
}

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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "order_number, status, stock_reserved_at, stock_released_at",
    )
    .eq("order_number", normalizedOrderNumber)
    .single();

  if (orderError || !order) {
    console.error("Unable to load order before status update:", orderError);

    return {
      error: "Order not found.",
    };
  }

  const currentOrder = order as OrderStatusRow;
  const shouldReserveStock =
    STOCK_RESERVED_STATUSES.includes(status) &&
    currentOrder.stock_reserved_at === null;
  const shouldReleaseStock =
    status === "cancelled" &&
    currentOrder.stock_reserved_at !== null &&
    currentOrder.stock_released_at === null;

  if (currentOrder.status === "completed" && status === "cancelled") {
    return {
      error: "Completed orders cannot be cancelled.",
    };
  }

  if (currentOrder.status === "cancelled" && status !== "cancelled") {
    return {
      error: "Cancelled orders cannot be reopened.",
    };
  }

  if (status === "pending" && currentOrder.stock_reserved_at !== null) {
    return {
      error:
        "Reserved orders cannot be moved back to pending. Cancel the order to release stock.",
    };
  }

  if (status === "completed" && currentOrder.stock_reserved_at === null) {
    return {
      error: "Confirm the order before marking it completed.",
    };
  }

  if (shouldReserveStock) {
    const { error: reserveError } = await supabase.rpc(
      "reserve_order_stock",
      {
        target_order_number: normalizedOrderNumber,
      },
    );

    if (reserveError) {
      console.error("Unable to reserve order stock:", reserveError);

      return {
        error: getStockErrorMessage(
          reserveError.message,
          "Unable to reserve stock. Check that all ordered items are still available.",
        ),
      };
    }
  }

  if (shouldReleaseStock) {
    const { error: releaseError } = await supabase.rpc(
      "release_order_stock",
      {
        target_order_number: normalizedOrderNumber,
      },
    );

    if (releaseError) {
      console.error("Unable to release order stock:", releaseError);

      return {
        error: getStockErrorMessage(
          releaseError.message,
          "Unable to release stock for this order.",
        ),
      };
    }
  }

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

export async function addOrderNoteAction(
  orderNumber: string,
  note: string,
): Promise<AddOrderNoteResult> {
  await requireAdmin();

  const normalizedOrderNumber = orderNumber.trim();
  const normalizedNote = note.trim();

  if (!normalizedOrderNumber) {
    return {
      error: "Order number is required.",
    };
  }

  if (!normalizedNote) {
    return {
      error: "Write a note before saving.",
    };
  }

  if (normalizedNote.length > 1000) {
    return {
      error: "Order notes must be 1000 characters or less.",
    };
  }

  const orderLookup = await getOrderIdByNumber(normalizedOrderNumber);

  if (!orderLookup) {
    return {
      error: "Order not found.",
    };
  }

  const { error } = await orderLookup.supabase.from("order_notes").insert({
    order_id: orderLookup.orderId,
    note: normalizedNote,
  });

  if (error) {
    console.error("Unable to add order note:", error);

    return {
      error: "Unable to add note. Check order_notes permissions in Supabase.",
    };
  }

  revalidatePath(`${routes.adminOrders}/${normalizedOrderNumber}`);

  return {};
}

export async function updateOrderNoteAction(
  orderNumber: string,
  noteId: number,
  note: string,
): Promise<UpdateOrderNoteResult> {
  await requireAdmin();

  const normalizedOrderNumber = orderNumber.trim();
  const normalizedNote = note.trim();

  if (!normalizedOrderNumber || !Number.isInteger(noteId) || noteId < 1) {
    return {
      error: "Select a valid note.",
    };
  }

  if (!normalizedNote) {
    return {
      error: "Write a note before saving.",
    };
  }

  if (normalizedNote.length > 1000) {
    return {
      error: "Order notes must be 1000 characters or less.",
    };
  }

  const orderLookup = await getOrderIdByNumber(normalizedOrderNumber);

  if (!orderLookup) {
    return {
      error: "Order not found.",
    };
  }

  const { error } = await orderLookup.supabase
    .from("order_notes")
    .update({ note: normalizedNote })
    .eq("id", noteId)
    .eq("order_id", orderLookup.orderId)
    .select("id")
    .single();

  if (error) {
    console.error("Unable to update order note:", error);

    return {
      error:
        "Unable to update note. Check order_notes permissions in Supabase.",
    };
  }

  revalidatePath(`${routes.adminOrders}/${normalizedOrderNumber}`);

  return {};
}

export async function deleteOrderNoteAction(
  orderNumber: string,
  noteId: number,
): Promise<DeleteOrderNoteResult> {
  await requireAdmin();

  const normalizedOrderNumber = orderNumber.trim();

  if (!normalizedOrderNumber || !Number.isInteger(noteId) || noteId < 1) {
    return {
      error: "Select a valid note.",
    };
  }

  const orderLookup = await getOrderIdByNumber(normalizedOrderNumber);

  if (!orderLookup) {
    return {
      error: "Order not found.",
    };
  }

  const { error } = await orderLookup.supabase
    .from("order_notes")
    .delete()
    .eq("id", noteId)
    .eq("order_id", orderLookup.orderId);

  if (error) {
    console.error("Unable to delete order note:", error);

    return {
      error:
        "Unable to delete note. Check order_notes permissions in Supabase.",
    };
  }

  revalidatePath(`${routes.adminOrders}/${normalizedOrderNumber}`);

  return {};
}
