import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getProductRestockState } from "@/lib/product-stock";
import { throwReportedServerError } from "@/lib/server/report-error";

type ProductIdRow = {
  id: number;
};

type VariantQuantityRow = {
  id: number;
  product_id: number;
  quantity: number;
};

export type AdminOperationalSummary = {
  pendingOrderCount: number;
  readyOrderCount: number;
  needsRestockProductCount: number;
};

export async function getAdminOperationalSummary(): Promise<AdminOperationalSummary> {
  const supabase = await createClient();
  const [
    pendingOrdersResult,
    readyOrdersResult,
    productsResult,
    variantsResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "ready"),
    supabase
      .from("products")
      .select("id")
      .is("deleted_at", null),
    supabase
      .from("product_variants")
      .select("id, product_id, quantity"),
  ]);

  const error =
    pendingOrdersResult.error ??
    readyOrdersResult.error ??
    productsResult.error ??
    variantsResult.error;

  if (error) {
    throwReportedServerError({
      operation: "admin.overview.load_operational_summary",
      error,
      message: "Unable to load the admin overview.",
    });
  }

  const products = (productsResult.data ?? []) as ProductIdRow[];
  const variants = (variantsResult.data ?? []) as VariantQuantityRow[];
  const needsRestockProductCount = products.filter((product) => {
    const stockItems = variants
      .filter((variant) => variant.product_id === product.id)
      .map((variant) => ({
        variantId: variant.id,
        size: "",
        color: "",
        quantity: variant.quantity,
      }));

    return getProductRestockState(stockItems) !== "healthy";
  }).length;

  return {
    pendingOrderCount: pendingOrdersResult.count ?? 0,
    readyOrderCount: readyOrdersResult.count ?? 0,
    needsRestockProductCount,
  };
}
