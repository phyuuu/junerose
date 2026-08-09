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
  adminStaff: "/admin/staff",
  adminProductNew: "/admin/products/new",
  adminProductSizes: "/admin/options/sizes",
  adminProductColors: "/admin/options/colors",
  adminProductMaterials: "/admin/options/materials",

  adminProductEdit: (id: number) => `/admin/products/${id}/edit`,

  productDetail: (slug: string, color?: string) =>
    color
      ? `/product/${slug}?color=${encodeURIComponent(color)}`
      : `/product/${slug}`,
  orderSuccess: (orderNumber: string) => `/order-success/${orderNumber}`,

} as const;
