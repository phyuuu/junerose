import type { OrderStatus } from "@/types/order";

export type AdminPrivacyOrderPreview = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: OrderStatus;
  createdAt: string;
  canAnonymize: boolean;
};

export type AdminPrivacyRequestState = {
  error?: string;
  saved?: string;
  preview?: AdminPrivacyOrderPreview;
  verification?: {
    orderNumber: string;
    customerPhone: string;
  };
};
