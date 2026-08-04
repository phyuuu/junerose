"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  findCustomerOrder,
  OrderLookupRateLimitError,
} from "@/lib/customer-orders";
import { buildCustomerOrderMessage } from "@/lib/orderMessage";
import { formatMMK } from "@/lib/formatPrice";
import { consumeRecentOrderPhone } from "@/lib/orderStorage";
import type { OrderRequest } from "@/types/order";

type OrderSuccessViewProps = {
  orderNumber: string;
};

export default function OrderSuccessView({
  orderNumber,
}: OrderSuccessViewProps) {
  const [copyMessage, setCopyMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [verifiedOrder, setVerifiedOrder] =
    useState<OrderRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isRestoringRecentOrder, setIsRestoringRecentOrder] = useState(true);
  const visibleOrder = verifiedOrder;

  useEffect(() => {
    let isActive = true;
    const recentPhone = consumeRecentOrderPhone(orderNumber);
    const recentOrderLookup = recentPhone
      ? findCustomerOrder(orderNumber, recentPhone)
      : Promise.resolve(null);

    recentOrderLookup
      .then((foundOrder) => {
        if (isActive) {
          setVerifiedOrder(foundOrder);
        }
      })
      .catch(() => {
        // The regular phone verification form remains available below.
      })
      .finally(() => {
        if (isActive) {
          setIsRestoringRecentOrder(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [orderNumber]);

  async function handleCopyOrderInfo() {
    if (!visibleOrder) {
      return;
    }

    const message = buildCustomerOrderMessage(visibleOrder);

    await navigator.clipboard.writeText(message);
    setCopyMessage("Order info copied.");
  }

  async function handleVerifyOrder(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");
    setIsChecking(true);

    try {
      const foundOrder = await findCustomerOrder(
        orderNumber,
        phone.trim(),
      );

      if (!foundOrder) {
        setErrorMessage(
          "We could not find an order with this order number and phone number.",
        );
        return;
      }

      setVerifiedOrder(foundOrder);
    } catch (error) {
      setErrorMessage(
        error instanceof OrderLookupRateLimitError
          ? "Too many incorrect attempts. Please wait 15 minutes before trying again."
          : "Unable to check order. Please try again.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  if (!visibleOrder) {
    return (
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
          <p className="text-sm text-[#9c7a4f]">Order Number</p>

          <h2 className="mt-2 text-2xl font-semibold">{orderNumber}</h2>

          <p className="mt-4 text-sm leading-6 text-[#6f6258]">
            Thank you. Please keep this order number. JuneRose staff will
            confirm item availability, payment method, and pickup or delivery
            details.
          </p>
        </div>

        <form
          onSubmit={handleVerifyOrder}
          className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6"
        >
          <h3 className="text-lg font-medium">View order details</h3>

          <p className="mt-2 text-sm leading-6 text-[#8a7a6d]">
            {isRestoringRecentOrder
              ? "Loading your order details..."
              : "Enter the phone number used in the order to view the full summary."}
          </p>

          {!isRestoringRecentOrder && (
            <>
              <div className="mt-5">
                <label
                  htmlFor="success-order-phone"
                  className="text-sm font-medium"
                >
                  Phone Number
                </label>
                <input
                  id="success-order-phone"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone used in the order"
                  className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
                />
              </div>

              {errorMessage && (
                <p className="mt-4 text-sm text-red-700">{errorMessage}</p>
              )}

              <button
                type="submit"
                disabled={isChecking}
                className="mt-5 w-full rounded-full bg-[#2f241d] px-6 py-3 text-sm text-[#f8f3eb] hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:bg-[#b8aa98]"
              >
                {isChecking ? "Checking..." : "View order details"}
              </button>
            </>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <p className="text-sm text-[#9c7a4f]">Order Number</p>

        <h2 className="mt-2 text-2xl font-semibold">
          {visibleOrder.orderNumber}
        </h2>

        <p className="mt-4 text-sm leading-6 text-[#6f6258]">
          Thank you. Please keep this order number. JuneRose staff will confirm
          item availability, payment method, and pickup or delivery details.
        </p>

        <div className="mt-6">
          <h3 className="text-sm font-medium">Customer Details</h3>

          <div className="mt-3 space-y-1 text-sm text-[#6f6258]">
            <p>Name: {visibleOrder.customer.name}</p>
            <p>Phone: {visibleOrder.customer.phone}</p>
            <p>Address: {visibleOrder.customer.address}</p>
            <p>
              Preferred contact: {visibleOrder.customer.preferredContact}
            </p>
            {visibleOrder.customer.note && (
              <p>Note: {visibleOrder.customer.note}</p>
            )}
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
          {visibleOrder.items.map((item) => (
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

        <div className="mt-5 flex items-center justify-between border-t border-[#d6c4aa] pt-4">
          <p className="text-sm font-medium">Estimated Total</p>
          <p className="text-sm font-semibold">
            {formatMMK(visibleOrder.totalMMK)}
          </p>
        </div>
      </div>
    </div>
  );
}
