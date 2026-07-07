// lib/admin-products.ts

import { products } from "@/data/products";
import type { InternalProduct } from "@/types/product";

export function getAdminProducts(): InternalProduct[] {
  return products;
}

export function getAdminProductById(id: number): InternalProduct | undefined {
  return products.find((product) => product.id === id);
}

export function getAdminProductByCode(
  code: string
): InternalProduct | undefined {
  return products.find((product) => product.code === code);
}