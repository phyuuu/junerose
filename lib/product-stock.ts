import type { ProductStockItem } from "@/types/product";

export function calculateTotalStock(stockItems: ProductStockItem[]): number {
  return stockItems.reduce((total, item) => total + item.quantity, 0);
}