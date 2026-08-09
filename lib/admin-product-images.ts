import "server-only";

import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";

export type AdminProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number | null;
  color_id: number | null;
  color_name: string | null;
};

type ProductImageRow = Omit<AdminProductImage, "color_name"> & {
  colors: { name: string } | { name: string }[] | null;
};

export async function getAdminProductImages(
  productId: number,
): Promise<AdminProductImage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("id, product_id, image_url, display_order, color_id, colors (name)")
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

  return ((data ?? []) as unknown as ProductImageRow[]).map((image) => ({
    id: image.id,
    product_id: image.product_id,
    image_url: image.image_url,
    display_order: image.display_order,
    color_id: image.color_id,
    color_name: Array.isArray(image.colors)
      ? image.colors[0]?.name ?? null
      : image.colors?.name ?? null,
  }));
}
