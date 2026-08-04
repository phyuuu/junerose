import "server-only";

import { createClient } from "@/lib/supabase/server";
import { throwReportedServerError } from "@/lib/server/report-error";
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
  variant_id: number;
  product_id: number;
  size_name: string;
  color_name: string;
  is_available: boolean;
};

async function loadPublicProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient();

  const [
    { data: productRows, error: productsError },
    { data: imageRows, error: imagesError },
    { data: variantRows, error: variantsError },
  ] = await Promise.all([
    supabase.rpc("get_public_products"),
    supabase.rpc("get_public_product_images"),
    supabase.rpc("get_public_product_variants"),
  ]);

  if (productsError) {
    throwReportedServerError({
      operation: "customer.catalog.load_products",
      error: productsError,
      message: "Unable to load products.",
    });
  }

  if (imagesError) {
    throwReportedServerError({
      operation: "customer.catalog.load_images",
      error: imagesError,
      message: "Unable to load product images.",
    });
  }

  if (variantsError) {
    throwReportedServerError({
      operation: "customer.catalog.load_variants",
      error: variantsError,
      message: "Unable to load product options.",
    });
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
      ...new Set(productVariants.map((variant) => variant.size_name)),
    ];

    const colors = [
      ...new Set(
        productVariants.map((variant) => variant.color_name),
      ),
    ];
    const publicVariants = productVariants.map((variant) => ({
      variantId: variant.variant_id,
      size: variant.size_name,
      color: variant.color_name,
      isAvailable: variant.is_available,
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
