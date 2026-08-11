import { describe, expect, it } from "vitest";
import {
  filterAdminProducts,
  parseAdminProductFilters,
} from "@/lib/admin-product-filters";
import { getAdminProductSummary } from "@/lib/admin-product-summary";
import {
  getProductRestockState,
  getVariantStockState,
} from "@/lib/product-stock";
import type { InternalProduct } from "@/types/product";

function createProduct(
  overrides: Partial<InternalProduct> & Pick<InternalProduct, "id" | "code" | "name">,
): InternalProduct {
  const { id, code, name, ...optionalOverrides } = overrides;

  return {
    id,
    code,
    name,
    slug: name.toLocaleLowerCase().replaceAll(" ", "-"),
    description: "Test product",
    priceMMK: 1000,
    department: { id: 1, name: "Women", slug: "women" },
    productType: { id: 1, name: "Underwear", slug: "underwear" },
    materials: [],
    images: [],
    sizes: [],
    colors: [],
    availability: "Available",
    stockQty: 0,
    stockItems: [],
    isVisible: true,
    ...optionalOverrides,
  };
}

const products = [
  createProduct({
    id: 1,
    code: "JR-1001",
    name: "Rose Brief",
    stockQty: 20,
    stockItems: [
      { variantId: 1, size: "S", color: "Black", quantity: 0 },
      { variantId: 2, size: "M", color: "Black", quantity: 20 },
    ],
  }),
  createProduct({
    id: 2,
    code: "JR-1002",
    name: "Cotton Top",
    stockQty: 16,
    stockItems: [
      { variantId: 3, size: "S", color: "White", quantity: 8 },
      { variantId: 4, size: "M", color: "White", quantity: 8 },
    ],
    isVisible: false,
  }),
  createProduct({
    id: 3,
    code: "JR-1003",
    name: "Lace Set",
    stockItems: [
      { variantId: 5, size: "S", color: "Rose", quantity: 0 },
    ],
  }),
];

describe("admin product stock and filters", () => {
  it("classifies stock per variant instead of by product total", () => {
    expect(getVariantStockState(products[0].stockItems[0])).toBe("sold_out");
    expect(getVariantStockState(products[0].stockItems[1])).toBe("healthy");
    expect(getProductRestockState(products[0].stockItems)).toBe(
      "needs_restock",
    );
    expect(getProductRestockState(products[2].stockItems)).toBe("sold_out");
  });

  it("counts products with any low or sold-out variant", () => {
    expect(getAdminProductSummary(products)).toMatchObject({
      totalProductCount: 3,
      needsRestockProductCount: 2,
    });
  });

  it("combines name or code search with visibility and stock filters", () => {
    expect(
      filterAdminProducts(products, {
        search: "JR-1002",
        visibility: "hidden",
        stock: "healthy",
      }).map((product) => product.name),
    ).toEqual(["Cotton Top"]);

    expect(
      filterAdminProducts(products, {
        search: "rose",
        visibility: "all",
        stock: "needs_restock",
      }).map((product) => product.name),
    ).toEqual(["Rose Brief"]);
  });

  it("normalizes unsupported URL filter values", () => {
    expect(
      parseAdminProductFilters({
        search: "  Cotton  ",
        visibility: "unknown",
        stock: ["sold_out", "healthy"],
      }),
    ).toEqual({
      search: "Cotton",
      visibility: "all",
      stock: "sold_out",
    });
  });
});
