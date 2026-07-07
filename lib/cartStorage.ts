import type { CartItem } from "../types/cart";

const CART_STORAGE_KEY = "junerose_cart";

function isSameCartItem(item: CartItem, target: CartItem) {
  return (
    item.productId === target.productId &&
    item.selectedSize === target.selectedSize &&
    item.selectedColor === target.selectedColor
  );
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
    return JSON.parse(storedCart) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addCartItem(newItem: CartItem) {
  const currentItems = getCartItems();

  const existingItemIndex = currentItems.findIndex((item) =>
    isSameCartItem(item, newItem)
  );

  if (existingItemIndex >= 0) {
    currentItems[existingItemIndex].quantity += newItem.quantity;
    saveCartItems(currentItems);
    return;
  }

  saveCartItems([...currentItems, newItem]);
}

export function updateCartItemQuantity(targetItem: CartItem, quantity: number) {
  const currentItems = getCartItems();

  const updatedItems = currentItems
    .map((item) =>
      isSameCartItem(item, targetItem) ? { ...item, quantity } : item
    )
    .filter((item) => item.quantity > 0);

  saveCartItems(updatedItems);
}

export function removeCartItem(targetItem: CartItem) {
  const currentItems = getCartItems();

  const updatedItems = currentItems.filter(
    (item) => !isSameCartItem(item, targetItem)
  );

  saveCartItems(updatedItems);
}

export function clearCart() {
  saveCartItems([]);
}