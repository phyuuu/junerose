import type { OrderRequest } from "@/types/order";
import { formatMMK } from "@/lib/formatPrice";

export function buildCustomerOrderMessage(order: OrderRequest): string {
  const itemLines = order.items.flatMap((item, index) => [
    `${index + 1}. ${item.name}`,
    `   Size: ${item.selectedSize}`,
    `   Color: ${item.selectedColor}`,
    `   Quantity: ${item.quantity}`,
    `   Subtotal: ${formatMMK(item.priceMMK * item.quantity)}`,
    "",
  ]);

  const lines = [
    "JuneRose Order Request",
    "",
    `Order No: ${order.orderNumber}`,
    "",
    "Customer Details",
    `Name: ${order.customer.name}`,
    `Phone: ${order.customer.phone}`,
    `Preferred Contact: ${order.customer.preferredContact}`,
  ];

  if (order.fulfillment.method === "delivery") {
    lines.push("", "Fulfillment", "Method: Delivery");
    lines.push(`Delivery address: ${order.fulfillment.address}`);
  } else {
    lines.push("", "Fulfillment", "Method: Store pickup");
    lines.push(`Pickup store: ${order.fulfillment.store.name}`);
    lines.push(
      `Pickup address: ${order.fulfillment.store.address}, ${order.fulfillment.store.township}`,
    );
  }

  if (order.customer.note) {
    lines.push(`Note: ${order.customer.note}`);
  }

  lines.push(
    "",
    "Ordered Items",
    ...itemLines,
    `Estimated Total: ${formatMMK(order.totalMMK)}`,
    "",
    "Please confirm availability and payment details.",
  );

  return lines.join("\n");
}
