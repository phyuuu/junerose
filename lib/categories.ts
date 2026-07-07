import { productCategories } from "../data/categories";
import type { ProductCategory } from "../types/product";

export function isProductCategory(
  category: string
): category is ProductCategory {
  return productCategories.includes(category as ProductCategory);
}