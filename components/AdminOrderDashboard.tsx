"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import AdminOrderList from "@/components/AdminOrderList";
import AdminOrderSummary from "@/components/AdminOrderSummary";
import type { AdminOrderSort, OrderRequest, OrderStatus } from "@/types/order";

type AdminOrdersPageResult = {
  orders: OrderRequest[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

type AdminOrderDashboardProps = {
  ordersPage: AdminOrdersPageResult;
  filters: {
    search?: string;
    status?: OrderStatus;
    date?: string;
    sort: AdminOrderSort;
  };
};

function getLocalDateKey(value: string) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateText(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${day}/${month}/${year}`;
}

function parseDateText(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalizedValue =
    digits.length === 8
      ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
      : value;
  const match = normalizedValue.match(/^(\d{2})[/.](\d{2})[/.](\d{4})$/);

  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return `${yearText}-${monthText}-${dayText}`;
}

function formatTypedDate(value: string) {
  const allowedValue = value.replace(/[^\d/.]/g, "").slice(0, 10);
  const hasTypedSeparator = /[/.]/.test(allowedValue);

  if (hasTypedSeparator) {
    return allowedValue;
  }

  const digits = allowedValue.slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  return [day, month, year].filter(Boolean).join("/");
}

export default function AdminOrderDashboard({
  ordersPage,
  filters,
}: AdminOrderDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(filters.date ?? "");
  const [dateText, setDateText] = useState(
    filters.date ? formatDateText(filters.date) : "",
  );
  const datePickerRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const todayDateKey = getLocalDateKey(new Date().toISOString());
  const { orders, currentPage, pageSize, totalCount, totalPages } = ordersPage;
  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.date,
  );

  function getOrdersHref(nextDate: string | null) {
    const params = new URLSearchParams();
    params.set("page", "1");

    if (filters.search) {
      params.set("search", filters.search);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.sort !== "newest") {
      params.set("sort", filters.sort);
    }

    if (nextDate) {
      params.set("date", nextDate);
    }

    return `/admin/orders?${params.toString()}`;
  }

  function applyDate(nextDate: string) {
    const safeDate = nextDate > todayDateKey ? todayDateKey : nextDate;
    setSelectedDate(safeDate);
    setDateText(formatDateText(safeDate));
    router.push(getOrdersHref(safeDate));
  }

  function clearDate() {
    setSelectedDate("");
    setDateText("");
    router.push(getOrdersHref(null));
  }

  function handleDateTextChange(value: string) {
    const formattedValue = formatTypedDate(value);
    const parsedDate = parseDateText(formattedValue);

    setDateText(formattedValue);

    if (!formattedValue) {
      setSelectedDate("");
      return;
    }

    if (parsedDate) {
      applyDate(parsedDate);
    }
  }

  function handleOpenDatePicker() {
    const picker = datePickerRef.current;

    if (!picker) {
      return;
    }

    const datePicker = picker as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (datePicker.showPicker) {
      datePicker.showPicker();
      return;
    }

    datePicker.click();
  }

  return (
    <div className="mt-8 space-y-8">
      <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label htmlFor="order-date-filter" className="text-sm font-medium">
              Order date
            </label>
            <input
              type="hidden"
              form="admin-order-filters"
              name="date"
              value={selectedDate}
            />
            <div className="mt-2 flex w-full gap-2 md:max-w-md">
              <input
                id="order-date-filter"
                type="text"
                inputMode="numeric"
                value={dateText}
                onChange={(event) =>
                  handleDateTextChange(event.target.value)
                }
                placeholder="dd/mm/yyyy"
                className="w-full cursor-text rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm text-[#2f241d] outline-none placeholder:text-[#b8aa98] focus:border-[#9c7a4f]"
              />

              <input
                ref={datePickerRef}
                type="date"
                value={selectedDate}
                max={todayDateKey}
                onChange={(event) => applyDate(event.target.value)}
                className="sr-only"
                aria-hidden="true"
                tabIndex={-1}
              />

              <button
                type="button"
                onClick={handleOpenDatePicker}
                aria-label="Open calendar"
                title="Open calendar"
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#d6c4aa] text-[#8b5e3c] hover:bg-[#eadfce]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                >
                  <path d="M8 2v4" />
                  <path d="M16 2v4" />
                  <path d="M3 10h18" />
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={clearDate}
            disabled={!selectedDate && !filters.date}
            className="rounded-xl border border-[#d6c4aa] px-4 py-3 text-sm font-medium text-[#8b5e3c] hover:bg-[#eadfce] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear date
          </button>
        </div>

        <p className="mt-3 text-sm text-[#8a7a6d]">
          {selectedDate
            ? "Showing orders from the selected date."
            : `Showing page ${currentPage} of matching orders.`}
        </p>
      </section>

      <AdminOrderSummary orders={orders} />

      <AdminOrderList
        key={`${filters.search ?? ""}-${filters.status ?? ""}-${
          filters.date ?? ""
        }-${filters.sort}-${currentPage}`}
        orders={orders}
        filters={filters}
        pagination={{
          currentPage,
          pageSize,
          totalCount,
          totalPages,
        }}
        emptyMessage={
          hasActiveFilters
            ? "No order requests match the current filters."
            : "No order requests found yet. Submit a test order from the customer cart flow to see it here."
        }
      />
    </div>
  );
}
