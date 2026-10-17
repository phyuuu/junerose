"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";
import { reportServerError, withErrorReference } from "@/lib/server/report-error";
import { createClient } from "@/lib/supabase/server";
import { validateStoreLocationForm } from "@/lib/validation/store-location";

function redirectWithMessage(type: "error" | "saved", message: string): never {
  redirect(
    `${routes.adminStoreLocations}?${type}=${encodeURIComponent(message)}`,
  );
}

function failStoreLocationAction(
  operation: string,
  error: unknown,
  message: string,
  storeLocationId?: number,
): never {
  const referenceId = reportServerError({
    operation,
    error,
    storeLocationId,
  });

  redirectWithMessage("error", withErrorReference(message, referenceId));
}

function getStoreLocationId(formData: FormData) {
  const storeLocationId = Number(formData.get("storeLocationId"));

  if (!Number.isInteger(storeLocationId) || storeLocationId <= 0) {
    redirectWithMessage("error", "Invalid store location.");
  }

  return storeLocationId;
}

function getLocationValues(formData: FormData) {
  const result = validateStoreLocationForm(formData);

  if (!result.success) {
    redirectWithMessage(
      "error",
      result.error.issues[0]?.message ?? "Enter valid store information.",
    );
  }

  return {
    name: result.data.name,
    township: result.data.township,
    address: result.data.address,
    phone: result.data.phone || null,
    opening_hours: result.data.openingHours || null,
    map_url: result.data.mapUrl || null,
    display_order: result.data.displayOrder,
    is_active: result.data.isActive,
  };
}

async function locationAlreadyExists(
  name: string,
  township: string,
  excludedId?: number,
) {
  const supabase = await createClient();
  let query = supabase
    .from("store_locations")
    .select("id")
    .ilike("name", name)
    .ilike("township", township)
    .limit(1);

  if (excludedId) {
    query = query.neq("id", excludedId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    failStoreLocationAction(
      "admin.store_location.check_duplicate",
      error,
      "Unable to check whether this store already exists.",
      excludedId,
    );
  }

  return Boolean(data);
}

export async function createStoreLocationAction(formData: FormData) {
  const staff = await requireStaff();
  const values = getLocationValues(formData);

  if (await locationAlreadyExists(values.name, values.township)) {
    redirectWithMessage(
      "error",
      "A store with this name already exists in this township.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("store_locations").insert({
    ...values,
    updated_by: staff.userId,
  });

  if (error) {
    failStoreLocationAction(
      "admin.store_location.create",
      error,
      "Unable to create store location.",
    );
  }

  revalidatePath(routes.adminStoreLocations);
  redirectWithMessage("saved", "Store location created successfully.");
}

export async function updateStoreLocationAction(formData: FormData) {
  const staff = await requireStaff();
  const storeLocationId = getStoreLocationId(formData);
  const values = getLocationValues(formData);

  if (
    await locationAlreadyExists(
      values.name,
      values.township,
      storeLocationId,
    )
  ) {
    redirectWithMessage(
      "error",
      "A store with this name already exists in this township.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("store_locations")
    .update({
      ...values,
      updated_by: staff.userId,
    })
    .eq("id", storeLocationId);

  if (error) {
    failStoreLocationAction(
      "admin.store_location.update",
      error,
      "Unable to update store location.",
      storeLocationId,
    );
  }

  revalidatePath(routes.adminStoreLocations);
  redirectWithMessage("saved", "Store location updated successfully.");
}

export async function toggleStoreLocationActiveAction(formData: FormData) {
  const staff = await requireStaff();
  const storeLocationId = getStoreLocationId(formData);
  const nextIsActive = formData.get("nextIsActive") === "true";
  const supabase = await createClient();
  const { error } = await supabase
    .from("store_locations")
    .update({
      is_active: nextIsActive,
      updated_by: staff.userId,
    })
    .eq("id", storeLocationId);

  if (error) {
    failStoreLocationAction(
      "admin.store_location.update_status",
      error,
      "Unable to update store status.",
      storeLocationId,
    );
  }

  revalidatePath(routes.adminStoreLocations);
  redirectWithMessage(
    "saved",
    nextIsActive
      ? "Store location activated successfully."
      : "Store location deactivated successfully.",
  );
}
