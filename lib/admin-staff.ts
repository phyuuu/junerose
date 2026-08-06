import "server-only";

import { throwReportedServerError } from "@/lib/server/report-error";
import { createClient } from "@/lib/supabase/server";
import type { StaffAccess, StaffRole } from "@/types/staff";

type StaffAccessRow = {
  user_id?: unknown;
  email?: unknown;
  display_name?: unknown;
  role?: unknown;
  is_active?: unknown;
  created_at?: unknown;
  last_sign_in_at?: unknown;
};

function isStaffRole(value: unknown): value is StaffRole {
  return value === "admin" || value === "staff";
}

function parseStaffAccess(value: unknown): StaffAccess | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const row = value as StaffAccessRow;

  if (
    typeof row.user_id !== "string" ||
    typeof row.email !== "string" ||
    (row.display_name !== null && typeof row.display_name !== "string") ||
    !isStaffRole(row.role) ||
    typeof row.is_active !== "boolean" ||
    typeof row.created_at !== "string" ||
    (row.last_sign_in_at !== null &&
      typeof row.last_sign_in_at !== "string")
  ) {
    return null;
  }

  return {
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
    lastSignInAt: row.last_sign_in_at,
  };
}

export async function getStaffAccessList(): Promise<StaffAccess[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_staff_access");

  if (error || !Array.isArray(data)) {
    throwReportedServerError({
      operation: "admin.staff_access.list",
      error: error ?? new Error("Unexpected staff access response"),
      message: "Unable to load staff access.",
    });
  }

  const staff = data.map(parseStaffAccess);

  if (staff.some((member) => member === null)) {
    throwReportedServerError({
      operation: "admin.staff_access.parse_list",
      error: new Error("Unexpected staff access row"),
      message: "Unable to load staff access.",
    });
  }

  return staff as StaffAccess[];
}
