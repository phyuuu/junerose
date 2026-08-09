"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import { reportServerError, withErrorReference } from "@/lib/server/report-error";

function redirectWithMessage(type: "error" | "saved", message: string): never {
  redirect(`${routes.adminProductMaterials}?${type}=${encodeURIComponent(message)}`);
}

function failMaterialAction(
  operation: string,
  error: unknown,
  message: string,
  materialId?: number,
): never {
  const referenceId = reportServerError({
    operation,
    error,
    materialId,
  });
  redirectWithMessage("error", withErrorReference(message, referenceId));
}

function createSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readSortOrder(formData: FormData): number | null {
  const value = String(formData.get("sortOrder") ?? "").trim();
  const sortOrder = value ? Number(value) : null;

  if (value && !Number.isInteger(sortOrder)) {
    redirectWithMessage("error", "Sort order must be a whole number.");
  }

  return sortOrder;
}

function revalidateMaterialPaths() {
  revalidatePath(routes.adminProductMaterials);
  revalidatePath(routes.adminProducts);
  revalidatePath(routes.catalog);
  revalidatePath(routes.home);
}

export async function createMaterialAction(formData: FormData) {
  await requireStaff();

  const name = String(formData.get("name") ?? "").trim();
  const slug = createSlug(name);

  if (!name) {
    redirectWithMessage("error", "Material name is required.");
  }

  if (!slug) {
    redirectWithMessage(
      "error",
      "Use at least one English letter or number in the material name.",
    );
  }

  const sortOrder = readSortOrder(formData);
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("materials")
    .select("id")
    .or(`name.ilike.${name},slug.eq.${slug}`)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    failMaterialAction(
      "admin.material.check_duplicate",
      existingError,
      "Unable to check whether this material already exists.",
    );
  }

  if (existing) {
    redirectWithMessage("error", "A material with this name already exists.");
  }

  const { error } = await supabase.from("materials").insert({
    name,
    slug,
    sort_order: sortOrder,
    is_active: true,
  });

  if (error) {
    failMaterialAction("admin.material.create", error, "Unable to create material.");
  }

  revalidateMaterialPaths();
  redirectWithMessage("saved", "Material saved successfully.");
}

export async function updateMaterialSortOrderAction(formData: FormData) {
  await requireStaff();

  const materialId = Number(formData.get("materialId"));
  if (!Number.isInteger(materialId) || materialId <= 0) {
    redirectWithMessage("error", "Invalid material.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("materials")
    .update({ sort_order: readSortOrder(formData) })
    .eq("id", materialId);

  if (error) {
    failMaterialAction(
      "admin.material.update_sort_order",
      error,
      "Unable to update material sort order.",
      materialId,
    );
  }

  revalidateMaterialPaths();
  redirectWithMessage("saved", "Material sort order updated successfully.");
}

export async function toggleMaterialActiveAction(formData: FormData) {
  await requireStaff();

  const materialId = Number(formData.get("materialId"));
  const nextIsActive = formData.get("nextIsActive") === "true";
  if (!Number.isInteger(materialId) || materialId <= 0) {
    redirectWithMessage("error", "Invalid material.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("materials")
    .update({ is_active: nextIsActive })
    .eq("id", materialId);

  if (error) {
    failMaterialAction(
      "admin.material.update_status",
      error,
      "Unable to update material status.",
      materialId,
    );
  }

  revalidateMaterialPaths();
  redirectWithMessage(
    "saved",
    nextIsActive ? "Material activated successfully." : "Material deactivated successfully.",
  );
}

export async function deleteMaterialAction(formData: FormData) {
  await requireStaff();

  const materialId = Number(formData.get("materialId"));
  if (!Number.isInteger(materialId) || materialId <= 0) {
    redirectWithMessage("error", "Invalid material.");
  }

  const supabase = await createClient();
  const { count, error: usageError } = await supabase
    .from("product_materials")
    .select("product_id", { count: "exact", head: true })
    .eq("material_id", materialId);

  if (usageError) {
    failMaterialAction(
      "admin.material.check_usage",
      usageError,
      "Unable to check whether this material is used.",
      materialId,
    );
  }

  if ((count ?? 0) > 0) {
    redirectWithMessage(
      "error",
      "This material is used by products. Deactivate it instead of deleting it.",
    );
  }

  const { error } = await supabase.from("materials").delete().eq("id", materialId);
  if (error) {
    failMaterialAction("admin.material.delete", error, "Unable to delete material.", materialId);
  }

  revalidateMaterialPaths();
  redirectWithMessage("saved", "Material deleted successfully.");
}
