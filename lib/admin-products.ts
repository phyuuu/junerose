import "server-only";

import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";
import type { InternalProduct } from "@/types/product";

type ProductRow = {
  id: number;
  code: string;
  slug: string;
  name: string;
  description: string;
  price_mmk: number;
  department_id: number;
  product_type_id: number;
  departments: TaxonomyRow | TaxonomyRow[] | null;
  product_types: TaxonomyRow | TaxonomyRow[] | null;
  availability: InternalProduct["availability"];
  is_visible: boolean;
};

type OptionNameRow = {
  name: string;
};

type TaxonomyRow = {
  id: number;
  name: string;
  slug: string;
};

type VariantRow = {
  id: number;
  product_id: number;
  quantity: number;
  sizes: OptionNameRow | OptionNameRow[] | null;
  colors: OptionNameRow | OptionNameRow[] | null;
};

type ImageRow = {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number | null;
  color_id: number | null;
  colors: OptionNameRow | OptionNameRow[] | null;
};

type ProductMaterialRow = {
  product_id: number;
  materials: TaxonomyRow | TaxonomyRow[] | null;
};

function getRelatedOptionName(
  relation: OptionNameRow | OptionNameRow[] | null,
): string {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? "Unknown";
  }

  return relation?.name ?? "Unknown";
}

function getRelatedTaxonomy(
  relation: TaxonomyRow | TaxonomyRow[] | null,
): TaxonomyRow {
  const option = Array.isArray(relation) ? relation[0] : relation;

  return option ?? { id: 0, name: "Unknown", slug: "unknown" };
}

function mapAdminProduct(
  product: ProductRow,
  variants: VariantRow[],
  images: ImageRow[],
  materialRows: ProductMaterialRow[],
): InternalProduct {
  const stockItems = variants
    .filter((variant) => variant.product_id === product.id)
    .map((variant) => ({
      variantId: variant.id,
      size: getRelatedOptionName(variant.sizes),
      color: getRelatedOptionName(variant.colors),
      quantity: variant.quantity,
    }));

  const productImages = images
    .filter((image) => image.product_id === product.id)
    .sort(
      (firstImage, secondImage) =>
        (firstImage.display_order ?? 0) -
        (secondImage.display_order ?? 0),
    )
    .map((image) => ({
      id: image.id,
      url: image.image_url,
      colorId: image.color_id,
      colorName: getRelatedOptionName(image.colors) === "Unknown"
        ? null
        : getRelatedOptionName(image.colors),
    }));

  const materials = materialRows
    .filter((material) => material.product_id === product.id)
    .map((material) => getRelatedTaxonomy(material.materials));

  const stockQty = stockItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return {
    id: product.id,
    code: product.code,
    slug: product.slug,
    name: product.name,
    description: product.description,
    priceMMK: product.price_mmk,
    department: getRelatedTaxonomy(product.departments),
    productType: getRelatedTaxonomy(product.product_types),
    materials,
    images: productImages,
    sizes: [...new Set(stockItems.map((item) => item.size))],
    colors: [...new Set(stockItems.map((item) => item.color))],
    availability: product.availability,
    stockQty,
    stockItems,
    isVisible: product.is_visible,
  };
}

export async function getAdminProducts(): Promise<InternalProduct[]> {
  const supabase = await createClient();

  const [
    { data: products, error: productsError },
    { data: variants, error: variantsError },
    { data: images, error: imagesError },
    { data: materials, error: materialsError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, departments (id, name, slug), product_types (id, name, slug)")
      .is("deleted_at", null)
      .order("id"),

    supabase
      .from("product_variants")
      .select(
        `
          id,
          product_id,
          quantity,
          sizes (
            name
          ),
          colors (
            name
          )
        `,
      ),

    supabase
      .from("product_images")
      .select("id, product_id, image_url, display_order, color_id, colors (name)")
      .order("display_order")
      .order("id"),

    supabase
      .from("product_materials")
      .select("product_id, materials (id, name, slug)"),
  ]);

  if (productsError || variantsError || imagesError || materialsError) {
    throwReportedServerError({
      operation: "admin.products.load_active",
      error: productsError ?? variantsError ?? imagesError ?? materialsError,
      message: "Unable to load admin products.",
    });
  }

  return (products as ProductRow[]).map((product) =>
    mapAdminProduct(
      product,
      variants as unknown as VariantRow[],
      images as unknown as ImageRow[],
      materials as unknown as ProductMaterialRow[],
    ),
  );
}

export async function getArchivedAdminProducts(): Promise<InternalProduct[]> {
  const supabase = await createClient();

  const [
    { data: products, error: productsError },
    { data: variants, error: variantsError },
    { data: images, error: imagesError },
    { data: materials, error: materialsError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, departments (id, name, slug), product_types (id, name, slug)")
      .not("deleted_at", "is", null)
      .order("id"),

    supabase
      .from("product_variants")
      .select(
        `
          id,
          product_id,
          quantity,
          sizes (
            name
          ),
          colors (
            name
          )
        `,
      ),

    supabase
      .from("product_images")
      .select("id, product_id, image_url, display_order, color_id, colors (name)")
      .order("display_order")
      .order("id"),

    supabase
      .from("product_materials")
      .select("product_id, materials (id, name, slug)"),
  ]);

  if (productsError || variantsError || imagesError || materialsError) {
    throwReportedServerError({
      operation: "admin.products.load_archived",
      error: productsError ?? variantsError ?? imagesError ?? materialsError,
      message: "Unable to load archived admin products.",
    });
  }

  return (products as ProductRow[]).map((product) =>
    mapAdminProduct(
      product,
      variants as unknown as VariantRow[],
      images as unknown as ImageRow[],
      materials as unknown as ProductMaterialRow[],
    ),
  );
}

export async function getAdminProductById(
  id: number,
): Promise<InternalProduct | undefined> {
  const supabase = await createClient();

  const [
    { data: product, error: productError },
    { data: variants, error: variantsError },
    { data: images, error: imagesError },
    { data: materials, error: materialsError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, departments (id, name, slug), product_types (id, name, slug)")
      .eq("id", id)
      .is("deleted_at", null)
      .single(),

    supabase
      .from("product_variants")
      .select(
        `
          id,
          product_id,
          quantity,
          sizes (
            name
          ),
          colors (
            name
          )
        `,
      )
      .eq("product_id", id),

    supabase
      .from("product_images")
      .select("id, product_id, image_url, display_order, color_id, colors (name)")
      .eq("product_id", id)
      .order("display_order")
      .order("id"),

    supabase
      .from("product_materials")
      .select("product_id, materials (id, name, slug)")
      .eq("product_id", id),
  ]);

  if (productError) {
    return undefined;
  }

  if (variantsError || imagesError || materialsError) {
    throwReportedServerError({
      operation: "admin.product.load_detail",
      error: variantsError ?? imagesError ?? materialsError,
      productId: id,
      message: "Unable to load admin product.",
    });
  }

  return mapAdminProduct(
    product as ProductRow,
    variants as unknown as VariantRow[],
    images as unknown as ImageRow[],
    materials as unknown as ProductMaterialRow[],
  );
}
