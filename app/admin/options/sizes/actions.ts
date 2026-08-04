"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";

const sizesPath = "/admin/options/sizes";

function redirectWithMessage(
  type: "error" | "saved",
  message?: string,
): never {
  if (type === "saved") {
    redirect(
      `${sizesPath}?saved=${encodeURIComponent(
        message ?? "Size saved successfully.",
      )}`,
    );
  }

  redirect(
    `${sizesPath}?error=${encodeURIComponent(
      message ?? "Unable to save size.",
    )}`,
  );
}

function failSizeAction(
  operation: string,
  error: unknown,
  message: string,
  sizeId?: number,
): never {
  const referenceId = reportServerError({
    operation,
    error,
    sizeId,
  });

  redirectWithMessage("error", withErrorReference(message, referenceId));
}

export async function createSizeAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const sortOrderValue = String(formData.get("sortOrder") ?? "").trim();

  if (!name) {
    redirectWithMessage("error", "Size name is required.");
  }

  const sortOrder = sortOrderValue ? Number(sortOrderValue) : null;

  if (sortOrderValue && !Number.isInteger(sortOrder)) {
    redirectWithMessage("error", "Sort order must be a whole number.");
  }

  const supabase = await createClient();

  const { data: existingSize, error: existingSizeError } = await supabase
    .from("sizes")
    .select("id")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (existingSizeError) {
    failSizeAction(
      "admin.size.check_duplicate",
      existingSizeError,
      "Unable to check whether this size already exists.",
    );
  }

  if (existingSize) {
    redirectWithMessage("error", "A size with this name already exists.");
  }

  const { error } = await supabase.from("sizes").insert({
    name,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) {
    failSizeAction("admin.size.create", error, "Unable to create size.");
  }

  revalidatePath(sizesPath);
  redirectWithMessage("saved", "Size saved successfully.");
}

export async function deleteSizeAction(formData: FormData) {
  await requireAdmin();

  const sizeId = Number(formData.get("sizeId"));

  if (!Number.isInteger(sizeId) || sizeId <= 0) {
    redirectWithMessage("error", "Invalid size.");
  }

  const supabase = await createClient();

  const { count, error: usageError } = await supabase
    .from("product_variants")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("size_id", sizeId);

  if (usageError) {
    failSizeAction(
      "admin.size.check_usage",
      usageError,
      "Unable to check whether this size is used.",
      sizeId,
    );
  }

  if ((count ?? 0) > 0) {
    redirectWithMessage(
      "error",
      "This size is used by products. Deactivate it instead of deleting it.",
    );
  }

  const { error } = await supabase
    .from("sizes")
    .delete()
    .eq("id", sizeId);

  if (error) {
    failSizeAction("admin.size.delete", error, "Unable to delete size.", sizeId);
  }

  revalidatePath(sizesPath);
  redirectWithMessage("saved", "Size deleted successfully.");
}

export async function updateSizeSortOrderAction(formData: FormData) {
  await requireAdmin();

  const sizeId = Number(formData.get("sizeId"));
  const sortOrderValue = String(formData.get("sortOrder") ?? "").trim();

  if (!Number.isInteger(sizeId) || sizeId <= 0) {
    redirectWithMessage("error", "Invalid size.");
  }

  const sortOrder = sortOrderValue ? Number(sortOrderValue) : null;

  if (sortOrderValue && !Number.isInteger(sortOrder)) {
    redirectWithMessage("error", "Sort order must be a whole number.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("sizes")
    .update({
      sort_order: sortOrder,
    })
    .eq("id", sizeId);

  if (error) {
    failSizeAction(
      "admin.size.update_sort_order",
      error,
      "Unable to update size sort order.",
      sizeId,
    );
  }

  revalidatePath(sizesPath);
  redirectWithMessage("saved", "Size sort order updated successfully.");
}

export async function toggleSizeActiveAction(formData: FormData) {
  await requireAdmin();

  const sizeId = Number(formData.get("sizeId"));
  const nextIsActive = formData.get("nextIsActive") === "true";

  if (!Number.isInteger(sizeId) || sizeId <= 0) {
    redirectWithMessage("error", "Invalid size.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("sizes")
    .update({
      is_active: nextIsActive,
    })
    .eq("id", sizeId);

  if (error) {
    failSizeAction(
      "admin.size.update_status",
      error,
      "Unable to update size status.",
      sizeId,
    );
  }

  revalidatePath(sizesPath);
  redirectWithMessage(
    "saved",
    nextIsActive
      ? "Size activated successfully."
      : "Size deactivated successfully.",
  );
}
