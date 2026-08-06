import AdminOrderDashboard from "@/components/AdminOrderDashboard";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireStaff } from "@/lib/auth/require-staff";
import { getAdminOrders } from "@/lib/admin-orders";
import type { AdminOrderSort, OrderStatus } from "@/types/order";

type AdminOrdersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
    date?: string;
    sort?: string;
  }>;
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;

const ORDER_SORTS = ["newest", "oldest", "total_desc", "total_asc"] as const;

function parsePage(value: string | undefined) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function parseSearch(value: string | undefined) {
  const search = value?.trim() ?? "";

  return search.length > 0 ? search.slice(0, 80) : undefined;
}

function parseStatus(value: string | undefined): OrderStatus | undefined {
  if (ORDER_STATUSES.some((status) => status === value)) {
    return value as OrderStatus;
  }

  return undefined;
}

function getLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    value > getLocalDateKey(new Date())
  ) {
    return undefined;
  }

  return value;
}

function parseSort(value: string | undefined): AdminOrderSort {
  if (ORDER_SORTS.some((sort) => sort === value)) {
    return value as AdminOrderSort;
  }

  return "newest";
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireStaff();
  const { page, search, status, date, sort } = await searchParams;
  const filters = {
    page: parsePage(page),
    search: parseSearch(search),
    status: parseStatus(status),
    date: parseDate(date),
    sort: parseSort(sort),
  };
  const ordersPage = await getAdminOrders(filters);

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Orders"
          description="Staff will be able to search orders by order number, review customer requests, and update order status."
        />

        <AdminOrderDashboard
          key={`${filters.search ?? ""}-${filters.status ?? ""}-${
            filters.date ?? ""
          }-${filters.sort}-${ordersPage.currentPage}`}
          ordersPage={ordersPage}
          filters={filters}
        />
      </section>
    </AdminShell>
  );
}
