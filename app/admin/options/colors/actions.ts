"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import { createClient } from "@/lib/supabase/server";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";

const colorsPath = "/admin/options/colors";

function redirectWithMessage(
  type: "error" | "saved",
  message?: string,
): never {
  if (type === "saved") {
    redirect(
      `${colorsPath}?saved=${encodeURIComponent(
        message ?? "Color saved successfully.",
      )}`,
    );
  }

  redirect(
    `${colorsPath}?error=${encodeURIComponent(
      message ?? "Unable to save color.",
    )}`,
  );
}

function failColorAction(
  operation: string,
  error: unknown,
  message: string,
  colorId?: number,
): never {
  const referenceId = reportServerError({
    operation,
    error,
    colorId,
  });

  redirectWithMessage("error", withErrorReference(message, referenceId));
}

export async function createColorAction(formData: FormData) {
  await requireStaff();

  const name = String(formData.get("name") ?? "").trim();
  const sortOrderValue = String(formData.get("sortOrder") ?? "").trim();

  if (!name) {
    redirectWithMessage("error", "Color name is required.");
  }

  const sortOrder = sortOrderValue ? Number(sortOrderValue) : null;

  if (sortOrderValue && !Number.isInteger(sortOrder)) {
    redirectWithMessage("error", "Sort order must be a whole number.");
  }

  const supabase = await createClient();

  const { data: existingColor, error: existingColorError } = await supabase
    .from("colors")
    .select("id")
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (existingColorError) {
    failColorAction(
      "admin.color.check_duplicate",
      existingColorError,
      "Unable to check whether this color already exists.",
    );
  }

  if (existingColor) {
    redirectWithMessage("error", "A color with this name already exists.");
  }

  const { error } = await supabase.from("colors").insert({
    name,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) {
    failColorAction("admin.color.create", error, "Unable to create color.");
  }

  revalidatePath(colorsPath);
  redirectWithMessage("saved", "Color saved successfully.");
}

export async function deleteColorAction(formData: FormData) {
  await requireStaff();

  const colorId = Number(formData.get("colorId"));

  if (!Number.isInteger(colorId) || colorId <= 0) {
    redirectWithMessage("error", "Invalid color.");
  }

  const supabase = await createClient();

  const { count, error: usageError } = await supabase
    .from("product_variants")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("color_id", colorId);

  if (usageError) {
    failColorAction(
      "admin.color.check_usage",
      usageError,
      "Unable to check whether this color is used.",
      colorId,
    );
  }

  if ((count ?? 0) > 0) {
    redirectWithMessage(
      "error",
      "This color is used by products. Deactivate it instead of deleting it.",
    );
  }

  const { error } = await supabase
    .from("colors")
    .delete()
    .eq("id", colorId);

  if (error) {
    failColorAction(
      "admin.color.delete",
      error,
      "Unable to delete color.",
      colorId,
    );
  }

  revalidatePath(colorsPath);
  redirectWithMessage("saved", "Color deleted successfully.");
}

export async function updateColorSortOrderAction(formData: FormData) {
  await requireStaff();

  const colorId = Number(formData.get("colorId"));
  const sortOrderValue = String(formData.get("sortOrder") ?? "").trim();

  if (!Number.isInteger(colorId) || colorId <= 0) {
    redirectWithMessage("error", "Invalid color.");
  }

  const sortOrder = sortOrderValue ? Number(sortOrderValue) : null;

  if (sortOrderValue && !Number.isInteger(sortOrder)) {
    redirectWithMessage("error", "Sort order must be a whole number.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("colors")
    .update({
      sort_order: sortOrder,
    })
    .eq("id", colorId);

  if (error) {
    failColorAction(
      "admin.color.update_sort_order",
      error,
      "Unable to update color sort order.",
      colorId,
    );
  }

  revalidatePath(colorsPath);
  redirectWithMessage("saved", "Color sort order updated successfully.");
}

export async function toggleColorActiveAction(formData: FormData) {
  await requireStaff();

  const colorId = Number(formData.get("colorId"));
  const nextIsActive = formData.get("nextIsActive") === "true";

  if (!Number.isInteger(colorId) || colorId <= 0) {
    redirectWithMessage("error", "Invalid color.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("colors")
    .update({
      is_active: nextIsActive,
    })
    .eq("id", colorId);

  if (error) {
    failColorAction(
      "admin.color.update_status",
      error,
      "Unable to update color status.",
      colorId,
    );
  }

  revalidatePath(colorsPath);
  redirectWithMessage(
    "saved",
    nextIsActive
      ? "Color activated successfully."
      : "Color deactivated successfully.",
  );
}
