import { z } from "zod";
import type { CartItem, CartItemValidation } from "@/types/cart";

const cartValidationResponseSchema = z.array(
  z.object({
    variant_id: z.number().int().positive(),
    requested_quantity: z.number().int().positive().max(20),
    status: z.enum(["available", "insufficient_stock", "unavailable"]),
    product_id: z.number().int().positive().nullable(),
    product_slug: z.string().min(1).nullable(),
    product_name: z.string().min(1).nullable(),
    unit_price_mmk: z.number().int().nonnegative().nullable(),
    image_url: z.string().min(1).nullable(),
    selected_size: z.string().min(1).nullable(),
    selected_color: z.string().min(1).nullable(),
  }),
);

export function parseCartValidationResponse(
  value: unknown,
): CartItemValidation[] {
  const parsed = cartValidationResponseSchema.safeParse(value);

  if (!parsed.success) {
    throw new Error("Unable to validate shopping bag.");
  }

  return parsed.data.map((item) => ({
    variantId: item.variant_id,
    requestedQuantity: item.requested_quantity,
    status: item.status,
    productId: item.product_id,
    slug: item.product_slug,
    name: item.product_name,
    priceMMK: item.unit_price_mmk,
    image: item.image_url,
    selectedSize: item.selected_size,
    selectedColor: item.selected_color,
  }));
}

export function applyCartValidation(
  item: CartItem,
  validation: CartItemValidation | undefined,
): CartItem {
  if (!validation || validation.productId === null) {
    return item;
  }

  return {
    ...item,
    productId: validation.productId,
    slug: validation.slug ?? item.slug,
    name: validation.name ?? item.name,
    priceMMK: validation.priceMMK ?? item.priceMMK,
    image: validation.image ?? item.image,
    selectedSize: validation.selectedSize ?? item.selectedSize,
    selectedColor: validation.selectedColor ?? item.selectedColor,
  };
}
