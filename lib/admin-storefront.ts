import "server-only";

import { requireStaff } from "@/lib/auth/require-staff";
import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";
import type { AdminStorefrontSettings } from "@/types/storefront";

type StorefrontSettingsRow = {
  hero_image_url: string | null;
  hero_image_path: string | null;
  hero_title: string;
  hero_description: string;
  updated_at: string;
};

export async function getAdminStorefront(): Promise<AdminStorefrontSettings> {
  await requireStaff();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("storefront_settings")
    .select("hero_image_url, hero_image_path, hero_title, hero_description, updated_at")
    .eq("id", 1)
    .single();

  if (error || !data) {
    throwReportedServerError({
      operation: "admin.storefront.load",
      error: error ?? new Error("Storefront settings row is missing."),
      message: "Unable to load storefront settings.",
    });
  }

  const row = data as StorefrontSettingsRow;

  return {
    heroImageUrl: row.hero_image_url,
    heroImagePath: row.hero_image_path,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    updatedAt: row.updated_at,
  };
}
