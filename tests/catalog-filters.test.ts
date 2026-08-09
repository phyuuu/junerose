import { describe, expect, it } from "vitest";
import {
  filterCatalogProducts,
  getPreferredProductColor,
} from "@/lib/catalog-filters";
import { getProductImageForColor } from "@/lib/product-image";
import type { PublicProduct } from "@/types/product";

const cottonUnderwear: PublicProduct = {
  id: 1,
  slug: "cotton-underwear",
  name: "Cotton Underwear",
  description: "Test product",
  priceMMK: 10000,
  department: { name: "Women", slug: "women" },
  productType: { name: "Underwear", slug: "underwear" },
  materials: [{ id: 1, name: "Cotton", slug: "cotton" }],
  images: [
    { id: 1, url: "/general.jpg", colorId: null, colorName: null },
    { id: 2, url: "/black.jpg", colorId: 1, colorName: "Black" },
  ],
  sizes: ["S", "M"],
  colors: ["Black", "White"],
  variants: [
    { variantId: 1, size: "S", color: "Black", isAvailable: true },
    { variantId: 2, size: "M", color: "White", isAvailable: false },
  ],
  availability: "Available",
};

const silkPajamas: PublicProduct = {
  ...cottonUnderwear,
  id: 2,
  slug: "silk-pajamas",
  name: "Silk Pajamas",
  productType: { name: "Pajamas", slug: "pajamas" },
  materials: [{ id: 2, name: "Silk", slug: "silk" }],
  colors: ["White"],
  variants: [
    { variantId: 3, size: "M", color: "White", isAvailable: true },
  ],
};

describe("catalog filtering", () => {
  it("uses AND between groups and ignores out-of-stock colors", () => {
    expect(
      filterCatalogProducts([cottonUnderwear, silkPajamas], {
        departments: ["women"],
        productTypes: ["underwear"],
        materials: ["cotton"],
        colors: ["Black"],
      }),
    ).toEqual([cottonUnderwear]);

    expect(
      filterCatalogProducts([cottonUnderwear], {
        departments: [],
        productTypes: [],
        materials: [],
        colors: ["White"],
      }),
    ).toEqual([]);
  });

  it("uses OR within one filter group", () => {
    expect(
      filterCatalogProducts([cottonUnderwear, silkPajamas], {
        departments: [],
        productTypes: ["underwear", "pajamas"],
        materials: [],
        colors: [],
      }),
    ).toHaveLength(2);
  });
});

describe("color-aware product images", () => {
  it("selects the matching color image and falls back to the main image", () => {
    expect(getProductImageForColor(cottonUnderwear, "Black")).toBe("/black.jpg");
    expect(getProductImageForColor(cottonUnderwear, "White")).toBe("/general.jpg");
    expect(getPreferredProductColor(cottonUnderwear, ["White", "Black"])).toBe("Black");
  });
});
