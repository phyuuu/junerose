import type { CartItem } from "@/types/cart";

const CART_STORAGE_KEY = "junerose_cart";

export const CART_STORAGE_EVENT = "junerose_cart_changed";

const MAX_CART_ITEM_QUANTITY = 20;

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    Number.isInteger(item.variantId) &&
    Number(item.variantId) > 0 &&
    Number.isInteger(item.productId) &&
    Number(item.productId) > 0 &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    Number.isInteger(item.priceMMK) &&
    Number(item.priceMMK) >= 0 &&
    typeof item.image === "string" &&
    typeof item.selectedSize === "string" &&
    typeof item.selectedColor === "string" &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) > 0 &&
    Number(item.quantity) <= MAX_CART_ITEM_QUANTITY
  );
}

function notifyCartChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CART_STORAGE_EVENT));
}

function isSameCartItem(item: CartItem, target: CartItem) {
  return item.variantId === target.variantId;
}

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    return [];
  }

  try {
    const parsedCart: unknown = JSON.parse(storedCart);

    return Array.isArray(parsedCart) ? parsedCart.filter(isCartItem) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyCartChanged();
}

export function addCartItem(newItem: CartItem) {
  const currentItems = getCartItems();

  const existingItemIndex = currentItems.findIndex((item) =>
    isSameCartItem(item, newItem),
  );

  if (existingItemIndex >= 0) {
    const updatedItems = currentItems.map((item, index) =>
      index === existingItemIndex
        ? {
            ...item,
            quantity: Math.min(
              item.quantity + newItem.quantity,
              MAX_CART_ITEM_QUANTITY,
            ),
          }
        : item,
    );

    saveCartItems(updatedItems);
    return;
  }

  saveCartItems([...currentItems, newItem]);
}

export function updateCartItemQuantity(targetItem: CartItem, quantity: number) {
  const currentItems = getCartItems();
  const safeQuantity = Math.min(quantity, MAX_CART_ITEM_QUANTITY);

  const updatedItems = currentItems
    .map((item) =>
      isSameCartItem(item, targetItem)
        ? { ...item, quantity: safeQuantity }
        : item,
    )
    .filter((item) => item.quantity > 0);

  saveCartItems(updatedItems);
}

export function removeCartItem(targetItem: CartItem) {
  const currentItems = getCartItems();

  const updatedItems = currentItems.filter(
    (item) => !isSameCartItem(item, targetItem),
  );

  saveCartItems(updatedItems);
}

export function clearCart() {
  saveCartItems([]);
}
