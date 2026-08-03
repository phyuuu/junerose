"use client";

import Link from "next/link";
import { useState } from "react";
import AdminOrderStatusBadge from "@/components/AdminOrderStatusBadge";
import { formatMMK } from "@/lib/formatPrice";
import type { OrderRequest, OrderStatus } from "@/types/order";

const ORDER_STATUS_OPTIONS: {
  value: "all" | OrderStatus;
  label: string;
}[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

type AdminOrderListProps = {
  orders: OrderRequest[];
};

export default function AdminOrderList({ orders }: AdminOrderListProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | OrderStatus>("all");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = status === "all" || order.status === status;

    const matchesSearch =
      normalizedSearch.length === 0 ||
      order.orderNumber.toLowerCase().includes(normalizedSearch) ||
      order.customer.name.toLowerCase().includes(normalizedSearch) ||
      order.customer.phone.toLowerCase().includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });

  if (orders.length === 0) {
    return (
      <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <h2 className="text-lg font-medium">Order requests</h2>
        <p className="mt-2 text-sm text-[#8a7a6d]">
          No order requests found yet. Submit a test order from the customer
          cart flow to see it here.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
      <div className="border-b border-[#d6c4aa] px-5 py-4">
        <h2 className="text-lg font-medium">Order requests</h2>
        <p className="mt-1 text-sm text-[#8a7a6d]">
          Customer order requests saved in Supabase.
        </p>
      </div>

      <div className="grid gap-4 border-b border-[#d6c4aa] px-5 py-4 md:grid-cols-[1fr_220px]">
        <div>
          <label htmlFor="order-search" className="text-sm font-medium">
            Search orders
          </label>
          <input
            id="order-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number, customer, or phone"
            className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
          />
        </div>

        <div>
          <label htmlFor="order-status-filter" className="text-sm font-medium">
            Status
          </label>
          <select
            id="order-status-filter"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as "all" | OrderStatus)
            }
            className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-[#f4eadc] text-xs uppercase tracking-wide text-[#8a7a6d]">
            <tr>
              <th className="px-5 py-3 font-medium">Order No.</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Phone</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e4d6c3]">
            {filteredOrders.map((order) => (
              <tr key={order.orderNumber}>
                <td className="px-5 py-4 font-medium text-[#2f241d]">
                  {order.orderNumber}
                </td>
                <td className="px-5 py-4 text-[#6f6258]">
                  {order.customer.name}
                </td>
                <td className="px-5 py-4 text-[#6f6258]">
                  {order.customer.phone}
                </td>
                <td className="px-5 py-4 text-[#6f6258]">
                  {order.customer.preferredContact}
                </td>
                <td className="px-5 py-4 text-[#6f6258]">
                  {formatMMK(order.totalMMK)}
                </td>
                <td className="px-5 py-4">
                  <AdminOrderStatusBadge status={order.status} />
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders/${order.orderNumber}`}
                    className="text-sm font-medium text-[#9c7a4f] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="border-t border-[#e4d6c3] px-5 py-6">
          <p className="text-sm text-[#8a7a6d]">
            No orders match the current search or status filter.
          </p>
        </div>
      )}
    </section>
  );
}
