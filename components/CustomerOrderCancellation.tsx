"use client";

import { useState } from "react";
import {
  cancelCustomerOrder,
  OrderLookupRateLimitError,
} from "@/lib/customer-orders";
import type { OrderRequest, OrderStatus } from "@/types/order";

type CustomerOrderCancellationProps = {
  order: OrderRequest;
  onStatusChange: (status: OrderStatus) => void;
};

export default function CustomerOrderCancellation({
  order,
  onStatusChange,
}: CustomerOrderCancellationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCancel() {
    if (isCancelling) {
      return;
    }

    setMessage("");
    setIsCancelling(true);

    try {
      const result = await cancelCustomerOrder(
        order.orderNumber,
        order.customer.phone,
      );

      if (
        result.outcome === "cancelled" ||
        result.outcome === "already_cancelled"
      ) {
        onStatusChange("cancelled");
        setMessage("This order request has been cancelled.");
        setIsConfirming(false);
        return;
      }

      if (result.outcome === "not_allowed") {
        onStatusChange(result.status);
        setMessage(
          "This request is already being handled and can no longer be cancelled online. Contact JuneRose staff if you need help.",
        );
        setIsConfirming(false);
        return;
      }

      setMessage(
        "We could not verify this order. Check the order again before cancelling.",
      );
    } catch (error) {
      setMessage(
        error instanceof OrderLookupRateLimitError
          ? "Too many incorrect attempts. Please wait 15 minutes before trying again."
          : "Unable to cancel this request. Please try again.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  if (order.status === "cancelled") {
    return (
      <p className="mt-6 border-l-2 border-[#8f3434] pl-3 text-xs leading-6 text-[#8f3434]">
        This order request is cancelled.
      </p>
    );
  }

  if (order.status !== "pending") {
    return (
      <p className="mt-6 border-l-2 border-[#d8c79f] pl-3 text-xs leading-6 text-[#795f25]">
        This request is already being handled. Contact JuneRose staff if you
        need to change or cancel it.
      </p>
    );
  }

  return (
    <div className="mt-7 border-t border-[#e7e1de] pt-6">
      {!isConfirming ? (
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setIsConfirming(true);
          }}
          className="min-h-11 rounded-[3px] border border-[#b94343] px-4 text-xs font-medium uppercase text-[#8f3434] transition-colors hover:bg-[#fbefef]"
        >
          Cancel order request
        </button>
      ) : (
        <div className="border border-[#e2b8b8] bg-[#fbefef] p-4">
          <p className="text-sm font-medium text-[#6f2929]">
            Cancel this order request?
          </p>
          <p className="mt-2 text-xs leading-5 text-[#7a4b4b]">
            Staff will stop processing this request. This action cannot be
            reversed from the customer website.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="min-h-10 rounded-[3px] bg-[#8f3434] px-4 text-xs font-medium uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? "Cancelling..." : "Yes, cancel request"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              disabled={isCancelling}
              className="min-h-10 rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-xs font-medium uppercase disabled:cursor-not-allowed disabled:opacity-50"
            >
              Keep order
            </button>
          </div>
        </div>
      )}

      {message && (
        <p className="mt-4 text-xs leading-6 text-[#6f2929]" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
}
