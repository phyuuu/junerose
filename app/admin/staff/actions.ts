"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { routes } from "@/lib/routes";
import {
  reportServerError,
  withErrorReference,
} from "@/lib/server/report-error";
import { createClient } from "@/lib/supabase/server";
import {
  validateStaffDisplayName,
  validateStaffEmail,
} from "@/lib/validation/admin-staff";

function redirectWithMessage(type: "error" | "saved", message: string): never {
  redirect(`${routes.adminStaff}?${type}=${encodeURIComponent(message)}`);
}

function getKnownStaffAccessError(message: string | undefined) {
  if (
    message === "No Supabase Auth account exists for this email." ||
    message === "This account already has active staff access." ||
    message === "Admin access cannot be changed from the website." ||
    message === "Staff access record not found." ||
    message === "Enter a valid staff display name."
  ) {
    return message;
  }

  return undefined;
}

export async function addStaffAccessAction(formData: FormData) {
  await requireAdmin();

  const result = validateStaffEmail(formData.get("email"));
  const displayNameResult = validateStaffDisplayName(
    formData.get("displayName"),
  );

  if (!result.email) {
    redirectWithMessage(
      "error",
      result.error ?? "Enter a valid email address.",
    );
  }

  if (!displayNameResult.displayName) {
    redirectWithMessage(
      "error",
      displayNameResult.error ?? "Enter a valid staff display name.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_staff_access", {
    target_email: result.email,
    target_display_name: displayNameResult.displayName,
  });

  if (error) {
    const knownError = getKnownStaffAccessError(error.message);

    if (knownError) {
      redirectWithMessage("error", knownError);
    }

    const referenceId = reportServerError({
      operation: "admin.staff_access.add",
      error,
    });

    redirectWithMessage(
      "error",
      withErrorReference("Unable to add staff access.", referenceId),
    );
  }

  revalidatePath(routes.adminStaff);
  redirectWithMessage("saved", "Staff access added successfully.");
}

export async function updateStaffDisplayNameAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const displayNameResult = validateStaffDisplayName(
    formData.get("displayName"),
  );

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    redirectWithMessage("error", "Select a valid staff account.");
  }

  if (!displayNameResult.displayName) {
    redirectWithMessage(
      "error",
      displayNameResult.error ?? "Enter a valid staff display name.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_staff_display_name", {
    target_user_id: userId,
    next_display_name: displayNameResult.displayName,
  });

  if (error) {
    const knownError = getKnownStaffAccessError(error.message);

    if (knownError) {
      redirectWithMessage("error", knownError);
    }

    const referenceId = reportServerError({
      operation: "admin.staff_access.update_display_name",
      error,
    });

    redirectWithMessage(
      "error",
      withErrorReference("Unable to update the display name.", referenceId),
    );
  }

  revalidatePath(routes.adminStaff);
  revalidatePath(routes.adminInventoryHistory);
  redirectWithMessage("saved", "Display name updated successfully.");
}

export async function setStaffAccessActiveAction(formData: FormData) {
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "").trim();
  const nextIsActive = formData.get("nextIsActive") === "true";

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    redirectWithMessage("error", "Select a valid staff account.");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_staff_access_active", {
    target_user_id: userId,
    next_is_active: nextIsActive,
  });

  if (error) {
    const knownError = getKnownStaffAccessError(error.message);

    if (knownError) {
      redirectWithMessage("error", knownError);
    }

    const referenceId = reportServerError({
      operation: "admin.staff_access.update",
      error,
    });

    redirectWithMessage(
      "error",
      withErrorReference("Unable to update staff access.", referenceId),
    );
  }

  revalidatePath(routes.adminStaff);
  redirectWithMessage(
    "saved",
    nextIsActive
      ? "Staff access reactivated successfully."
      : "Staff access deactivated successfully.",
  );
}
