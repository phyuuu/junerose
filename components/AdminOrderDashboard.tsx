"use client";

import { useMemo, useRef, useState } from "react";
import AdminOrderList from "@/components/AdminOrderList";
import AdminOrderSummary from "@/components/AdminOrderSummary";
import type { OrderRequest } from "@/types/order";

type AdminOrderDashboardProps = {
  orders: OrderRequest[];
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
  orders,
}: AdminOrderDashboardProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [dateText, setDateText] = useState("");
  const datePickerRef = useRef<HTMLInputElement>(null);
  const todayDateKey = getLocalDateKey(new Date().toISOString());

  const visibleOrders = useMemo(() => {
    if (!selectedDate) {
      return orders;
    }

    return orders.filter(
      (order) => getLocalDateKey(order.createdAt) === selectedDate,
    );
  }, [orders, selectedDate]);

  function applyDate(nextDate: string) {
    const safeDate = nextDate > todayDateKey ? todayDateKey : nextDate;
    setSelectedDate(safeDate);
    setDateText(formatDateText(safeDate));
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
            onClick={() => {
              setSelectedDate("");
              setDateText("");
            }}
            disabled={!selectedDate}
            className="rounded-xl border border-[#d6c4aa] px-4 py-3 text-sm font-medium text-[#8b5e3c] hover:bg-[#eadfce] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear date
          </button>
        </div>

        <p className="mt-3 text-sm text-[#8a7a6d]">
          {selectedDate
            ? "Showing orders from the selected date."
            : "Showing all orders from the database."}
        </p>
      </section>

      <AdminOrderSummary orders={visibleOrders} />

      <AdminOrderList
        orders={visibleOrders}
        emptyMessage={
          selectedDate
            ? "No order requests found for the selected date."
            : "No order requests found yet. Submit a test order from the customer cart flow to see it here."
        }
      />
    </div>
  );
}
