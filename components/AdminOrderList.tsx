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
    <section className="overflow-hidden rounded-[4px] border border-[#d7dadd] bg-white">
      <div className="border-b border-[#dfe2e5] px-5 py-4">
        <h2 className="text-base font-semibold">Order requests</h2>
        <p className="mt-1 text-xs text-[#6c6764]">
          Showing {firstOrderNumber}-{lastOrderNumber} of{" "}
          {pagination.totalCount} order requests saved in Supabase.
        </p>
      </div>

      <form
        id="admin-order-filters"
        action="/admin/orders"
        className="grid gap-4 border-b border-[#dfe2e5] bg-[#fafbfb] px-5 py-4 md:grid-cols-[minmax(220px,1fr)_180px_180px_auto]"
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
            className="mt-2 min-h-11 w-full rounded-[4px] border border-[#cfd3d6] bg-white px-3 text-sm outline-none focus:border-[#b62568]"
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
            className="mt-2 min-h-11 w-full rounded-[4px] border border-[#cfd3d6] bg-white px-3 text-sm outline-none focus:border-[#b62568]"
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
            className="mt-2 min-h-11 w-full rounded-[4px] border border-[#cfd3d6] bg-white px-3 text-sm outline-none focus:border-[#b62568]"
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
            className="min-h-11 rounded-[4px] bg-[#211f1e] px-4 text-sm font-medium text-white hover:bg-[#b62568]"
          >
            Apply filters
          </button>

          <Link
            href="/admin/orders?page=1"
            aria-disabled={!hasActiveFilters}
            className={`flex min-h-11 items-center justify-center rounded-[4px] border px-4 text-center text-sm font-medium ${
              hasActiveFilters
                ? "border-[#cfd3d6] text-[#4f4a47] hover:bg-[#f1f2f3]"
                : "pointer-events-none border-[#e2e4e6] text-[#aaa6a3]"
            }`}
          >
            Clear all filters
          </Link>
        </div>
      </form>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-[#f1f2f3] text-xs uppercase text-[#686360]">
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

            <tbody className="divide-y divide-[#e5e7e9]">
              {orders.map((order) => (
                <tr key={order.orderNumber} className="hover:bg-[#fafbfb]">
                  <td className="px-5 py-3 font-medium text-[#242220]">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3 text-[#5f5a57]">
                    {formatOrderCreatedAt(order.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-[#5f5a57]">
                    {order.customer.name}
                  </td>
                  <td className="px-5 py-3 text-[#5f5a57]">
                    {order.customer.phone}
                  </td>
                  <td className="px-5 py-3 text-[#5f5a57]">
                    {order.customer.preferredContact}
                  </td>
                  <td className="px-5 py-3 text-[#5f5a57]">
                    {formatMMK(order.totalMMK)}
                  </td>
                  <td className="px-5 py-3">
                    <AdminOrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/orders/${order.orderNumber}`}
                      className="inline-flex min-h-8 items-center rounded-[3px] border border-[#cfd3d6] px-3 text-xs font-medium hover:border-[#9ea3a7] hover:bg-[#f1f2f3]"
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
        <div className="border-t border-[#e5e7e9] px-5 py-10 text-center">
          <p className="text-sm text-[#6c6764]">{emptyMessage}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-[#dfe2e5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-[#6c6764]">
          Page {pagination.currentPage} of {pagination.totalPages}
        </p>

        <div className="flex gap-2">
          <Link
            href={getPageHref(pagination.currentPage - 1)}
            aria-disabled={pagination.currentPage <= 1}
            className={`flex min-h-9 items-center rounded-[4px] border px-4 text-sm font-medium ${
              pagination.currentPage <= 1
                ? "pointer-events-none border-[#e2e4e6] text-[#aaa6a3]"
                : "border-[#cfd3d6] text-[#4f4a47] hover:bg-[#f1f2f3]"
            }`}
          >
            Previous
          </Link>

          <Link
            href={getPageHref(pagination.currentPage + 1)}
            aria-disabled={pagination.currentPage >= pagination.totalPages}
            className={`flex min-h-9 items-center rounded-[4px] border px-4 text-sm font-medium ${
              pagination.currentPage >= pagination.totalPages
                ? "pointer-events-none border-[#e2e4e6] text-[#aaa6a3]"
                : "border-[#cfd3d6] text-[#4f4a47] hover:bg-[#f1f2f3]"
            }`}
          >
            Next
          </Link>
        </div>
      </div>
    </section>
  );
}
