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

function failProductImageAction({
  operation,
  error,
  productId,
  imageId,
  message,
}: {
  operation: string;
  error: unknown;
  productId: number;
  imageId?: number;
  message: string;
}): never {
  const referenceId = reportServerError({
    operation,
    error,
    productId,
    imageId,
  });

  redirectToProductImages(
    productId,
    withErrorReference(message, referenceId),
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

function getStoragePathFromPublicUrl(imageUrl: string): string | undefined {
  const marker = `/storage/v1/object/public/${productImagesBucket}/`;
  const markerIndex = imageUrl.indexOf(marker);

  if (markerIndex === -1) {
    return undefined;
  }

  return decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
}

async function getProductForImageAction(productId: number) {
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("id, slug, is_visible")
    .eq("id", productId)
    .is("deleted_at", null)
    .single();

  if (error || !product) {
    redirect(routes.adminProducts);
  }

  return {
    product,
    supabase,
  };
}

async function revalidateProductImagePaths(
  productId: number,
  slug: string,
) {
  revalidatePath(routes.adminProducts);
  revalidatePath(routes.adminProductEdit(productId));
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
  revalidatePath(routes.productDetail(slug));
}

async function resequenceProductImages(productId: number) {
  const supabase = await createClient();

  const { data: images, error } = await supabase
    .from("product_images")
    .select("id, display_order")
    .eq("product_id", productId)
    .order("display_order")
    .order("id");

  if (error) {
    reportServerError({
      operation: "admin.product_image.resequence",
      error,
      productId,
    });
    return;
  }

  const temporaryOrderStart =
    Math.max(
      0,
      ...(images ?? []).map((image) => image.display_order ?? 0),
    ) +
    (images?.length ?? 0) +
    1;

  await Promise.all(
    (images ?? []).map((image, index) =>
      supabase
        .from("product_images")
        .update({
          display_order: temporaryOrderStart + index,
        })
        .eq("id", image.id),
    ),
  );

  await Promise.all(
    (images ?? []).map((image, index) =>
      supabase
        .from("product_images")
        .update({
          display_order: index,
        })
        .eq("id", image.id),
    ),
  );
}

export async function uploadProductImageAction(formData: FormData) {
  await requireStaff();

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

  const { product, supabase } = await getProductForImageAction(productId);

  const { count, error: countError } = await supabase
    .from("product_images")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("product_id", productId);

  if (countError) {
    failProductImageAction({
      operation: "admin.product_image.count_for_upload",
      error: countError,
      productId,
      message: "Unable to upload product image.",
    });
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
    failProductImageAction({
      operation: "admin.product_image.upload_file",
      error: uploadError,
      productId,
      message: "Unable to upload product image.",
    });
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
    failProductImageAction({
      operation: "admin.product_image.create_record",
      error: imageInsertError,
      productId,
      message: "Unable to save product image.",
    });
  }

  await revalidateProductImagePaths(productId, product.slug);

  redirectToProductImages(productId, "Product image uploaded successfully.");
}

export async function deleteProductImageAction(formData: FormData) {
  await requireStaff();

  const productId = Number(formData.get("productId"));
  const imageId = Number(formData.get("imageId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    redirect(routes.adminProducts);
  }

  if (!Number.isInteger(imageId) || imageId <= 0) {
    redirectToProductImages(productId, "Invalid product image.");
  }

  const { product, supabase } = await getProductForImageAction(productId);

  const { data: image, error: imageError } = await supabase
    .from("product_images")
    .select("id, product_id, image_url")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (imageError || !image) {
    redirectToProductImages(productId, "Product image not found.");
  }

  const { count: imageCount, error: imageCountError } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  if (imageCountError) {
    failProductImageAction({
      operation: "admin.product_image.count_for_delete",
      error: imageCountError,
      productId,
      imageId,
      message: "Unable to delete product image.",
    });
  }

  if (product.is_visible && (imageCount ?? 0) <= 1) {
    redirectToProductImages(
      productId,
      "Hide this product before deleting its only image.",
    );
  }

  const storagePath = getStoragePathFromPublicUrl(image.image_url);

  if (storagePath) {
    const { error: removeError } = await supabase.storage
      .from(productImagesBucket)
      .remove([storagePath]);

    if (removeError) {
      failProductImageAction({
        operation: "admin.product_image.delete_file",
        error: removeError,
        productId,
        imageId,
        message: "Unable to delete product image.",
      });
    }
  }

  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);

  if (deleteError) {
    failProductImageAction({
      operation: "admin.product_image.delete_record",
      error: deleteError,
      productId,
      imageId,
      message: "Unable to delete product image.",
    });
  }

  await resequenceProductImages(productId);
  await revalidateProductImagePaths(productId, product.slug);

  redirectToProductImages(productId, "Product image deleted successfully.");
}

export async function setMainProductImageAction(formData: FormData) {
  await requireStaff();

  const productId = Number(formData.get("productId"));
  const imageId = Number(formData.get("imageId"));

  if (!Number.isInteger(productId) || productId <= 0) {
    redirect(routes.adminProducts);
  }

  if (!Number.isInteger(imageId) || imageId <= 0) {
    redirectToProductImages(productId, "Invalid product image.");
  }

  const { product, supabase } = await getProductForImageAction(productId);

  const { data: images, error } = await supabase
    .from("product_images")
    .select("id, display_order")
    .eq("product_id", productId)
    .order("display_order")
    .order("id");

  if (error) {
    failProductImageAction({
      operation: "admin.product_image.load_for_main",
      error,
      productId,
      imageId,
      message: "Unable to update main image.",
    });
  }

  const imageIds = (images ?? []).map((image) => image.id);

  if (!imageIds.includes(imageId)) {
    redirectToProductImages(productId, "Product image not found.");
  }

  const reorderedImageIds = [
    imageId,
    ...imageIds.filter((currentImageId) => currentImageId !== imageId),
  ];

  const temporaryOrderStart =
    Math.max(
      0,
      ...(images ?? []).map((image) => image.display_order ?? 0),
    ) +
    reorderedImageIds.length +
    1;

  const temporaryOrderResults = await Promise.all(
    reorderedImageIds.map((currentImageId, index) =>
      supabase
        .from("product_images")
        .update({
          display_order: temporaryOrderStart + index,
        })
        .eq("id", currentImageId)
        .eq("product_id", productId),
    ),
  );

  const temporaryOrderError = temporaryOrderResults.find(
    (result) => result.error,
  )?.error;

  if (temporaryOrderError) {
    failProductImageAction({
      operation: "admin.product_image.prepare_main",
      error: temporaryOrderError,
      productId,
      imageId,
      message: "Unable to update main image.",
    });
  }

  const finalOrderResults = await Promise.all(
    reorderedImageIds.map((currentImageId, index) =>
      supabase
        .from("product_images")
        .update({
          display_order: index,
        })
        .eq("id", currentImageId)
        .eq("product_id", productId),
    ),
  );

  const updateError = finalOrderResults.find((result) => result.error)?.error;

  if (updateError) {
    failProductImageAction({
      operation: "admin.product_image.update_main",
      error: updateError,
      productId,
      imageId,
      message: "Unable to update main image.",
    });
  }

  await revalidateProductImagePaths(productId, product.slug);

  redirectToProductImages(productId, "Main image updated successfully.");
}
