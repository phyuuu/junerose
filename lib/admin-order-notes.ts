import "server-only";

import { createClient } from "@/lib/supabase/server";
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

  if (orderError || !order) {
    console.error("Unable to load order for notes:", orderError);
    return [];
  }

  const { data: notesData, error: notesError } = await supabase
    .from("order_notes")
    .select("id, note, created_at")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });

  if (notesError) {
    console.error("Unable to load admin order notes:", notesError);
    return [];
  }

  return ((notesData ?? []) as OrderNoteRow[]).map((note) => ({
    id: note.id,
    note: note.note,
    createdAt: note.created_at,
  }));
}
