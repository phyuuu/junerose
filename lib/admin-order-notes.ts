import "server-only";

import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";
import type { AdminOrderNote } from "@/types/order";

type OrderNoteRow = {
  id: number;
  note: string;
  created_at: string;
};

export async function getAdminOrderNotes(
  orderNumber: string,
): Promise<AdminOrderNote[]> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (orderError) {
    throwReportedServerError({
      operation: "admin.order_note.load_order",
      error: orderError,
      message: "Unable to load order notes.",
    });
  }

  if (!order) {
    return [];
  }

  const { data: notesData, error: notesError } = await supabase
    .from("order_notes")
    .select("id, note, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });

  if (notesError) {
    throwReportedServerError({
      operation: "admin.order_note.load_list",
      error: notesError,
      message: "Unable to load order notes.",
    });
  }

  return ((notesData ?? []) as OrderNoteRow[]).map((note) => ({
    id: note.id,
    note: note.note,
    createdAt: note.created_at,
  }));
}
