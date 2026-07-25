import "server-only";

import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect(routes.adminLogin);
  }

  const { data: isActiveStaff, error: staffError } = await supabase.rpc(
    "current_user_is_active_staff",
  );

  if (staffError || isActiveStaff !== true) {
    redirect(routes.adminLogin);
  }

  return claimsData.claims;
}