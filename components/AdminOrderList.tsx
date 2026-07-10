"use client";

import Link from "next/link";
import { formatMMK } from "@/lib/formatPrice";
import { getOrders } from "@/lib/orderStorage";

export default function AdminOrderList() {
  const orders = getOrders();

  if (orders.length === 0) {
    return (
      <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <h2 className="text-lg font-medium">Order requests</h2>
        <p className="mt-2 text-sm text-[#8a7a6d]">
          No local order requests found yet. Submit a test order from the
          customer cart flow to see it here.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
      <div className="border-b border-[#d6c4aa] px-5 py-4">
        <h2 className="text-lg font-medium">Order requests</h2>
        <p className="mt-1 text-sm text-[#8a7a6d]">
          Local mock orders submitted from this browser.
        </p>
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
            {orders.map((order) => (
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
                  <span className="rounded-full bg-[#eadfce] px-3 py-1 text-xs font-medium text-[#9c7a4f]">
                    {order.status}
                  </span>
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
    </section>
  );
}