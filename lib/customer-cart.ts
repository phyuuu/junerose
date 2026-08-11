import { parseCartValidationResponse } from "@/lib/cart-validation";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, CartItemValidation } from "@/types/cart";

export async function validateCustomerCart(
  items: CartItem[],
): Promise<CartItemValidation[]> {
  if (items.length === 0) {
    return [];
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("validate_cart_items", {
    cart_items: items.map((item) => ({
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
  });

  if (error) {
    throw new Error("Unable to validate shopping bag.");
  }

  const validatedItems = parseCartValidationResponse(data);
  const requestedVariantIds = new Set(items.map((item) => item.variantId));

  if (
    validatedItems.length !== requestedVariantIds.size ||
    validatedItems.some((item) => !requestedVariantIds.has(item.variantId))
  ) {
    throw new Error("Unable to validate shopping bag.");
  }

  return validatedItems;
}
