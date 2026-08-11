export type CartItem = {
  variantId: number;
  productId: number;
  slug: string;
  name: string;
  priceMMK: number;
  image: string;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
};

export type CartValidationStatus =
  | "available"
  | "insufficient_stock"
  | "unavailable";

export type CartItemValidation = {
  variantId: number;
  requestedQuantity: number;
  status: CartValidationStatus;
  productId: number | null;
  slug: string | null;
  name: string | null;
  priceMMK: number | null;
  image: string | null;
  selectedSize: string | null;
  selectedColor: string | null;
};
