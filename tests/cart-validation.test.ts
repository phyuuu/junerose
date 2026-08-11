import { describe, expect, it } from "vitest";
import {
  applyCartValidation,
  parseCartValidationResponse,
} from "@/lib/cart-validation";
import type { CartItem } from "@/types/cart";

const storedItem: CartItem = {
  variantId: 12,
  productId: 4,
  slug: "old-slug",
  name: "Old name",
  priceMMK: 1000,
  image: "/old.jpg",
  selectedSize: "S",
  selectedColor: "Black",
  quantity: 2,
};

describe("cart validation", () => {
  it("maps a valid database response", () => {
    const result = parseCartValidationResponse([
      {
        variant_id: 12,
        requested_quantity: 2,
        status: "insufficient_stock",
        product_id: 4,
        product_slug: "current-slug",
        product_name: "Current name",
        unit_price_mmk: 1500,
        image_url: "/current.jpg",
        selected_size: "Small",
        selected_color: "Black",
      },
    ]);

    expect(result[0]).toEqual({
      variantId: 12,
      requestedQuantity: 2,
      status: "insufficient_stock",
      productId: 4,
      slug: "current-slug",
      name: "Current name",
      priceMMK: 1500,
      image: "/current.jpg",
      selectedSize: "Small",
      selectedColor: "Black",
    });
  });

  it("rejects malformed database responses", () => {
    expect(() =>
      parseCartValidationResponse([
        {
          variant_id: 12,
          requested_quantity: 2,
          status: "unknown",
        },
      ]),
    ).toThrow("Unable to validate shopping bag.");
  });

  it("uses current canonical product information", () => {
    const [validation] = parseCartValidationResponse([
      {
        variant_id: 12,
        requested_quantity: 2,
        status: "available",
        product_id: 4,
        product_slug: "current-slug",
        product_name: "Current name",
        unit_price_mmk: 1500,
        image_url: "/current.jpg",
        selected_size: "Small",
        selected_color: "Rose",
      },
    ]);

    expect(applyCartValidation(storedItem, validation)).toEqual({
      ...storedItem,
      slug: "current-slug",
      name: "Current name",
      priceMMK: 1500,
      image: "/current.jpg",
      selectedSize: "Small",
      selectedColor: "Rose",
    });
  });

  it("keeps the stored snapshot when a variant is unavailable", () => {
    const [validation] = parseCartValidationResponse([
      {
        variant_id: 12,
        requested_quantity: 2,
        status: "unavailable",
        product_id: null,
        product_slug: null,
        product_name: null,
        unit_price_mmk: null,
        image_url: null,
        selected_size: null,
        selected_color: null,
      },
    ]);

    expect(applyCartValidation(storedItem, validation)).toEqual(storedItem);
  });
});
