import "server-only";

import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";
import type { InventoryAdjustment } from "@/types/inventory";

export type InventoryAdjustmentHistoryItem = {
  id: number;
  productName: string;
  size: string;
  color: string;
  quantityChange: number;
  changedById: string;
  changedByName: string;
  createdAt: string;
};

type InventoryHistoryRow = {
  id: number;
  product_name: string;
  size: string;
  color: string;
  quantity_change: number;
  changed_by: string;
  changed_by_name: string | null;
  created_at: string;
};

export async function getInventoryAdjustments(
  variantId: number,
): Promise<InventoryAdjustment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_adjustments")
    .select(
      "id, product_variant_id, quantity_change, changed_by, created_at",
    )
    .eq("product_variant_id", variantId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throwReportedServerError({
      operation: "admin.inventory.load_variant_history",
      error,
      variantId,
      message: "Unable to load inventory history.",
    });
  }

  return data.map((item) => ({
    id: item.id,
    productVariantId: item.product_variant_id,
    quantityChange: item.quantity_change,
    changedBy: item.changed_by,
    createdAt: item.created_at,
  }));
}

export async function getAllInventoryAdjustments(): Promise<
  InventoryAdjustmentHistoryItem[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_inventory_adjustment_history",
  );

  if (error || !Array.isArray(data)) {
    throwReportedServerError({
      operation: "admin.inventory.load_all_history",
      error: error ?? new Error("Unexpected inventory history response"),
      message: "Unable to load inventory history.",
    });
  }

  const rows = data as unknown as InventoryHistoryRow[];

  return rows.map((item) => ({
    id: item.id,
    productName: item.product_name,
    size: item.size,
    color: item.color,
    quantityChange: item.quantity_change,
    changedById: item.changed_by,
    changedByName: item.changed_by_name?.trim() || "Name not set",
    createdAt: item.created_at,
  }));
}
