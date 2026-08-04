import type { CartItem } from "@/types/cart";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type AdminOrderSort =
  | "newest"
  | "oldest"
  | "total_desc"
  | "total_asc";

export type CustomerContactInfo = {
  name: string;
  phone: string;
  address: string;
  preferredContact: "Viber" | "Messenger" | "Phone";
  note?: string;
};

export type OrderRequest = {
  orderNumber: string;
  customer: CustomerContactInfo;
  items: CartItem[];
  totalMMK: number;
  status: OrderStatus;
  createdAt: string;
  stockReservedAt?: string | null;
  stockReleasedAt?: string | null;
};

export type AdminOrderNote = {
  id: number;
  note: string;
  createdAt: string;
};
