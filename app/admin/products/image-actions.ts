"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

const productImagesBucket = "product-images";
const maxImageSizeBytes = 5 * 1024 * 1024;
const allowedImageTypes = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function redirectToProductImages(
  productId: number,
  message: string,
): never {
  redirect(
    `${routes.adminProductEdit(productId)}?imageMessage=${encodeURIComponent(
      message,
    )}`,
  );
}

function getFileExtension(file: File): string {
  const nameExtension = file.name.split(".").pop()?.toLowerCase();

  if (nameExtension) {
    return nameExtension;
  }

  if (file.type === "image/jpeg") {
    return "jpg";
  }

  return file.type.replace("image/", "");
}

export async function uploadProductImageAction(formData: FormData) {
  await requireAdmin();

  const productId = Number(formData.get("productId"));
  const imageFile = formData.get("image");

  if (!Number.isInteger(productId) || productId <= 0) {
    redirect(routes.adminProducts);
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    redirectToProductImages(productId, "Choose an image to upload.");
  }

  const productImageFile = imageFile;

  if (!allowedImageTypes.has(productImageFile.type)) {
    redirectToProductImages(
      productId,
      "Product image must be a JPG, PNG, WebP, or GIF file.",
    );
  }

  if (productImageFile.size > maxImageSizeBytes) {
    redirectToProductImages(
      productId,
      "Product image must be 5 MB or smaller.",
    );
  }

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, slug")
    .eq("id", productId)
    .is("deleted_at", null)
    .single();

  if (productError || !product) {
    redirect(routes.adminProducts);
  }

  const { count, error: countError } = await supabase
    .from("product_images")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("product_id", productId);

  if (countError) {
    console.error("Unable to count product images:", countError);
    redirectToProductImages(productId, "Unable to upload product image.");
  }

  const extension = getFileExtension(productImageFile);
  const imagePath = `${product.slug}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(productImagesBucket)
    .upload(imagePath, productImageFile, {
      contentType: productImageFile.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("Unable to upload product image:", uploadError);
    redirectToProductImages(productId, "Unable to upload product image.");
  }

  const { data: publicUrlData } = supabase.storage
    .from(productImagesBucket)
    .getPublicUrl(imagePath);

  const { error: imageInsertError } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: publicUrlData.publicUrl,
      display_order: count ?? 0,
    });

  if (imageInsertError) {
    console.error("Unable to save product image record:", imageInsertError);
    redirectToProductImages(productId, "Unable to save product image.");
  }

  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(product.slug));

  redirectToProductImages(productId, "Product image uploaded successfully.");
}
