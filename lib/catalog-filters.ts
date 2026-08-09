import type { PublicProduct, ProductTaxonomy } from "@/types/product";

export type CatalogFilterState = {
  departments: string[];
  productTypes: string[];
  materials: string[];
  colors: string[];
};

export type CatalogFilterOptions = {
  departments: ProductTaxonomy[];
  productTypes: ProductTaxonomy[];
  materials: ProductTaxonomy[];
  colors: string[];
};

function includesIgnoreCase(values: string[], value: string): boolean {
  return values.some((item) => item.toLowerCase() === value.toLowerCase());
}

export function filterCatalogProducts(
  products: PublicProduct[],
  filters: CatalogFilterState,
): PublicProduct[] {
  return products.filter((product) => {
    const matchesDepartment =
      filters.departments.length === 0 ||
      includesIgnoreCase(filters.departments, product.department.slug);
    const matchesType =
      filters.productTypes.length === 0 ||
      includesIgnoreCase(filters.productTypes, product.productType.slug);
    const matchesMaterial =
      filters.materials.length === 0 ||
      product.materials.some((material) =>
        includesIgnoreCase(filters.materials, material.slug),
      );
    const matchesColor =
      filters.colors.length === 0 ||
      product.variants.some(
        (variant) =>
          variant.isAvailable &&
          includesIgnoreCase(filters.colors, variant.color),
      );

    return matchesDepartment && matchesType && matchesMaterial && matchesColor;
  });
}

export function getCatalogFilterOptions(
  products: PublicProduct[],
): CatalogFilterOptions {
  const departments = new Map<string, ProductTaxonomy>();
  const productTypes = new Map<string, ProductTaxonomy>();
  const materials = new Map<string, ProductTaxonomy>();
  const colors = new Set<string>();

  for (const product of products) {
    departments.set(product.department.slug, product.department);
    productTypes.set(product.productType.slug, product.productType);
    for (const material of product.materials) {
      materials.set(material.slug, material);
    }
    for (const variant of product.variants) {
      if (variant.isAvailable) {
        colors.add(variant.color);
      }
    }
  }

  const byName = <T extends { name: string }>(first: T, second: T) =>
    first.name.localeCompare(second.name);

  return {
    departments: [...departments.values()].sort(byName),
    productTypes: [...productTypes.values()].sort(byName),
    materials: [...materials.values()].sort(byName),
    colors: [...colors].sort((first, second) => first.localeCompare(second)),
  };
}

export function getPreferredProductColor(
  product: PublicProduct,
  selectedColors: string[],
): string | undefined {
  return selectedColors.find((color) =>
    product.variants.some(
      (variant) =>
        variant.isAvailable && variant.color.toLowerCase() === color.toLowerCase(),
    ),
  );
}
