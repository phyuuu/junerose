export type ProductCategory = "Women" | "Men" | "Pajamas" | "Swimwear";

export type ProductAvailability =
  | "Available"
  | "Low stock"
  | "Ask staff"
  | "Sold out";

export type ProductStockItem = {
  variantId: number;
  size: string;
  color: string;
  quantity: number;
};

export type InternalProduct = {
  id: number;
  code: string;
  slug: string;
  name: string;
  description: string;
  priceMMK: number;
  category: ProductCategory;
  images: string[];
  sizes: string[];
  colors: string[];
  availability: ProductAvailability;
  stockQty: number;
  stockItems: ProductStockItem[];
  isVisible: boolean;
};

export type PublicProduct = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceMMK: number;
  category: ProductCategory;
  images: string[];
  sizes: string[];
  colors: string[];
  variants: {
    variantId: number;
    size: string;
    color: string;
    isAvailable: boolean;
  }[];
  availability: ProductAvailability;
};

export type AdminProductFormValues = {
  code: string;
  slug: string;
  name: string;
  description: string;
  priceMMK: number;
  category: ProductCategory;
  images: string[];
  sizes: string[];
  colors: string[];
  availability: ProductAvailability;
  stockQty: number;
  stockItems: ProductStockItem[];
  isVisible: boolean;
};
