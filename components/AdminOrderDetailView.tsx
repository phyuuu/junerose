"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMMK } from "@/lib/formatPrice";
import { getOrderByNumber } from "@/lib/orderStorage";

type AdminOrderDetailViewProps = {
  orderNumber: string;
};

export default function AdminOrderDetailView({
  orderNumber,
}: AdminOrderDetailViewProps) {
  const order = getOrderByNumber(orderNumber) ?? null;

  if (!order) {
    return (
      <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <h2 className="text-lg font-medium">Order not found</h2>

        <p className="mt-2 text-sm text-[#8a7a6d]">
          This order could not be found in local browser storage. Local mock
          orders only exist on the device/browser where they were created.
        </p>

        <Link
          href="/admin/orders"
          className="mt-4 inline-block rounded-full bg-[#2f241d] px-5 py-2 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
        >
          Back to Orders
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-[#9c7a4f]">Order Number</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {order.orderNumber}
            </h2>
          </div>

          <span className="w-fit rounded-full bg-[#eadfce] px-3 py-1 text-xs font-medium text-[#9c7a4f]">
            {order.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#8a7a6d]">
              Customer
            </p>
            <p className="mt-1 text-sm font-medium">{order.customer.name}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#8a7a6d]">
              Phone
            </p>
            <p className="mt-1 text-sm font-medium">{order.customer.phone}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#8a7a6d]">
              Preferred Contact
            </p>
            <p className="mt-1 text-sm font-medium">
              {order.customer.preferredContact}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#8a7a6d]">
              Created At
            </p>
            <p className="mt-1 text-sm font-medium">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-[#8a7a6d]">
            Address / Township
          </p>
          <p className="mt-2 text-sm leading-6 text-[#6f6258]">
            {order.customer.address}
          </p>
        </div>

        {order.customer.note && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-[#8a7a6d]">
              Customer Note
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f6258]">
              {order.customer.note}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-xl border border-dashed border-[#d6c4aa] bg-[#f8f3eb] p-4">
          <p className="text-sm font-medium">Status actions coming later</p>
          <p className="mt-1 text-xs leading-5 text-[#8a7a6d]">
            Confirm, complete, and cancel actions will be enabled after database,
            authentication, and protected admin actions are added.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <h3 className="text-lg font-medium">Ordered Items</h3>

        <div className="mt-5 space-y-3">
          {order.items.map((item) => (
            <div
              key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
              className="flex gap-3 border-b border-[#e4d6c3] pb-3 last:border-b-0"
            >
              <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eadfce]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              <div>
                <p className="text-sm font-medium">{item.name}</p>

                <p className="mt-1 text-xs text-[#8a7a6d]">
                  Size: {item.selectedSize} · Color: {item.selectedColor}
                </p>

                <p className="mt-1 text-xs text-[#8a7a6d]">
                  Qty: {item.quantity}
                </p>

                <p className="mt-2 text-sm text-[#6f6258]">
                  {formatMMK(item.priceMMK * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#d6c4aa] pt-4">
          <p className="text-sm font-medium">Estimated Total</p>
          <p className="text-sm font-semibold">{formatMMK(order.totalMMK)}</p>
        </div>

        <Link
          href="/admin/orders"
          className="mt-5 inline-block text-sm font-medium text-[#9c7a4f] hover:underline"
        >
          Back to Orders
        </Link>
      </section>
    </div>
  );
}