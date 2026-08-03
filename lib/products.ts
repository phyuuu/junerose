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

type OptionNameRow = {
  name: string;
};

type PublicProductVariantRow = {
  product_id: number;
  size?: string | null;
  color?: string | null;
  sizes?: OptionNameRow | OptionNameRow[] | null;
  colors?: OptionNameRow | OptionNameRow[] | null;
};

function getRelatedOptionName(
  relation: OptionNameRow | OptionNameRow[] | null | undefined,
  fallback?: string | null,
): string {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? fallback ?? "Unknown";
  }

  return relation?.name ?? fallback ?? "Unknown";
}

function getVariantSize(variant: PublicProductVariantRow): string {
  return getRelatedOptionName(variant.sizes, variant.size);
}

function getVariantColor(variant: PublicProductVariantRow): string {
  return getRelatedOptionName(variant.colors, variant.color);
}

async function loadPublicProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient();

  const [
    { data: productRows, error: productsError },
    { data: imageRows, error: imagesError },
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
  ]);

  const {
    data: relatedVariantRows,
    error: relatedVariantsError,
  } = await supabase.from("product_variants").select(
    `
      product_id,
      size,
      color,
      sizes (
        name
      ),
      colors (
        name
      )
    `,
  );

  if (productsError) {
    throw new Error("Unable to load public products.");
  }

  if (imagesError) {
    throw new Error("Unable to load public product images.");
  }

  let variantRows = relatedVariantRows as
    | PublicProductVariantRow[]
    | null;

  if (relatedVariantsError) {
    console.error(
      "Unable to load reusable public product options. Falling back to stored text options:",
      relatedVariantsError,
    );

    const {
      data: fallbackVariantRows,
      error: fallbackVariantsError,
    } = await supabase
      .from("product_variants")
      .select("product_id, size, color");

    if (fallbackVariantsError) {
      console.error(
        "Unable to load fallback public product options:",
        fallbackVariantsError,
      );

      throw new Error("Unable to load public product options.");
    }

    variantRows = fallbackVariantRows as PublicProductVariantRow[] | null;
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
      ...new Set(
        productVariants.map((variant) => getVariantSize(variant)),
      ),
    ];

    const colors = [
      ...new Set(
        productVariants.map((variant) => getVariantColor(variant)),
      ),
    ];
    const publicVariants = productVariants.map((variant) => ({
      size: getVariantSize(variant),
      color: getVariantColor(variant),
    }));

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
      variants: publicVariants,
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
