"use client";

import { useState } from "react";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/types/order";

const ORDER_STATUS_OPTIONS: {
  value: OrderStatus;
  label: string;
}[] = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

type AdminOrderStatusFormProps = {
  orderNumber: string;
  status: OrderStatus;
};

export default function AdminOrderStatusForm({
  orderNumber,
  status,
}: AdminOrderStatusFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(status);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsPending(true);

    const result = await updateOrderStatusAction(
      orderNumber,
      selectedStatus,
    );

    setIsPending(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Order status updated.");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] p-4"
    >
      <label htmlFor="order-status" className="text-sm font-medium">
        Order status
      </label>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <select
          id="order-status"
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(event.target.value as OrderStatus)
          }
          className="w-full rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
        >
          {ORDER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#2f241d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save status"}
        </button>
      </div>

      {message && (
        <p className="mt-3 text-sm text-[#6f6258]">{message}</p>
      )}
    </form>
  );
}
