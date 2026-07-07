import type { OrderRequest } from "../types/order";

export function buildCustomerOrderMessage(order: OrderRequest): string {
  const lines = [
    "JuneRose Order Request",
    "",
    `Order No: ${order.orderNumber}`,
    "",
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Address: ${order.customer.address}`,
    `Preferred Contact: ${order.customer.preferredContact}`,
  ];

  if (order.customer.note) {
    lines.push(`Note: ${order.customer.note}`);
  }

  return lines.join("\n");
}