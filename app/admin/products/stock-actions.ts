"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";

export type AdjustStockState = {
  error?: string;
};

export async function adjustProductStockAction(
  productId: number,
  variantId: number,
  adjustmentAmount: number,
): Promise<AdjustStockState> {
  await requireAdmin();

  if (!Number.isInteger(variantId) || variantId <= 0) {
    return {
      error: "Invalid product variant.",
    };
  }

  if (!Number.isInteger(adjustmentAmount)) {
    return {
      error: "Adjustment amount must be a whole number.",
    };
  }

  if (adjustmentAmount === 0) {
    return {
      error: "Adjustment cannot be zero.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc(
    "adjust_product_stock",
    {
      target_variant_id: variantId,
      adjustment_amount: adjustmentAmount,
    },
  );

  if (error) {
    console.error(
      "adjust_product_stock failed:",
      JSON.stringify(
        {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        },
        null,
        2,
      ),
    );

    return {
      error: "Unable to update stock.",
    };
  }

  revalidatePath(routes.adminProductEdit(productId));
  
  return {};
}