"use server";

import { createClient } from "@/lib/supabase/server";
import { createOrderRequestSchema } from "@/lib/validation/order";
import type { OrderRequest } from "@/types/order";

type CreateOrderRequestResult =
  | {
      ok: true;
      order: OrderRequest;
    }
  | {
      ok: false;
      error: string;
    };

export async function createOrderRequestAction(
  input: unknown,
): Promise<CreateOrderRequestResult> {
  const parsed = createOrderRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the order details and try again.",
    };
  }

  const { customer, items } = parsed.data;
  const totalMMK = items.reduce(
    (total, item) => total + item.priceMMK * item.quantity,
    0,
  );

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_order_request", {
    order_customer_name: customer.name,
    order_customer_phone: customer.phone,
    order_customer_address: customer.address,
    order_preferred_contact: customer.preferredContact,
    order_customer_note: customer.note ?? null,
    order_items: items.map((item) => ({
      product_id: item.productId,
      product_slug: item.slug,
      product_name: item.name,
      unit_price_mmk: item.priceMMK,
      image_url: item.image,
      selected_size: item.selectedSize,
      selected_color: item.selectedColor,
      quantity: item.quantity,
    })),
  });

  if (error || !data) {
    console.error("Unable to create order request:", error);

    return {
      ok: false,
      error: "Unable to send order request. Please try again.",
    };
  }

  const orderNumber =
    typeof data === "string"
      ? data
      : Array.isArray(data)
        ? data[0]?.order_number
        : data.order_number;

  if (!orderNumber || typeof orderNumber !== "string") {
    console.error("Unexpected order request response:", data);

    return {
      ok: false,
      error: "Unable to send order request. Please try again.",
    };
  }

  return {
    ok: true,
    order: {
      orderNumber,
      customer,
      items,
      totalMMK,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  };
}
