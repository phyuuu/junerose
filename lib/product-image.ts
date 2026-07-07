import type { PublicProduct } from "@/types/product";

export function getMainProductImage(product: PublicProduct): string {
  return product.images[0] ?? "/products/soft-cotton-set.jpg";
}

export function getExtraProductImages(product: PublicProduct): string[] {
  return product.images.slice(1);
}