"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { reportServerError, withErrorReference } from "@/lib/server/report-error";
import { validateStorefrontContent } from "@/lib/validation/storefront";

const storefrontBucket = "storefront-assets";
const maxImageSizeBytes = 5 * 1024 * 1024;
const imageExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function redirectWithMessage(type: "error" | "saved", message: string): never {
  redirect(`${routes.adminStorefront}?${type}=${encodeURIComponent(message)}`);
}

function failStorefrontAction(
  operation: string,
  error: unknown,
  message: string,
): never {
  const referenceId = reportServerError({ operation, error });
  redirectWithMessage("error", withErrorReference(message, referenceId));
}

function revalidateStorefront() {
  revalidatePath(routes.home);
  revalidatePath(routes.adminStorefront);
}

async function removeStoredAsset(
  objectPath: string | null,
  operation: string,
) {
  if (!objectPath) return;

  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(storefrontBucket)
    .remove([objectPath]);

  if (error) {
    reportServerError({ operation, error });
  }
}

export async function updateStorefrontContentAction(formData: FormData) {
  const staff = await requireStaff();
  const result = validateStorefrontContent(formData);

  if (!result.success) {
    redirectWithMessage(
      "error",
      result.error.issues[0]?.message ?? "Enter valid storefront content.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("storefront_settings")
    .update({
      hero_title: result.data.heroTitle,
      hero_description: result.data.heroDescription,
      updated_by: staff.userId,
    })
    .eq("id", 1);

  if (error) {
    failStorefrontAction(
      "admin.storefront.update_content",
      error,
      "Unable to update storefront content.",
    );
  }

  revalidateStorefront();
  redirectWithMessage("saved", "Storefront content updated.");
}

export async function uploadStorefrontHeroAction(formData: FormData) {
  const staff = await requireStaff();
  const imageFile = formData.get("heroImage");

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    redirectWithMessage("error", "Choose a hero image to upload.");
  }

  const extension = imageExtensions.get(imageFile.type);

  if (!extension) {
    redirectWithMessage("error", "Hero image must be a JPG, PNG, or WebP file.");
  }

  if (imageFile.size > maxImageSizeBytes) {
    redirectWithMessage("error", "Hero image must be 5 MB or smaller.");
  }

  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("storefront_settings")
    .select("hero_image_path")
    .eq("id", 1)
    .single();

  if (currentError || !current) {
    failStorefrontAction(
      "admin.storefront.load_before_upload",
      currentError ?? new Error("Storefront settings row is missing."),
      "Unable to upload the hero image.",
    );
  }

  const objectPath = `hero/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(storefrontBucket)
    .upload(objectPath, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    });

  if (uploadError) {
    failStorefrontAction(
      "admin.storefront.upload_hero",
      uploadError,
      "Unable to upload the hero image.",
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(storefrontBucket)
    .getPublicUrl(objectPath);
  const { error: updateError } = await supabase
    .from("storefront_settings")
    .update({
      hero_image_url: publicUrlData.publicUrl,
      hero_image_path: objectPath,
      updated_by: staff.userId,
    })
    .eq("id", 1);

  if (updateError) {
    await removeStoredAsset(objectPath, "admin.storefront.cleanup_failed_upload");
    failStorefrontAction(
      "admin.storefront.save_hero",
      updateError,
      "Unable to save the hero image.",
    );
  }

  await removeStoredAsset(
    current.hero_image_path,
    "admin.storefront.cleanup_replaced_hero",
  );
  revalidateStorefront();
  redirectWithMessage("saved", "Storefront hero image updated.");
}

export async function removeStorefrontHeroAction() {
  const staff = await requireStaff();
  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase
    .from("storefront_settings")
    .select("hero_image_path")
    .eq("id", 1)
    .single();

  if (currentError || !current) {
    failStorefrontAction(
      "admin.storefront.load_before_remove",
      currentError ?? new Error("Storefront settings row is missing."),
      "Unable to remove the hero image.",
    );
  }

  const { error: updateError } = await supabase
    .from("storefront_settings")
    .update({
      hero_image_url: null,
      hero_image_path: null,
      updated_by: staff.userId,
    })
    .eq("id", 1);

  if (updateError) {
    failStorefrontAction(
      "admin.storefront.remove_hero",
      updateError,
      "Unable to remove the hero image.",
    );
  }

  await removeStoredAsset(
    current.hero_image_path,
    "admin.storefront.delete_removed_hero",
  );
  revalidateStorefront();
  redirectWithMessage("saved", "Custom hero image removed.");
}
