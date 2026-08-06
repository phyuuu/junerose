import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/types/staff";

function isStaffRole(value: unknown): value is StaffRole {
  return value === "admin" || value === "staff";
}

export const requireStaff = cache(async () => {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !claimsData?.claims || typeof userId !== "string") {
    redirect(routes.adminLogin);
  }

  const { data: staff, error: staffError } = await supabase
    .from("staff_users")
    .select("role, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (
    staffError ||
    !staff?.is_active ||
    !isStaffRole(staff.role)
  ) {
    redirect(routes.adminLogin);
  }

  return {
    claims: claimsData.claims,
    userId,
    role: staff.role,
  };
});
