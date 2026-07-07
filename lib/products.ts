import { products } from "../data/products";
import type { ProductCategory, PublicProduct } from "../types/product";

export function getPublicProducts(): PublicProduct[] {
  return products
    .filter((product) => product.isVisible)
    .map(
      ({
        id,
        slug,
        name,
        description,
        priceMMK,
        category,
        images,
        sizes,
        colors,
        availability,
      }) => ({
        id,
        slug,
        name,
        description,
        priceMMK,
        category,
        images,
        sizes,
        colors,
        availability,
      })
    );
}

export function getFeaturedProducts(): PublicProduct[] {
  return getPublicProducts().slice(0, 4);
}

export function getPublicProductBySlug(
  slug: string
): PublicProduct | undefined {
  return getPublicProducts().find((product) => product.slug === slug);
}

export function getPublicProductsByCategory(
  category: ProductCategory
): PublicProduct[] {
  return getPublicProducts().filter((product) => product.category === category);
}