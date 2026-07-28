"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { adminProductInfoSchema } from "@/lib/validation/product";

export async function updateProductInfoAction(formData: FormData) {
  await requireAdmin();

  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("Invalid product ID.");
  }

  const parsed = adminProductInfoSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    priceMMK: Number(formData.get("priceMMK")),
    category: formData.get("category"),
    availability: formData.get("availability"),
    isVisible: formData.get("isVisible") === "on",
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Invalid product data.",
    );
  }

  const supabase = await createClient();

  const { data: existingProduct, error: existingProductError } =
    await supabase
      .from("products")
      .select("id, slug")
      .eq("id", productId)
      .single();

  if (existingProductError || !existingProduct) {
    throw new Error("Product not found.");
  }

  const { error: updateError } = await supabase.rpc(
    "update_product_info",
    {
      target_product_id: productId,
      new_name: parsed.data.name,
      new_description: parsed.data.description,
      new_price_mmk: parsed.data.priceMMK,
      new_category: parsed.data.category,
      new_availability: parsed.data.availability,
      new_is_visible: parsed.data.isVisible,
    },
  );

  if (updateError) {
    console.error(
      "update_product_info RPC failed:",
      JSON.stringify(
        {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        },
        null,
        2,
      ),
    );

    throw new Error(
      "Unable to update product and record its history.",
    );
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(existingProduct.slug));

  redirect(`${routes.adminProductEdit(productId)}?saved=1`);
}