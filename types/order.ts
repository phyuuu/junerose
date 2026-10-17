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
  preferredContact: "Viber" | "Messenger" | "Phone";
  note?: string;
};

export type FulfillmentMethod = "delivery" | "pickup";

export type PickupStoreSnapshot = {
  id: number;
  name: string;
  township: string;
  address: string;
  phone?: string | null;
  openingHours?: string | null;
  mapUrl?: string | null;
};

export type OrderFulfillment =
  | {
      method: "delivery";
      address: string;
    }
  | {
      method: "pickup";
      store: PickupStoreSnapshot;
    };

export type OrderRequest = {
  orderNumber: string;
  customer: CustomerContactInfo;
  fulfillment: OrderFulfillment;
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
