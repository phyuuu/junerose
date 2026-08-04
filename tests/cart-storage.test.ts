import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addCartItem,
  getCartItems,
  updateCartItemQuantity,
} from "@/lib/cartStorage";
import type { CartItem } from "@/types/cart";
import { installBrowserStorage, type MemoryStorage } from "./browser-storage";

const cartItem: CartItem = {
  variantId: 10,
  productId: 2,
  slug: "cotton-set",
  name: "Cotton Set",
  priceMMK: 25000,
  image: "/products/cotton-set.jpg",
  selectedSize: "M",
  selectedColor: "Black",
  quantity: 1,
};

describe("cart storage", () => {
  let localStorage: MemoryStorage;

  beforeEach(() => {
    ({ localStorage } = installBrowserStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ignores legacy and malformed browser cart entries", () => {
    localStorage.setItem(
      "junerose_cart",
      JSON.stringify([
        { ...cartItem, variantId: undefined },
        { ...cartItem, quantity: 999 },
        cartItem,
      ]),
    );

    expect(getCartItems()).toEqual([cartItem]);
  });

  it("uses immutable variant identity and caps merged quantities", () => {
    addCartItem({ ...cartItem, quantity: 15 });
    addCartItem({
      ...cartItem,
      name: "Changed browser snapshot",
      priceMMK: 1,
      quantity: 10,
    });

    expect(getCartItems()).toEqual([{ ...cartItem, quantity: 20 }]);
  });

  it("removes an item when its quantity is reduced to zero", () => {
    addCartItem(cartItem);
    updateCartItemQuantity(cartItem, 0);

    expect(getCartItems()).toEqual([]);
  });
});
