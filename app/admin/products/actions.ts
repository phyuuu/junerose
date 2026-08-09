"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";
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
  await requireStaff();

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
    departmentId: Number(formData.get("departmentId")),
    productTypeId: Number(formData.get("productTypeId")),
    materialIds: formData.getAll("materialIds").map(Number),
    availability: formData.get("availability"),
    isVisible: false,
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
      .select("id, slug, is_visible")
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
      new_department_id: parsed.data.departmentId,
      new_product_type_id: parsed.data.productTypeId,
      new_material_ids: parsed.data.materialIds,
      new_availability: parsed.data.availability,
      new_is_visible: existingProduct.is_visible,
    },
  );

  if (updateError) {
    const referenceId = reportServerError({
      operation: "admin.product.update_info",
      error: updateError,
      productId,
    });

    return {
      formError: withErrorReference(
        "Unable to update product and record its history.",
        referenceId,
      ),
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
  await requireStaff();

  const parsed = adminCreateProductBaseSchema.safeParse({
    code: formData.get("code"),
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    priceMMK: Number(formData.get("priceMMK")),
    departmentId: Number(formData.get("departmentId")),
    productTypeId: Number(formData.get("productTypeId")),
    materialIds: formData.getAll("materialIds").map(Number),
    availability: formData.get("availability"),
    isVisible: false,
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
      product_department_id: parsed.data.departmentId,
      product_type_id: parsed.data.productTypeId,
      product_material_ids: parsed.data.materialIds,
      product_availability: parsed.data.availability,
      product_is_visible: false,
      product_variants: [],
    },
  );

  if (error || !productId) {
    if (error?.code === "23505") {
      return {
        formError:
          "A product with this code or slug already exists.",
      };
    }

    const referenceId = reportServerError({
      operation: "admin.product.create",
      error: error ?? new Error("Product creation returned no ID"),
    });

    return {
      formError: withErrorReference(
        "Unable to create the product.",
        referenceId,
      ),
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
  await requireStaff();

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

  const { error } = await supabase.rpc(
    "add_product_variant_with_initial_stock",
    {
      target_product_id: productId,
      target_size_id: parsed.data.sizeId,
      target_color_id: parsed.data.colorId,
      initial_quantity: parsed.data.quantity,
    },
  );

  if (error) {
    if (error.code === "23505") {
      return {
        formError:
          "This size and color combination already exists.",
      };
    }

    const referenceId = reportServerError({
      operation: "admin.product_variant.create",
      error,
      productId,
    });

    return {
      formError: withErrorReference(
        "Unable to add product variant.",
        referenceId,
      ),
    };
  }

  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.adminInventoryHistory);

  return {};
}

export async function toggleProductVisibilityAction(
  productId: number,
  nextIsVisible: boolean,
) {
  await requireStaff();

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

  const { error } = await supabase.rpc("set_product_visibility", {
    target_product_id: productId,
    next_is_visible: nextIsVisible,
  });

  if (error) {
    if (
      error.message ===
        "Add at least one product image before showing this product." ||
      error.message ===
        "Add at least one in-stock variant before showing this product."
    ) {
      return {
        error: error.message,
      };
    }

    const referenceId = reportServerError({
      operation: "admin.product.update_visibility",
      error,
      productId,
    });

    return {
      error: withErrorReference(
        "Unable to update product visibility.",
        referenceId,
      ),
    };
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(product.slug));

  return {};
}

export async function archiveProductAction(productId: number) {
  await requireStaff();

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
      deleted_at: new Date().toISOString(),
      is_visible: false,
    })
    .eq("id", productId);

  if (error) {
    const referenceId = reportServerError({
      operation: "admin.product.archive",
      error,
      productId,
    });

    return {
      error: withErrorReference("Unable to archive product.", referenceId),
    };
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(product.slug));

  return {};
}

export async function restoreProductAction(productId: number) {
  await requireStaff();

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
    .not("deleted_at", "is", null)
    .single();

  if (productError || !product) {
    return {
      error: "Archived product not found.",
    };
  }

  const { error } = await supabase
    .from("products")
    .update({
      deleted_at: null,
      is_visible: false,
    })
    .eq("id", productId);

  if (error) {
    const referenceId = reportServerError({
      operation: "admin.product.restore",
      error,
      productId,
    });

    return {
      error: withErrorReference("Unable to restore product.", referenceId),
    };
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminArchivedProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(product.slug));

  return {};
}
