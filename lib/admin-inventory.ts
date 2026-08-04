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
  changedBy: string;
  createdAt: string;
};

type JoinedProduct = {
  name: string;
};

type JoinedVariant = {
  size: string;
  color: string;
  products: JoinedProduct | JoinedProduct[] | null;
};

type InventoryHistoryRow = {
  id: number;
  quantity_change: number;
  changed_by: string;
  created_at: string;
  product_variants: JoinedVariant | JoinedVariant[] | null;
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

  const { data, error } = await supabase
    .from("inventory_adjustments")
    .select(
      `
        id,
        quantity_change,
        changed_by,
        created_at,
        product_variants (
          size,
          color,
          products (
            name
          )
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throwReportedServerError({
      operation: "admin.inventory.load_all_history",
      error,
      message: "Unable to load inventory history.",
    });
  }

  const rows = data as unknown as InventoryHistoryRow[];

  return rows.map((item) => {
    const variant = Array.isArray(item.product_variants)
      ? item.product_variants[0]
      : item.product_variants;

    const product = Array.isArray(variant?.products)
      ? variant.products[0]
      : variant?.products;

    return {
      id: item.id,
      productName: product?.name ?? "Unknown product",
      size: variant?.size ?? "-",
      color: variant?.color ?? "-",
      quantityChange: item.quantity_change,
      changedBy: item.changed_by,
      createdAt: item.created_at,
    };
  });
}
