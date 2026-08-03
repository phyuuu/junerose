import type { OrderStatus } from "@/types/order";

const statusLabel: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusClasses: Record<OrderStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  preparing: "border-[#d6c4aa] bg-[#f8f3eb] text-[#8b5e3c]",
  ready: "border-green-200 bg-green-50 text-green-700",
  completed: "border-gray-200 bg-gray-50 text-gray-600",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

type AdminOrderStatusBadgeProps = {
  status: OrderStatus;
};

export default function AdminOrderStatusBadge({
  status,
}: AdminOrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}
