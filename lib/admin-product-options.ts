import "server-only";

import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";

export type ProductOption = {
  id: number;
  name: string;
};

export type ProductTaxonomyOption = ProductOption & {
  slug: string;
};

export type AdminProductOptions = {
  sizes: ProductOption[];
  colors: ProductOption[];
  departments: ProductTaxonomyOption[];
  productTypes: ProductTaxonomyOption[];
  materials: ProductTaxonomyOption[];
};

export async function getAdminProductOptions(): Promise<AdminProductOptions> {
  const supabase = await createClient();

  const [
    { data: sizes, error: sizesError },
    { data: colors, error: colorsError },
    { data: departments, error: departmentsError },
    { data: productTypes, error: productTypesError },
    { data: materials, error: materialsError },
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

    supabase
      .from("departments")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order")
      .order("id"),

    supabase
      .from("product_types")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order")
      .order("id"),

    supabase
      .from("materials")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order")
      .order("id"),
  ]);

  if (
    sizesError ||
    colorsError ||
    departmentsError ||
    productTypesError ||
    materialsError
  ) {
    throwReportedServerError({
      operation: "admin.product_options.load",
      error:
        sizesError ??
        colorsError ??
        departmentsError ??
        productTypesError ??
        materialsError,
      message: "Unable to load product options.",
    });
  }

  return {
    sizes: sizes ?? [],
    colors: colors ?? [],
    departments: departments ?? [],
    productTypes: productTypes ?? [],
    materials: materials ?? [],
  };
}
