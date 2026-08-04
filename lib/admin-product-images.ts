import "server-only";

import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";

export type AdminProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number | null;
};

export async function getAdminProductImages(
  productId: number,
): Promise<AdminProductImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("id, product_id, image_url, display_order")
    .eq("product_id", productId)
    .order("display_order")
    .order("id");

  if (error) {
    throwReportedServerError({
      operation: "admin.product_image.load_list",
      error,
      productId,
      message: "Unable to load admin product images.",
    });
  }

  return (data ?? []) as AdminProductImage[];
}
