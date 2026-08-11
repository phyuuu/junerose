import { getProductRestockState } from "@/lib/product-stock";
import type { InternalProduct } from "@/types/product";

export type AdminProductVisibilityFilter = "all" | "visible" | "hidden";
export type AdminProductStockFilter =
  | "all"
  | "needs_restock"
  | "sold_out"
  | "healthy";

export type AdminProductFilters = {
  search: string;
  visibility: AdminProductVisibilityFilter;
  stock: AdminProductStockFilter;
};

type SearchParams = Record<string, string | string[] | undefined>;

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseAdminProductFilters(
  searchParams: SearchParams,
): AdminProductFilters {
  const visibilityValue = getFirstValue(searchParams.visibility);
  const stockValue = getFirstValue(searchParams.stock);

  return {
    search: (getFirstValue(searchParams.search) ?? "").trim().slice(0, 100),
    visibility:
      visibilityValue === "visible" || visibilityValue === "hidden"
        ? visibilityValue
        : "all",
    stock:
      stockValue === "needs_restock" ||
      stockValue === "sold_out" ||
      stockValue === "healthy"
        ? stockValue
        : "all",
  };
}

export function filterAdminProducts(
  products: InternalProduct[],
  filters: AdminProductFilters,
) {
  const normalizedSearch = filters.search.toLocaleLowerCase();

  return products.filter((product) => {
    if (
      normalizedSearch &&
      !product.name.toLocaleLowerCase().includes(normalizedSearch) &&
      !product.code.toLocaleLowerCase().includes(normalizedSearch)
    ) {
      return false;
    }

    if (
      filters.visibility === "visible" &&
      !product.isVisible
    ) {
      return false;
    }

    if (filters.visibility === "hidden" && product.isVisible) {
      return false;
    }

    const restockState = getProductRestockState(product.stockItems);

    if (
      filters.stock === "needs_restock" &&
      restockState === "healthy"
    ) {
      return false;
    }

    if (filters.stock === "sold_out" && restockState !== "sold_out") {
      return false;
    }

    if (filters.stock === "healthy" && restockState !== "healthy") {
      return false;
    }

    return true;
  });
}
