import type { AdminProductFormValues, InternalProduct } from "@/types/product";

export const defaultAdminProductFormValues: AdminProductFormValues = {
  code: "",
  slug: "",
  name: "",
  description: "",
  priceMMK: 0,
  category: "Women",
  images: [],
  sizes: [],
  colors: [],
  availability: "Available",
  stockQty: 0,
  isVisible: true,
};

export function createInternalProductFromForm(
  id: number,
  values: AdminProductFormValues
): InternalProduct {
  return {
    id,
    code: values.code.trim(),
    slug: values.slug.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    priceMMK: values.priceMMK,
    category: values.category,
    images: values.images,
    sizes: values.sizes,
    colors: values.colors,
    availability: values.availability,
    stockQty: values.stockQty,
    isVisible: values.isVisible,
  };
}