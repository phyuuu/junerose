import "server-only";

import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";

export async function requireAdmin() {
  const staff = await requireStaff();

  if (staff.role !== "admin") {
    redirect(routes.admin);
  }

  return staff;
}
