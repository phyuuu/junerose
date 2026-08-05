import type { ProductCategory } from "../types/product";

export const routes = {
  home: "/",
  catalog: "/catalog",
  cart: "/cart",
  order: "/order",
  checkOrder: "/check-order",
  privacy: "/privacy",

  admin: "/admin",
  adminLogin: "/admin/login",
  adminOrders: "/admin/orders",
  adminProducts: "/admin/products",
  adminArchivedProducts: "/admin/products/archived",
  adminInventoryHistory: "/admin/inventory/history",
  adminDataRetention: "/admin/privacy",
  adminProductNew: "/admin/products/new",
  adminProductSizes: "/admin/options/sizes",
  adminProductColors: "/admin/options/colors",

  adminProductEdit: (id: number) => `/admin/products/${id}/edit`,

  productDetail: (slug: string) => `/product/${slug}`,
  orderSuccess: (orderNumber: string) => `/order-success/${orderNumber}`,

  catalogByCategory: (category: ProductCategory) =>
    `/catalog?category=${encodeURIComponent(category)}`,
} as const;
