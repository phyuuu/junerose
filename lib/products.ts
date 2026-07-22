import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  ProductAvailability,
  ProductCategory,
  PublicProduct,
} from "@/types/product";

type PublicProductRow = {
  id: number;
  slug: string;
  name: string;
  description: string;
  price_mmk: number;
  category: ProductCategory;
  availability: ProductAvailability;
};

type PublicProductImageRow = {
  product_id: number;
  image_url: string;
  display_order: number;
};

type PublicProductVariantRow = {
  product_id: number;
  size: string;
  color: string;
};

async function loadPublicProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient();

  const [
    { data: productRows, error: productsError },
    { data: imageRows, error: imagesError },
    { data: variantRows, error: variantsError },
  ] = await Promise.all([
    supabase
      .from("public_products")
      .select(
        "id, slug, name, description, price_mmk, category, availability",
      )
      .order("id"),

    supabase
      .from("product_images")
      .select("product_id, image_url, display_order")
      .order("display_order"),

    supabase
      .from("product_variants")
      .select("product_id, size, color"),
  ]);

  if (productsError) {
    throw new Error("Unable to load public products.");
  }

  if (imagesError) {
    throw new Error("Unable to load public product images.");
  }

  if (variantsError) {
    throw new Error("Unable to load public product options.");
  }

  const products = (productRows ?? []) as PublicProductRow[];
  const images = (imageRows ?? []) as PublicProductImageRow[];
  const variants = (variantRows ?? []) as PublicProductVariantRow[];

  return products.map((product) => {
    const productImages = images
      .filter((image) => image.product_id === product.id)
      .sort((a, b) => a.display_order - b.display_order)
      .map((image) => image.image_url);

    const productVariants = variants.filter(
      (variant) => variant.product_id === product.id,
    );

    const sizes = [
      ...new Set(productVariants.map((variant) => variant.size)),
    ];

    const colors = [
      ...new Set(productVariants.map((variant) => variant.color)),
    ];

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceMMK: product.price_mmk,
      category: product.category,
      images: productImages,
      sizes,
      colors,
      availability: product.availability,
    };
  });
}

export async function getPublicProducts(): Promise<PublicProduct[]> {
  return loadPublicProducts();
}

export async function getFeaturedProducts(): Promise<PublicProduct[]> {
  const products = await loadPublicProducts();

  return products.slice(0, 4);
}

export async function getPublicProductBySlug(
  slug: string,
): Promise<PublicProduct | undefined> {
  const products = await loadPublicProducts();

  return products.find((product) => product.slug === slug);
}

export async function getPublicProductsByCategory(
  category: ProductCategory,
): Promise<PublicProduct[]> {
  const products = await loadPublicProducts();

  return products.filter((product) => product.category === category);
}