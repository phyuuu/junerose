import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ProductOption = {
  id: number;
  name: string;
};

export type AdminProductOptions = {
  sizes: ProductOption[];
  colors: ProductOption[];
};

export async function getAdminProductOptions(): Promise<AdminProductOptions> {
  const supabase = await createClient();

  const [
    { data: sizes, error: sizesError },
    { data: colors, error: colorsError },
  ] = await Promise.all([
    supabase
      .from("sizes")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order")
      .order("id"),

    supabase
      .from("colors")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order")
      .order("id"),
  ]);

  if (sizesError || colorsError) {
    console.error("Unable to load product options:", {
      sizesError,
      colorsError,
    });

    throw new Error("Unable to load product size and color options.");
  }

  return {
    sizes: sizes ?? [],
    colors: colors ?? [],
  };
}