type ProductWithImages = {
  images: string[];
};

export function getMainProductImage(product: ProductWithImages): string {
  return product.images[0] ?? "/products/soft-cotton-set.jpg";
}

export function getExtraProductImages(product: ProductWithImages): string[] {
  return product.images.slice(1);
}
