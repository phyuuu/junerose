import "server-only";

import { createClient } from "@/lib/supabase/server";

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
    console.error("Unable to load admin product images:", error);
    throw new Error("Unable to load admin product images.");
  }

  return (data ?? []) as AdminProductImage[];
}
