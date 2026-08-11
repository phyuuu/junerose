"use server";

import { requireStaff } from "@/lib/auth/require-staff";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { routes } from "@/lib/routes";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";

export type AdjustStockState = {
  error?: string;
};

export async function adjustProductStockAction(
  productId: number,
  variantId: number,
  adjustmentAmount: number,
): Promise<AdjustStockState> {
  await requireStaff();

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
    const referenceId = reportServerError({
      operation: "admin.inventory.adjust",
      error,
      productId,
      variantId,
    });
    const developmentCode =
      process.env.NODE_ENV === "development" &&
      typeof error.code === "string"
        ? ` Database code: ${error.code}.`
        : "";

    return {
      error: `${withErrorReference(
        "Unable to update stock.",
        referenceId,
      )}${developmentCode}`,
    };
  }

  revalidatePath(routes.adminProductEdit(productId));
  
  return {};
}
