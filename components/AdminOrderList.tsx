"use client";

import Link from "next/link";
import AdminOrderStatusBadge from "@/components/AdminOrderStatusBadge";
import { formatMMK } from "@/lib/formatPrice";
import type { AdminOrderSort, OrderRequest, OrderStatus } from "@/types/order";

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

const ORDER_SORT_OPTIONS: {
  value: AdminOrderSort;
  label: string;
}[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "total_desc", label: "Total high to low" },
  { value: "total_asc", label: "Total low to high" },
];

function formatOrderCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

type AdminOrderListProps = {
  orders: OrderRequest[];
  emptyMessage?: string;
  filters: {
    search?: string;
    status?: OrderStatus;
    date?: string;
    sort: AdminOrderSort;
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

export default function AdminOrderList({
  orders,
  emptyMessage = "No order requests found yet.",
  filters,
  pagination,
}: AdminOrderListProps) {
  const firstOrderNumber =
    pagination.totalCount === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.pageSize + 1;
  const lastOrderNumber = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalCount,
  );
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.date || filters.sort !== "newest",
  );

  function getPageHref(page: number) {
    const params = new URLSearchParams();
    params.set("page", String(page));

    if (filters.search) {
      params.set("search", filters.search);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.date) {
      params.set("date", filters.date);
    }

    if (filters.sort !== "newest") {
      params.set("sort", filters.sort);
    }

    return `/admin/orders?${params.toString()}`;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
      <div className="border-b border-[#d6c4aa] px-5 py-4">
        <h2 className="text-lg font-medium">Order requests</h2>
        <p className="mt-1 text-sm text-[#8a7a6d]">
          Showing {firstOrderNumber}-{lastOrderNumber} of{" "}
          {pagination.totalCount} order requests saved in Supabase.
        </p>
      </div>

      <form
        id="admin-order-filters"
        action="/admin/orders"
        className="grid gap-4 border-b border-[#d6c4aa] px-5 py-4 md:grid-cols-[1fr_200px_200px_auto]"
      >
        <input type="hidden" name="page" value="1" />

        <div>
          <label htmlFor="order-search" className="text-sm font-medium">
            Search orders
          </label>
          <input
            id="order-search"
            name="search"
            defaultValue={filters.search ?? ""}
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
            name="status"
            defaultValue={filters.status ?? "all"}
            className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
          >
            {ORDER_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="order-sort" className="text-sm font-medium">
            Sort
          </label>
          <select
            id="order-sort"
            name="sort"
            defaultValue={filters.sort}
            className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
          >
            {ORDER_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 self-end sm:flex-row md:flex-col xl:flex-row">
          <button
            type="submit"
            className="rounded-xl border border-[#9c7a4f] bg-[#2f241d] px-4 py-3 text-sm font-medium text-[#f8f3eb] hover:bg-[#45372d]"
          >
            Apply filters
          </button>

          <Link
            href="/admin/orders?page=1"
            aria-disabled={!hasActiveFilters}
            className={`rounded-xl border px-4 py-3 text-center text-sm font-medium ${
              hasActiveFilters
                ? "border-[#d6c4aa] text-[#8b5e3c] hover:bg-[#eadfce]"
                : "pointer-events-none border-[#e4d6c3] text-[#b8aa98]"
            }`}
          >
            Clear all filters
          </Link>
        </div>
      </form>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-[#f4eadc] text-xs uppercase tracking-wide text-[#8a7a6d]">
              <tr>
                <th className="px-5 py-3 font-medium">Order No.</th>
                <th className="px-5 py-3 font-medium">Created At</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e4d6c3]">
              {orders.map((order) => (
                <tr key={order.orderNumber}>
                  <td className="px-5 py-4 font-medium text-[#2f241d]">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-4 text-[#6f6258]">
                    {formatOrderCreatedAt(order.createdAt)}
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
      ) : (
        <div className="border-t border-[#e4d6c3] px-5 py-6">
          <p className="text-sm text-[#8a7a6d]">{emptyMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-[#d6c4aa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#8a7a6d]">
          Page {pagination.currentPage} of {pagination.totalPages}
        </p>

        <div className="flex gap-2">
          <Link
            href={getPageHref(pagination.currentPage - 1)}
            aria-disabled={pagination.currentPage <= 1}
            className={`rounded-xl border px-4 py-2 text-sm font-medium ${
              pagination.currentPage <= 1
                ? "pointer-events-none border-[#e4d6c3] text-[#b8aa98]"
                : "border-[#d6c4aa] text-[#8b5e3c] hover:bg-[#eadfce]"
            }`}
          >
            Previous
          </Link>

          <Link
            href={getPageHref(pagination.currentPage + 1)}
            aria-disabled={pagination.currentPage >= pagination.totalPages}
            className={`rounded-xl border px-4 py-2 text-sm font-medium ${
              pagination.currentPage >= pagination.totalPages
                ? "pointer-events-none border-[#e4d6c3] text-[#b8aa98]"
                : "border-[#d6c4aa] text-[#8b5e3c] hover:bg-[#eadfce]"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
