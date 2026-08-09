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

export type ProductTaxonomy = {
  name: string;
  slug: string;
};

export type ProductTaxonomyOption = ProductTaxonomy & {
  id: number;
};

export type ProductMaterial = ProductTaxonomyOption;

export type ProductImage = {
  id: number;
  url: string;
  colorId: number | null;
  colorName: string | null;
};

export type InternalProduct = {
  id: number;
  code: string;
  slug: string;
  name: string;
  description: string;
  priceMMK: number;
  department: ProductTaxonomyOption;
  productType: ProductTaxonomyOption;
  materials: ProductMaterial[];
  images: ProductImage[];
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
  department: ProductTaxonomy;
  productType: ProductTaxonomy;
  materials: ProductMaterial[];
  images: ProductImage[];
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
  department: ProductTaxonomyOption;
  productType: ProductTaxonomyOption;
  materials: ProductMaterial[];
  images: ProductImage[];
  sizes: string[];
  colors: string[];
  availability: ProductAvailability;
  stockQty: number;
  stockItems: ProductStockItem[];
  isVisible: boolean;
};
