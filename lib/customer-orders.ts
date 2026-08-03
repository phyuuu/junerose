import { createClient } from "@/lib/supabase/client";
import type { CartItem } from "@/types/cart";
import type { OrderRequest, OrderStatus } from "@/types/order";

type FindOrderItemResponse = {
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

function mapFindOrderResponse(order: FindOrderResponse): OrderRequest {
  const items: CartItem[] = order.items.map((item) => ({
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
  const supabase = createClient();

  const { data, error } = await supabase.rpc("find_order_request", {
    lookup_order_number: orderNumber,
    lookup_customer_phone: phone,
  });

  if (error) {
    console.error("Unable to find customer order:", error);
    throw new Error("Unable to check order.");
  }

  const order = Array.isArray(data) ? data[0] : null;

  if (!order) {
    return null;
  }

  return mapFindOrderResponse(order as FindOrderResponse);
}
