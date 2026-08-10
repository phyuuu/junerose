"use client";

import { useState } from "react";
import CustomerOrderDetails, {
  OrderStatusBadge,
} from "@/components/CustomerOrderDetails";
import {
  findCustomerOrder,
  OrderLookupRateLimitError,
} from "@/lib/customer-orders";
import type { OrderRequest } from "@/types/order";

export default function CheckOrderForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [foundOrder, setFoundOrder] = useState<OrderRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setFoundOrder(null);
    setIsChecking(true);

    try {
      const order = await findCustomerOrder(orderNumber.trim(), phone.trim());

      if (!order) {
        setErrorMessage(
          "We could not find an order with this order number and phone number.",
        );
        return;
      }

      setFoundOrder(order);
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

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start">
      <form
        onSubmit={handleSubmit}
        className="border-t border-[#211d1b] pt-6 lg:sticky lg:top-28"
      >
        <h2 className="font-display text-2xl">Find your order</h2>

        <p className="mt-3 text-sm leading-6 text-[#6f6864]">
          Both details must match the original request.
        </p>

        <div className="mt-7 space-y-5">
          <label
            htmlFor="check-order-number"
            className="grid gap-2 text-sm"
          >
            Order number
            <input
              id="check-order-number"
              required
              maxLength={40}
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="Example: JR-..."
              className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm uppercase outline-none transition-colors placeholder:normal-case focus:border-[#b62568]"
            />
          </label>

          <label htmlFor="check-order-phone" className="grid gap-2 text-sm">
            Phone number
            <input
              id="check-order-phone"
              required
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone used in the order"
              className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm outline-none transition-colors focus:border-[#b62568]"
            />
          </label>
        </div>

        {errorMessage && (
          <p className="mt-5 border-l-2 border-red-600 pl-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isChecking}
          className="mt-6 min-h-12 w-full rounded-[3px] bg-[#211d1b] px-6 text-sm font-medium text-white transition-colors hover:bg-[#b62568] disabled:cursor-not-allowed disabled:bg-[#cfc8c4]"
        >
          {isChecking ? "Checking..." : "Check order"}
        </button>

        <p className="mt-5 text-xs leading-5 text-[#6f6864]">
          Incorrect attempts are limited to protect customer information.
        </p>
      </form>

      <section aria-live="polite">
        {!foundOrder ? (
          <div className="border-y border-[#e7e1de] py-16 text-center sm:py-24">
            <p className="font-display text-3xl">Order details</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f6864]">
              Your order summary will appear here after both details are
              verified.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-5 border-b border-[#211d1b] pb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-[#9a8558]">
                  Order number
                </p>
                <h2 className="mt-2 break-all font-display text-3xl sm:text-4xl">
                  {foundOrder.orderNumber}
                </h2>
              </div>

              <OrderStatusBadge status={foundOrder.status} />
            </div>

            <div className="mt-8">
              <CustomerOrderDetails order={foundOrder} />
            </div>

            <p className="mt-7 border-t border-[#e7e1de] pt-5 text-xs leading-6 text-[#6f6864]">
              JuneRose staff will confirm final availability, payment method,
              and pickup or delivery details.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
