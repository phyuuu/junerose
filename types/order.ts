import type { CartItem } from "@/types/cart";

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

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
};