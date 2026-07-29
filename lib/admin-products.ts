import "server-only";

import { createClient } from "@/lib/supabase/server";
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

type VariantRow = {
  id: number;
  product_id: number;
  size: string;
  color: string;
  quantity: number;
};

type ImageRow = {
  product_id: number;
  image_url: string;
};

function mapAdminProduct(
  product: ProductRow,
  variants: VariantRow[],
  images: ImageRow[],
): InternalProduct {
  const stockItems = variants
    .filter((variant) => variant.product_id === product.id)
    .map((variant) => ({
      variantId: variant.id,
      size: variant.size,
      color: variant.color,
      quantity: variant.quantity,
    }));

  const productImages = images
    .filter((image) => image.product_id === product.id)
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
    supabase.from("products").select("*").order("id"),

    supabase
      .from("product_variants")
      .select("id, product_id, size, color, quantity"),

    supabase
      .from("product_images")
      .select("product_id, image_url"),
  ]);

  if (productsError || variantsError || imagesError) {
    throw new Error("Unable to load admin products.");
  }

  return (products as ProductRow[]).map((product) =>
    mapAdminProduct(
      product,
      variants as VariantRow[],
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
      .single(),

    supabase
      .from("product_variants")
      .select("id, product_id, size, color, quantity")
      .eq("product_id", id),

    supabase
      .from("product_images")
      .select("product_id, image_url")
      .eq("product_id", id),
  ]);

  if (productError) {
    return undefined;
  }

  if (variantsError || imagesError) {
    throw new Error("Unable to load admin product.");
  }

  return mapAdminProduct(
    product as ProductRow,
    variants as VariantRow[],
    images as ImageRow[],
  );
}