import type { InternalProduct } from "@/types/product";
import {
  calculateTotalStock,
  getProductRestockState,
} from "@/lib/product-stock";

export type AdminProductSummary = {
  totalProductCount: number;
  visibleProductCount: number;
  hiddenProductCount: number;
  totalStock: number;
  needsRestockProductCount: number;
};

export function getAdminProductSummary(
  products: InternalProduct[]
): AdminProductSummary {
  const visibleProductCount = products.filter(
    (product) => product.isVisible
  ).length;

  const hiddenProductCount = products.filter(
    (product) => !product.isVisible
  ).length;

  const totalStock = products.reduce(
    (total, product) => total + calculateTotalStock(product.stockItems),
    0
  );

  const needsRestockProductCount = products.filter(
    (product) => getProductRestockState(product.stockItems) !== "healthy",
  ).length;

  return {
    totalProductCount: products.length,
    visibleProductCount,
    hiddenProductCount,
    totalStock,
    needsRestockProductCount,
  };
}
