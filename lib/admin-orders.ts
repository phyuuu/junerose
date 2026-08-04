import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types/cart";
import type { AdminOrderSort, OrderRequest, OrderStatus } from "@/types/order";

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

export const ADMIN_ORDERS_PAGE_SIZE = 20;
const MYANMAR_TIME_ZONE_OFFSET = "+06:30";

export type AdminOrdersPageResult = {
  orders: OrderRequest[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type AdminOrderFilters = {
  page?: number;
  search?: string;
  status?: OrderStatus;
  date?: string;
  sort?: AdminOrderSort;
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

function getOrderDateRange(date: string) {
  const start = new Date(
    `${date}T00:00:00${MYANMAR_TIME_ZONE_OFFSET}`,
  ).toISOString();
  const endDate = new Date(`${date}T00:00:00${MYANMAR_TIME_ZONE_OFFSET}`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);

  return {
    start,
    end: endDate.toISOString(),
  };
}

function getSearchPattern(search: string) {
  const cleanedSearch = search
    .trim()
    .replace(/[,%()]/g, " ")
    .replace(/\s+/g, "%");

  return `%${cleanedSearch}%`;
}

export async function getAdminOrders(
  filters: AdminOrderFilters = {},
): Promise<AdminOrdersPageResult> {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const currentPage = Math.max(1, Math.floor(page));
  const from = (currentPage - 1) * ADMIN_ORDERS_PAGE_SIZE;
  const to = from + ADMIN_ORDERS_PAGE_SIZE - 1;
  const search = filters.search?.trim();
  const sort = filters.sort ?? "newest";

  let ordersQuery = supabase
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
      { count: "exact" },
    );

  if (filters.status) {
    ordersQuery = ordersQuery.eq("status", filters.status);
  }

  if (filters.date) {
    const dateRange = getOrderDateRange(filters.date);
    ordersQuery = ordersQuery
      .gte("created_at", dateRange.start)
      .lt("created_at", dateRange.end);
  }

  if (search) {
    const searchPattern = getSearchPattern(search);
    ordersQuery = ordersQuery.or(
      [
        `order_number.ilike.${searchPattern}`,
        `customer_name.ilike.${searchPattern}`,
        `customer_phone.ilike.${searchPattern}`,
      ].join(","),
    );
  }

  const {
    data: ordersData,
    error: ordersError,
    count,
  } = await (sort === "oldest"
    ? ordersQuery.order("created_at", { ascending: true })
    : sort === "total_desc"
      ? ordersQuery
          .order("total_mmk", { ascending: false })
          .order("created_at", { ascending: false })
      : sort === "total_asc"
        ? ordersQuery
            .order("total_mmk", { ascending: true })
            .order("created_at", { ascending: false })
        : ordersQuery.order("created_at", { ascending: false })
  ).range(from, to);

  if (ordersError) {
    console.error("Unable to load admin orders:", ordersError);
    throw new Error("Unable to load orders.");
  }

  const orders = (ordersData ?? []) as OrderRow[];
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_ORDERS_PAGE_SIZE));

  if (totalCount > 0 && orders.length === 0 && currentPage > totalPages) {
    return getAdminOrders({
      ...filters,
      page: totalPages,
    });
  }

  if (orders.length === 0) {
    return {
      orders: [],
      currentPage,
      pageSize: ADMIN_ORDERS_PAGE_SIZE,
      totalCount,
      totalPages,
    };
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

  return {
    orders: orders.map((order) =>
      mapOrderRow({
        ...order,
        order_items: items.filter((item) => item.order_id === order.id),
      }),
    ),
    currentPage,
    pageSize: ADMIN_ORDERS_PAGE_SIZE,
    totalCount,
    totalPages,
  };
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
