"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";
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

type AddOrderNoteResult = {
  error?: string;
};

type UpdateOrderNoteResult = {
  error?: string;
};

type DeleteOrderNoteResult = {
  error?: string;
};

function getKnownOrderStatusErrorMessage(message: string | undefined) {
  if (!message) {
    return undefined;
  }

  if (
    message.startsWith("Not enough stock") ||
    message.startsWith("Product variant not found") ||
    message.startsWith("Stock was already released") ||
    message === "Order not found." ||
    message === "Completed orders cannot be cancelled." ||
    message === "Cancelled orders cannot be reopened." ||
    message ===
      "Reserved orders cannot be moved back to pending. Cancel the order to release stock." ||
    message === "Confirm the order before marking it completed."
  ) {
    return message;
  }

  return undefined;
}

async function getOrderIdByNumber(orderNumber: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .single();

  if (error || !order) {
    reportServerError({
      operation: "admin.order.lookup_for_note",
      error: error ?? new Error("Order lookup returned no data"),
    });
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
  await requireStaff();

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

  const { error } = await supabase.rpc("update_order_status", {
    target_order_number: normalizedOrderNumber,
    target_status: status,
  });

  if (error) {
    const knownMessage = getKnownOrderStatusErrorMessage(error.message);

    if (knownMessage) {
      return { error: knownMessage };
    }

    const referenceId = reportServerError({
      operation: "admin.order.update_status",
      error,
    });

    return {
      error: withErrorReference(
        "Unable to update order status.",
        referenceId,
      ),
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
  await requireStaff();

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
    const referenceId = reportServerError({
      operation: "admin.order_note.add",
      error,
    });

    return {
      error: withErrorReference("Unable to add note.", referenceId),
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
  await requireStaff();

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
    const referenceId = reportServerError({
      operation: "admin.order_note.update",
      error,
      noteId,
    });

    return {
      error: withErrorReference("Unable to update note.", referenceId),
    };
  }

  revalidatePath(`${routes.adminOrders}/${normalizedOrderNumber}`);

  return {};
}

export async function deleteOrderNoteAction(
  orderNumber: string,
  noteId: number,
): Promise<DeleteOrderNoteResult> {
  await requireStaff();

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
    const referenceId = reportServerError({
      operation: "admin.order_note.delete",
      error,
      noteId,
    });

    return {
      error: withErrorReference("Unable to delete note.", referenceId),
    };
  }

  revalidatePath(`${routes.adminOrders}/${normalizedOrderNumber}`);

  return {};
}
