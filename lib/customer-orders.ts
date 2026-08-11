import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/types/cart";
import type { OrderRequest, OrderStatus } from "@/types/order";

type FindOrderItemResponse = {
  product_variant_id?: number | null;
  product_id: number | null;
  product_slug: string;
  product_name: string;
  unit_price_mmk: number;
  image_url: string;
  selected_size: string;
  selected_color: string;
  quantity: number;
};

type FindOrderResponse = {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  preferred_contact: "Viber" | "Messenger" | "Phone";
  customer_note: string | null;
  total_mmk: number;
  status: OrderStatus;
  created_at: string;
  items: FindOrderItemResponse[];
};

export class OrderLookupRateLimitError extends Error {
  constructor() {
    super("Too many order lookup attempts.");
    this.name = "OrderLookupRateLimitError";
  }
}

export type CancelCustomerOrderResult =
  | { outcome: "cancelled" | "already_cancelled"; status: "cancelled" }
  | {
      outcome: "not_allowed";
      status: Exclude<OrderStatus, "pending" | "cancelled">;
    }
  | { outcome: "not_found" };

function mapFindOrderResponse(order: FindOrderResponse): OrderRequest {
  const items: CartItem[] = order.items.map((item) => ({
    variantId: item.product_variant_id ?? 0,
    productId: item.product_id ?? 0,
    slug: item.product_slug,
    name: item.product_name,
    priceMMK: item.unit_price_mmk,
    image: item.image_url,
    selectedSize: item.selected_size,
    selectedColor: item.selected_color,
    quantity: item.quantity,
  }));

  return {
    orderNumber: order.order_number,
    customer: {
      name: order.customer_name,
      phone: order.customer_phone,
      address: order.customer_address,
      preferredContact: order.preferred_contact,
      note: order.customer_note ?? "",
    },
    items,
    totalMMK: order.total_mmk,
    status: order.status,
    createdAt: order.created_at,
  };
}

export async function findCustomerOrder(
  orderNumber: string,
  phone: string,
): Promise<OrderRequest | null> {
  const normalizedOrderNumber = orderNumber.trim();
  const normalizedPhone = phone.trim();

  if (
    !normalizedOrderNumber ||
    normalizedOrderNumber.length > 40 ||
    !normalizedPhone ||
    normalizedPhone.length > 30
  ) {
    return null;
  }

  const supabase = createClient();

  const { data, error } = await supabase.rpc("find_order_request", {
    lookup_order_number: normalizedOrderNumber,
    lookup_customer_phone: normalizedPhone,
  });

  if (error) {
    if (error.message === "Too many order lookup attempts.") {
      throw new OrderLookupRateLimitError();
    }

    throw new Error("Unable to check order.");
  }

  const order = Array.isArray(data)
    ? data[0]
    : data && typeof data === "object"
      ? data
      : null;

  if (!order) {
    return null;
  }

  return mapFindOrderResponse(order as FindOrderResponse);
}

export async function cancelCustomerOrder(
  orderNumber: string,
  phone: string,
): Promise<CancelCustomerOrderResult> {
  const normalizedOrderNumber = orderNumber.trim();
  const normalizedPhone = phone.trim();

  if (
    !normalizedOrderNumber ||
    normalizedOrderNumber.length > 40 ||
    !normalizedPhone ||
    normalizedPhone.length > 30
  ) {
    return { outcome: "not_found" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("cancel_order_request", {
    lookup_order_number: normalizedOrderNumber,
    lookup_customer_phone: normalizedPhone,
  });

  if (error) {
    if (error.message === "Too many order lookup attempts.") {
      throw new OrderLookupRateLimitError();
    }

    throw new Error("Unable to cancel order request.");
  }

  const result =
    data && !Array.isArray(data) && typeof data === "object"
      ? (data as { outcome?: unknown; status?: unknown })
      : null;

  if (!result || result.outcome === "not_found") {
    return { outcome: "not_found" };
  }

  if (
    (result.outcome === "cancelled" ||
      result.outcome === "already_cancelled") &&
    result.status === "cancelled"
  ) {
    return {
      outcome: result.outcome,
      status: "cancelled",
    };
  }

  if (
    result.outcome === "not_allowed" &&
    (result.status === "confirmed" ||
      result.status === "preparing" ||
      result.status === "ready" ||
      result.status === "completed")
  ) {
    return {
      outcome: "not_allowed",
      status: result.status,
    };
  }

  throw new Error("Unable to cancel order request.");
}
