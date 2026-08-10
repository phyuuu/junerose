import Image from "next/image";
import type { ReactNode } from "react";
import { formatMMK } from "@/lib/formatPrice";
import type { OrderRequest, OrderStatus } from "@/types/order";

type CustomerOrderDetailsProps = {
  order: OrderRequest;
  customerFooter?: ReactNode;
};

const statusPresentation: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Request received",
    className: "border-[#d8d2cf] bg-[#f5f3f2] text-[#4f4946]",
  },
  confirmed: {
    label: "Confirmed",
    className: "border-[#b8cfbd] bg-[#eef6f0] text-[#35613e]",
  },
  preparing: {
    label: "Preparing",
    className: "border-[#d8c79f] bg-[#faf6e9] text-[#795f25]",
  },
  ready: {
    label: "Ready",
    className: "border-[#c9b6d8] bg-[#f5eff8] text-[#67427c]",
  },
  completed: {
    label: "Completed",
    className: "border-[#b9cdd5] bg-[#eef5f7] text-[#355b68]",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-[#e2b8b8] bg-[#fbefef] text-[#8f3434]",
  },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const presentation = statusPresentation[status];

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 text-xs font-medium ${presentation.className}`}
    >
      {presentation.label}
    </span>
  );
}

export default function CustomerOrderDetails({
  order,
  customerFooter,
}: CustomerOrderDetailsProps) {
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section aria-labelledby="customer-details-heading">
        <div className="border-b border-[#e7e1de] pb-4">
          <p className="text-xs font-medium uppercase text-[#9a8558]">Customer</p>
          <h3
            id="customer-details-heading"
            className="mt-2 font-display text-2xl"
          >
            Contact details
          </h3>
        </div>

        <dl className="mt-5 grid gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase text-[#6f6864]">Name</dt>
            <dd className="mt-1 break-words">{order.customer.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#6f6864]">Phone</dt>
            <dd className="mt-1 break-words">{order.customer.phone}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#6f6864]">Address</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words leading-6">
              {order.customer.address}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-[#6f6864]">
              Preferred contact
            </dt>
            <dd className="mt-1">{order.customer.preferredContact}</dd>
          </div>
          {order.customer.note && (
            <div>
              <dt className="text-xs uppercase text-[#6f6864]">Note</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words leading-6">
                {order.customer.note}
              </dd>
            </div>
          )}
        </dl>

        {customerFooter}
      </section>

      <section aria-labelledby="ordered-items-heading">
        <div className="flex items-end justify-between gap-4 border-b border-[#e7e1de] pb-4">
          <div>
            <p className="text-xs font-medium uppercase text-[#9a8558]">Order</p>
            <h3
              id="ordered-items-heading"
              className="mt-2 font-display text-2xl"
            >
              Selected pieces
            </h3>
          </div>
          <p className="text-xs uppercase text-[#6f6864]">
            {order.items.length} {order.items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="divide-y divide-[#e7e1de]">
          {order.items.map((item) => (
            <article
              key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
              className="grid grid-cols-[72px_minmax(0,1fr)] gap-4 py-5 sm:grid-cols-[88px_minmax(0,1fr)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-[#f3f1f0]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 72px, 88px"
                  className="object-cover"
                />
              </div>

              <div className="flex min-w-0 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="shrink-0 text-sm font-medium">
                    {formatMMK(item.priceMMK * item.quantity)}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#6f6864]">
                  {item.selectedColor} / {item.selectedSize}
                </p>
                <p className="mt-auto pt-3 text-xs text-[#6f6864]">
                  Quantity {item.quantity}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#211d1b] py-5">
          <p className="text-sm">Estimated total</p>
          <p className="font-medium">{formatMMK(order.totalMMK)}</p>
        </div>
      </section>
    </div>
  );
}
