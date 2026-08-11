"use client";

import { Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CustomerOrderDetails, {
  OrderStatusBadge,
} from "@/components/CustomerOrderDetails";
import CustomerOrderCancellation from "@/components/CustomerOrderCancellation";
import {
  findCustomerOrder,
  OrderLookupRateLimitError,
} from "@/lib/customer-orders";
import { buildCustomerOrderMessage } from "@/lib/orderMessage";
import { consumeRecentOrderPhone } from "@/lib/orderStorage";
import { routes } from "@/lib/routes";
import type { OrderRequest } from "@/types/order";

type OrderSuccessViewProps = {
  orderNumber: string;
};

export default function OrderSuccessView({
  orderNumber,
}: OrderSuccessViewProps) {
  const [copyMessage, setCopyMessage] = useState("");
  const [orderNumberCopyMessage, setOrderNumberCopyMessage] = useState("");
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

    try {
      await navigator.clipboard.writeText(message);
      setCopyMessage("Order information copied.");
    } catch {
      setCopyMessage("Unable to copy. Please try again.");
    }
  }

  async function handleCopyOrderNumber() {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setOrderNumberCopyMessage("Order number copied.");
    } catch {
      setOrderNumberCopyMessage("Unable to copy. Please take a screenshot instead.");
    }
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
      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
        <section className="border-y border-[#211d1b] py-8 sm:py-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase text-[#9a8558]">
                Your order number
              </p>

              <h2 className="mt-3 break-all font-display text-4xl sm:text-5xl">
                {orderNumber}
              </h2>
            </div>

            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-[3px] border border-[#211d1b] px-4 text-xs font-medium uppercase transition-colors hover:bg-[#211d1b] hover:text-white sm:self-auto"
            >
              <Copy aria-hidden="true" size={16} />
              Copy order number
            </button>
          </div>

          {orderNumberCopyMessage && (
            <p className="mt-4 text-sm text-[#35613e]" aria-live="polite">
              {orderNumberCopyMessage}
            </p>
          )}

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6f6864]">
            Save this order number to check your order later. Copy it or take a
            screenshot before closing this page. JuneRose staff will contact
            you to confirm item availability, payment, and pickup or delivery
            details.
          </p>

          <Link
            href={routes.catalog}
            className="mt-7 inline-flex min-h-11 items-center text-xs font-medium uppercase underline decoration-[#cfc8c4] underline-offset-4 hover:text-[#b62568]"
          >
            Continue shopping
          </Link>
        </section>

        <form
          onSubmit={handleVerifyOrder}
          className="border border-[#e7e1de] bg-[#faf9f8] p-6"
        >
          <h3 className="font-display text-2xl">View order details</h3>

          <p className="mt-3 text-sm leading-6 text-[#6f6864]">
            {isRestoringRecentOrder
              ? "Loading your order details..."
              : "Enter the phone number used in the order to view the full summary."}
          </p>

          {!isRestoringRecentOrder && (
            <>
              <label
                htmlFor="success-order-phone"
                className="mt-6 grid gap-2 text-sm"
              >
                Phone number
                <input
                  id="success-order-phone"
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
                {isChecking ? "Checking..." : "View order details"}
              </button>
            </>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-5 border-y border-[#211d1b] py-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-[#9a8558]">
            Your order number
          </p>
          <h2 className="mt-2 break-all font-display text-4xl sm:text-5xl">
            {visibleOrder.orderNumber}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <OrderStatusBadge status={visibleOrder.status} />
          <button
            type="button"
            onClick={handleCopyOrderInfo}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] border border-[#211d1b] px-4 text-xs font-medium uppercase transition-colors hover:bg-[#211d1b] hover:text-white"
          >
            <Copy aria-hidden="true" size={16} />
            Copy order information
          </button>
        </div>
      </div>

      {copyMessage && (
        <p className="mt-4 text-sm text-[#35613e]" aria-live="polite">
          {copyMessage}
        </p>
      )}

      <p className="mt-6 max-w-2xl text-sm leading-7 text-[#6f6864]">
        Save this order number to check your order later. Copy the order
        information or take a screenshot before closing this page. JuneRose
        staff will contact you to confirm item availability, payment, and
        pickup or delivery details.
      </p>

      <div className="mt-10">
        <CustomerOrderDetails
          order={visibleOrder}
          customerFooter={
            <CustomerOrderCancellation
              order={visibleOrder}
              onStatusChange={(status) =>
                setVerifiedOrder((current) =>
                  current ? { ...current, status } : current,
                )
              }
            />
          }
        />
      </div>

      <div className="mt-10 flex flex-wrap gap-6 border-t border-[#e7e1de] pt-6">
        <Link
          href={routes.catalog}
          className="text-xs font-medium uppercase underline decoration-[#cfc8c4] underline-offset-4 hover:text-[#b62568]"
        >
          Continue shopping
        </Link>
        <Link
          href={routes.checkOrder}
          className="text-xs font-medium uppercase underline decoration-[#cfc8c4] underline-offset-4 hover:text-[#b62568]"
        >
          Check this order later
        </Link>
      </div>
    </div>
  );
}
