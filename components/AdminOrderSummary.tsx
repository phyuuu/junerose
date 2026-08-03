import AdminSummaryCard from "@/components/AdminSummaryCard";
import type { OrderRequest } from "@/types/order";

type AdminOrderSummaryProps = {
  orders: OrderRequest[];
};

export default function AdminOrderSummary({
  orders,
}: AdminOrderSummaryProps) {
  const totalCount = orders.length;
  const pendingCount = orders.filter(
    (order) => order.status === "pending",
  ).length;
  const inProgressCount = orders.filter((order) =>
    ["confirmed", "preparing"].includes(order.status),
  ).length;
  const readyCount = orders.filter(
    (order) => order.status === "ready",
  ).length;
  const completedCount = orders.filter(
    (order) => order.status === "completed",
  ).length;
  const cancelledCount = orders.filter(
    (order) => order.status === "cancelled",
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <AdminSummaryCard label="Total" value={totalCount} />
      <AdminSummaryCard label="Pending" value={pendingCount} />
      <AdminSummaryCard label="In progress" value={inProgressCount} />
      <AdminSummaryCard label="Ready" value={readyCount} />
      <AdminSummaryCard label="Completed" value={completedCount} />
      <AdminSummaryCard label="Cancelled" value={cancelledCount} />
    </div>
  );
}
