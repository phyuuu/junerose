import type { InternalProduct, ProductStockItem } from "@/types/product";

export function calculateTotalStock(stockItems: ProductStockItem[]): number {
  return stockItems.reduce((total, item) => total + item.quantity, 0);
}

export const LOW_STOCK_VARIANT_THRESHOLD = 5;

export type VariantStockState = "sold_out" | "low_stock" | "healthy";
export type ProductRestockState =
  | "sold_out"
  | "needs_restock"
  | "healthy";

export function getVariantStockState(
  stockItem: ProductStockItem,
): VariantStockState {
  if (stockItem.quantity <= 0) {
    return "sold_out";
  }

  return stockItem.quantity <= LOW_STOCK_VARIANT_THRESHOLD
    ? "low_stock"
    : "healthy";
}

export function getProductRestockState(
  stockItems: ProductStockItem[],
): ProductRestockState {
  if (
    stockItems.length === 0 ||
    stockItems.every((stockItem) => getVariantStockState(stockItem) === "sold_out")
  ) {
    return "sold_out";
  }

  return stockItems.some(
    (stockItem) => getVariantStockState(stockItem) !== "healthy",
  )
    ? "needs_restock"
    : "healthy";
}

export function isProductStockConsistent(product: InternalProduct): boolean {
  return product.stockQty === calculateTotalStock(product.stockItems);
}
