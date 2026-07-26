import type { ProductCategory } from "../types/product";

export const routes = {
  home: "/",
  catalog: "/catalog",
  cart: "/cart",
  order: "/order",

  admin: "/admin",
  adminLogin: "/admin/login",
  adminOrders: "/admin/orders",
  adminProducts: "/admin/products",
  
  adminProductEdit: (id: number) => `/admin/products/${id}/edit`,

  productDetail: (slug: string) => `/product/${slug}`,
  orderSuccess: (orderNumber: string) => `/order-success/${orderNumber}`,

  catalogByCategory: (category: ProductCategory) =>
    `/catalog?category=${encodeURIComponent(category)}`,
} as const;