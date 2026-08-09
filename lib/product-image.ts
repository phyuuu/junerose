import type { ProductImage } from "@/types/product";

type ProductWithImages = { images: ProductImage[] };

export function getProductImageForColor(
  product: ProductWithImages,
  colorName?: string | null,
): string {
  if (colorName) {
    const colorImage = product.images.find(
      (image) => image.colorName?.toLowerCase() === colorName.toLowerCase(),
    );

    if (colorImage) {
      return colorImage.url;
    }
  }

  return product.images[0]?.url ?? "/products/soft-cotton-set.jpg";
}

export function getMainProductImage(product: ProductWithImages): string {
  return getProductImageForColor(product);
}

export function getExtraProductImages(product: ProductWithImages): ProductImage[] {
  return product.images.slice(1);
}
