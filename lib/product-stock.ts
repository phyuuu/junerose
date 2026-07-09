import type { InternalProduct, ProductStockItem } from "@/types/product";

export function calculateTotalStock(stockItems: ProductStockItem[]): number {
  return stockItems.reduce((total, item) => total + item.quantity, 0);
}

export function isProductStockConsistent(product: InternalProduct): boolean {
  return product.stockQty === calculateTotalStock(product.stockItems);
}