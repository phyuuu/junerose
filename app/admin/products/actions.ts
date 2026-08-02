"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import {
  adminCreateProductBaseSchema,
  adminProductInfoSchema,
  adminProductVariantSchema,
} from "@/lib/validation/product";
import type { UpdateProductInfoState } from "@/types/admin-product-action";
import type { AddProductVariantState } from "@/types/admin-variant-action";

export async function updateProductInfoAction(
  _previousState: UpdateProductInfoState,
  formData: FormData,
): Promise<UpdateProductInfoState> {
  await requireAdmin();

  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      formError: "Invalid product ID.",
    };
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
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: existingProduct, error: existingProductError } =
    await supabase
      .from("products")
      .select("id, slug")
      .eq("id", productId)
      .single();

  if (existingProductError || !existingProduct) {
    return {
      formError: "Product not found.",
    };
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

    return {
      formError: "Unable to update product and record its history.",
    };
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(existingProduct.slug));

  redirect(`${routes.adminProductEdit(productId)}?saved=1`);
}

export async function createProductAction(
  _previousState: UpdateProductInfoState,
  formData: FormData,
): Promise<UpdateProductInfoState> {
  await requireAdmin();

  const parsed = adminCreateProductBaseSchema.safeParse({
    code: formData.get("code"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    priceMMK: Number(formData.get("priceMMK")),
    category: formData.get("category"),
    availability: formData.get("availability"),
    isVisible: formData.get("isVisible") === "on",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const [
    { data: existingCodeProduct, error: codeCheckError },
    { data: existingSlugProduct, error: slugCheckError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id")
      .eq("code", parsed.data.code)
      .maybeSingle(),

    supabase
      .from("products")
      .select("id")
      .eq("slug", parsed.data.slug)
      .maybeSingle(),
  ]);

  if (codeCheckError || slugCheckError) {
    return {
      formError: "Unable to check whether this product already exists.",
    };
  }

  if (existingCodeProduct) {
    return {
      fieldErrors: {
        code: ["A product with this code already exists."],
      },
    };
  }

  if (existingSlugProduct) {
    return {
      fieldErrors: {
        slug: ["A product with this slug already exists."],
      },
    };
  }

  const { data: productId, error } = await supabase.rpc(
    "create_product_with_variants",
    {
      product_code: parsed.data.code,
      product_slug: parsed.data.slug,
      product_name: parsed.data.name,
      product_description: parsed.data.description,
      product_price_mmk: parsed.data.priceMMK,
      product_category: parsed.data.category,
      product_availability: parsed.data.availability,
      product_is_visible: parsed.data.isVisible,
      product_variants: [],
    },
  );

  if (error || !productId) {
    console.error(
      "create_product_with_variants RPC failed:",
      JSON.stringify(
        {
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
        },
        null,
        2,
      ),
    );

    if (error?.code === "23505") {
      return {
        formError:
          "A product with this code or slug already exists.",
      };
    }

    return {
      formError: "Unable to create the product.",
    };
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);

  redirect(routes.adminProductEdit(productId));
}

export async function addProductVariantAction(
  _previousState: AddProductVariantState,
  formData: FormData,
): Promise<AddProductVariantState> {
  await requireAdmin();

  const productId = Number(formData.get("productId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      formError: "Invalid product ID.",
    };
  }

  const parsed = adminProductVariantSchema.safeParse({
    sizeId: Number(formData.get("sizeId")),
    colorId: Number(formData.get("colorId")),
    quantity: Number(formData.get("quantity")),
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  const { data: size, error: sizeError } = await supabase
    .from("sizes")
    .select("name")
    .eq("id", parsed.data.sizeId)
    .single();

  if (sizeError || !size) {
    return {
      formError: "Invalid size option.",
    };
  }

  const { data: color, error: colorError } = await supabase
    .from("colors")
    .select("name")
    .eq("id", parsed.data.colorId)
    .single();

  if (colorError || !color) {
    return {
      formError: "Invalid color option.",
    };
  }

  const { error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,

      // keep old columns temporarily
      size: size.name,
      color: color.name,

      // new columns
      size_id: parsed.data.sizeId,
      color_id: parsed.data.colorId,

      quantity: parsed.data.quantity,
    });

  if (error) {
    console.error(
      "create product variant failed:",
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

    if (error.code === "23505") {
      return {
        formError:
          "This size and color combination already exists.",
      };
    }

    return {
      formError: "Unable to add product variant.",
    };
  }

  revalidatePath(routes.adminProductEdit(productId));

  return {};
}

export async function toggleProductVisibilityAction(
  productId: number,
  nextIsVisible: boolean,
) {
  await requireAdmin();

  if (!Number.isInteger(productId) || productId <= 0) {
    return {
      error: "Invalid product ID.",
    };
  }

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .is("deleted_at", null)
    .single();

  if (productError || !product) {
    return {
      error: "Product not found.",
    };
  }

  const { error } = await supabase
    .from("products")
    .update({
      is_visible: nextIsVisible,
    })
    .eq("id", productId);

  if (error) {
    console.error("Unable to update product visibility:", error);

    return {
      error: "Unable to update product visibility.",
    };
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(product.slug));

  return {};
}