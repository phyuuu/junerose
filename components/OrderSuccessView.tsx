"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMMK } from "../lib/formatPrice";
import { getOrderByNumber } from "../lib/orderStorage";
import { buildCustomerOrderMessage } from "../lib/orderMessage";
import { routes } from "../lib/routes";
import type { OrderRequest } from "../types/order";

type OrderSuccessViewProps = {
  orderNumber: string;
};

export default function OrderSuccessView({
  orderNumber,
}: OrderSuccessViewProps) {
  const [order, setOrder] = useState<OrderRequest | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const foundOrder = getOrderByNumber(orderNumber);
    setOrder(foundOrder ?? null);
  }, [orderNumber]);

  async function handleCopyOrderInfo() {
  if (!order) {
    return;
  }

  const message = buildCustomerOrderMessage(order);

  await navigator.clipboard.writeText(message);
  setCopyMessage("Order info copied.");
}

  if (!order) {
    return (
      <div className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <p className="text-sm text-[#8a7a6d]">
          We could not find this order summary on this device.
        </p>

        <Link
          href={routes.catalog}
          className="mt-4 inline-block rounded-full bg-[#2f241d] px-5 py-2 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <p className="text-sm text-[#9c7a4f]">Order Number</p>

        <h2 className="mt-2 text-2xl font-semibold">{order.orderNumber}</h2>

        <p className="mt-4 text-sm leading-6 text-[#6f6258]">
          Thank you. Please keep this order number. JuneRose staff will confirm
          item availability, payment method, and pickup or delivery details.
        </p>

        <div className="mt-6">
          <h3 className="text-sm font-medium">Customer Details</h3>

          <div className="mt-3 space-y-1 text-sm text-[#6f6258]">
            <p>Name: {order.customer.name}</p>
            <p>Phone: {order.customer.phone}</p>
            <p>Address: {order.customer.address}</p>
            <p>Preferred contact: {order.customer.preferredContact}</p>
            {order.customer.note && <p>Note: {order.customer.note}</p>}
          </div>

          <button
            type="button"
            onClick={handleCopyOrderInfo}
            className="mt-6 rounded-full bg-[#2f241d] px-5 py-2 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
            >
            Copy Order Info
            </button>

            {copyMessage && (
            <p className="mt-3 text-sm text-[#6f6258]">{copyMessage}</p>
            )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <h3 className="text-lg font-medium">Ordered Items</h3>

        <div className="mt-5 space-y-3">
          {order.items.map((item) => (
            <div
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                className="flex gap-3 border-b border-[#e4d6c3] pb-3 last:border-b-0"
                >
                <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eadfce]">
                    <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                    />
                </div>

                <div>
                    <p className="text-sm font-medium">{item.name}</p>

                    <p className="mt-1 text-xs text-[#8a7a6d]">
                    Size: {item.selectedSize} · Color: {item.selectedColor}
                    </p>

                    <p className="mt-1 text-xs text-[#8a7a6d]">Qty: {item.quantity}</p>

                    <p className="mt-2 text-sm text-[#6f6258]">
                    {formatMMK(item.priceMMK * item.quantity)}
                    </p>
                </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#d6c4aa] pt-4">
          <p className="text-sm font-medium">Estimated Total</p>
          <p className="text-sm font-semibold">{formatMMK(order.totalMMK)}</p>
        </div>
      </div>
    </div>
  );
}