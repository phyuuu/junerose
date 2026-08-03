import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types/cart";
import type { OrderRequest, OrderStatus } from "@/types/order";

type OrderRow = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  preferred_contact: "Viber" | "Messenger" | "Phone";
  customer_note: string | null;
  total_mmk: number;
  status: OrderStatus;
  created_at: string;
  stock_reserved_at: string | null;
  stock_released_at: string | null;
};

type OrderItemRow = {
  order_id: number;
  product_id: number | null;
  product_slug: string;
  product_name: string;
  unit_price_mmk: number;
  image_url: string;
  selected_size: string;
  selected_color: string;
  quantity: number;
};

type OrderWithItemsRow = OrderRow & {
  order_items: OrderItemRow[];
};

function mapOrderRow(order: OrderWithItemsRow): OrderRequest {
  const items: CartItem[] = order.order_items.map((item) => ({
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
    stockReservedAt: order.stock_reserved_at,
    stockReleasedAt: order.stock_released_at,
  };
}

export async function getAdminOrders(): Promise<OrderRequest[]> {
  const supabase = await createClient();

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_address,
        preferred_contact,
        customer_note,
        total_mmk,
        status,
        created_at,
        stock_reserved_at,
        stock_released_at
      `,
    )
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Unable to load admin orders:", ordersError);
    throw new Error("Unable to load orders.");
  }

  const orders = (ordersData ?? []) as OrderRow[];

  if (orders.length === 0) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);

  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
        order_id,
        product_id,
        product_slug,
        product_name,
        unit_price_mmk,
        image_url,
        selected_size,
        selected_color,
        quantity
      `,
    )
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Unable to load admin order items:", itemsError);
    throw new Error("Unable to load order items.");
  }

  const items = (itemsData ?? []) as OrderItemRow[];

  return orders.map((order) =>
    mapOrderRow({
      ...order,
      order_items: items.filter((item) => item.order_id === order.id),
    }),
  );
}

export async function getAdminOrderByNumber(
  orderNumber: string,
): Promise<OrderRequest | null> {
  const supabase = await createClient();

  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_address,
        preferred_contact,
        customer_note,
        total_mmk,
        status,
        created_at,
        stock_reserved_at,
        stock_released_at
      `,
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (orderError) {
    console.error("Unable to load admin order:", orderError);
    throw new Error("Unable to load order.");
  }

  if (!orderData) {
    return null;
  }

  const order = orderData as OrderRow;

  const { data: itemsData, error: itemsError } = await supabase
    .from("order_items")
    .select(
      `
        order_id,
        product_id,
        product_slug,
        product_name,
        unit_price_mmk,
        image_url,
        selected_size,
        selected_color,
        quantity
      `,
    )
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  if (itemsError) {
    console.error("Unable to load admin order items:", itemsError);
    throw new Error("Unable to load order items.");
  }

  return mapOrderRow({
    ...order,
    order_items: (itemsData ?? []) as OrderItemRow[],
  });
}
