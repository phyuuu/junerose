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
  category: InternalProduct["category"];
  availability: InternalProduct["availability"];
  is_visible: boolean;
};

type OptionNameRow = {
  name: string;
};

type VariantRow = {
  id: number;
  product_id: number;
  quantity: number;
  sizes: OptionNameRow | OptionNameRow[] | null;
  colors: OptionNameRow | OptionNameRow[] | null;
};

type ImageRow = {
  product_id: number;
  image_url: string;
  display_order: number | null;
};

function getRelatedOptionName(
  relation: OptionNameRow | OptionNameRow[] | null,
): string {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? "Unknown";
  }

  return relation?.name ?? "Unknown";
}

function mapAdminProduct(
  product: ProductRow,
  variants: VariantRow[],
  images: ImageRow[],
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
    .map((image) => image.image_url);

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
    category: product.category,
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
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*")
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
      .select("product_id, image_url, display_order")
      .order("display_order")
      .order("id"),
  ]);

  if (productsError || variantsError || imagesError) {
    throwReportedServerError({
      operation: "admin.products.load_active",
      error: productsError ?? variantsError ?? imagesError,
      message: "Unable to load admin products.",
    });
  }

  return (products as ProductRow[]).map((product) =>
    mapAdminProduct(
      product,
      variants as unknown as VariantRow[],
      images as ImageRow[],
    ),
  );
}

export async function getArchivedAdminProducts(): Promise<InternalProduct[]> {
  const supabase = await createClient();

  const [
    { data: products, error: productsError },
    { data: variants, error: variantsError },
    { data: images, error: imagesError },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*")
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
      .select("product_id, image_url, display_order")
      .order("display_order")
      .order("id"),
  ]);

  if (productsError || variantsError || imagesError) {
    throwReportedServerError({
      operation: "admin.products.load_archived",
      error: productsError ?? variantsError ?? imagesError,
      message: "Unable to load archived admin products.",
    });
  }

  return (products as ProductRow[]).map((product) =>
    mapAdminProduct(
      product,
      variants as unknown as VariantRow[],
      images as ImageRow[],
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
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*")
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
      .select("product_id, image_url, display_order")
      .eq("product_id", id)
      .order("display_order")
      .order("id"),
  ]);

  if (productError) {
    return undefined;
  }

  if (variantsError || imagesError) {
    throwReportedServerError({
      operation: "admin.product.load_detail",
      error: variantsError ?? imagesError,
      productId: id,
      message: "Unable to load admin product.",
    });
  }

  return mapAdminProduct(
    product as ProductRow,
    variants as unknown as VariantRow[],
    images as ImageRow[],
  );
}
