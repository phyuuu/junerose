import type { InternalProduct } from "@/types/product";
import { calculateTotalStock } from "@/lib/product-stock";

const LOW_STOCK_THRESHOLD = 5;

export type AdminProductSummary = {
  totalProductCount: number;
  visibleProductCount: number;
  hiddenProductCount: number;
  totalStock: number;
  lowStockProductCount: number;
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

  const lowStockProductCount = products.filter((product) => {
    const stock = calculateTotalStock(product.stockItems);

    return stock > 0 && stock <= LOW_STOCK_THRESHOLD;
  }).length;

  return {
    totalProductCount: products.length,
    visibleProductCount,
    hiddenProductCount,
    totalStock,
    lowStockProductCount,
  };
}