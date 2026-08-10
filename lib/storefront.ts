import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { reportServerError } from "@/lib/server/report-error";
import type { StorefrontSettings } from "@/types/storefront";

type PublicStorefrontRow = {
  hero_image_url: string | null;
  hero_title: string;
  hero_description: string;
};

export const defaultStorefrontSettings: StorefrontSettings = {
  heroImageUrl: null,
  heroTitle: "Everyday essentials, selected with care.",
  heroDescription: "Intimates, sleepwear, and comfort pieces for every day.",
};

export const getPublicStorefront = cache(async (): Promise<StorefrontSettings> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_storefront");

  if (error) {
    reportServerError({
      operation: "customer.storefront.load",
      error,
    });
    return defaultStorefrontSettings;
  }

  const row = (data?.[0] ?? null) as PublicStorefrontRow | null;

  if (!row) return defaultStorefrontSettings;

  return {
    heroImageUrl: row.hero_image_url,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
  };
});
