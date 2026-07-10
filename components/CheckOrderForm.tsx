"use client";

import Image from "next/image";
import { useState } from "react";
import { formatMMK } from "@/lib/formatPrice";
import { getOrderByNumber } from "@/lib/orderStorage";
import type { OrderRequest } from "@/types/order";

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export default function CheckOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [foundOrder, setFoundOrder] = useState<OrderRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const order = getOrderByNumber(orderNumber.trim());

    if (!order) {
      setFoundOrder(null);
      setErrorMessage("We could not find an order with this order number.");
      return;
    }

    const phoneMatches =
      normalizeText(order.customer.phone) === normalizeText(phone);

    if (!phoneMatches) {
      setFoundOrder(null);
      setErrorMessage("The phone number does not match this order.");
      return;
    }

    setFoundOrder(order);
    setErrorMessage("");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6"
      >
        <h2 className="text-lg font-medium">Find your order</h2>

        <p className="mt-2 text-sm leading-6 text-[#8a7a6d]">
          Enter your order number and phone number to view the order request
          saved on this device.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium">Order Number</label>
            <input
              required
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="Example: JR-..."
              className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone used in the order"
              className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
            />
          </div>
        </div>

        {errorMessage && (
          <p className="mt-4 text-sm text-red-700">{errorMessage}</p>
        )}

        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-[#2f241d] px-6 py-3 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
        >
          Check Order
        </button>

        <p className="mt-4 text-xs leading-5 text-[#8a7a6d]">
          This is a local development feature. Orders can only be found in the
          same browser where they were submitted until we add a database.
        </p>
      </form>

      <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        {!foundOrder ? (
          <div>
            <h2 className="text-lg font-medium">Order summary</h2>
            <p className="mt-2 text-sm leading-6 text-[#8a7a6d]">
              Your order details will appear here after the order number and
              phone number match.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm text-[#9c7a4f]">Order Number</p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {foundOrder.orderNumber}
                </h2>
              </div>

              <span className="w-fit rounded-full bg-[#eadfce] px-3 py-1 text-xs font-medium text-[#9c7a4f]">
                {foundOrder.status}
              </span>
            </div>

            <div className="mt-5 space-y-1 text-sm text-[#6f6258]">
              <p>Name: {foundOrder.customer.name}</p>
              <p>Phone: {foundOrder.customer.phone}</p>
              <p>Preferred contact: {foundOrder.customer.preferredContact}</p>
              <p>Address: {foundOrder.customer.address}</p>
              {foundOrder.customer.note && (
                <p>Note: {foundOrder.customer.note}</p>
              )}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium">Ordered Items</h3>

              <div className="mt-4 space-y-3">
                {foundOrder.items.map((item) => (
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
                        Size: {item.selectedSize} · Color:{" "}
                        {item.selectedColor}
                      </p>

                      <p className="mt-1 text-xs text-[#8a7a6d]">
                        Qty: {item.quantity}
                      </p>

                      <p className="mt-2 text-sm text-[#6f6258]">
                        {formatMMK(item.priceMMK * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#d6c4aa] pt-4">
              <p className="text-sm font-medium">Estimated Total</p>
              <p className="text-sm font-semibold">
                {formatMMK(foundOrder.totalMMK)}
              </p>
            </div>

            <p className="mt-3 text-xs leading-5 text-[#8a7a6d]">
              JuneRose staff will confirm final availability, payment method,
              and pickup or delivery details.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}