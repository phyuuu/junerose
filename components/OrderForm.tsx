"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createOrderRequestAction } from "@/app/order/actions";
import { clearCart } from "@/lib/cartStorage";
import { formatMMK } from "@/lib/formatPrice";
import { saveRecentOrderAccess } from "@/lib/orderStorage";
import { useCartItems } from "@/hooks/useCartItems";
import { routes } from "@/lib/routes";
import type { CustomerContactInfo } from "@/types/order";

export default function OrderForm() {
  const router = useRouter();

  const cartItems = useCartItems();
  const [customer, setCustomer] = useState<CustomerContactInfo>({
    name: "",
    phone: "",
    address: "",
    preferredContact: "Viber",
    note: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const totalMMK = cartItems.reduce(
    (total, item) => total + item.priceMMK * item.quantity,
    0
  );

  function updateCustomerField(
    field: keyof CustomerContactInfo,
    value: string
  ) {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartItems.length === 0 || isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const result = await createOrderRequestAction({
      customer,
      items: cartItems,
      privacyAcknowledged,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setErrorMessage(result.error);
      return;
    }

    saveRecentOrderAccess(result.orderNumber, customer.phone.trim());
    clearCart();

    router.push(routes.orderSuccess(result.orderNumber));
  }

  if (cartItems.length === 0) {
    return (
      <div className="mt-12 border-y border-[#e7e1de] py-16 text-center sm:py-24">
        <p className="font-display text-3xl">Your shopping bag is empty</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f6864]">
          Add at least one piece before sending an order request.
        </p>

        <Link
          href={routes.catalog}
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[3px] bg-[#211d1b] px-7 text-sm font-medium text-white transition-colors hover:bg-[#b62568]"
        >
          Browse the collection
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"
    >
      <section aria-labelledby="contact-details-heading">
        <div className="border-b border-[#e7e1de] pb-4">
          <p className="text-xs font-medium uppercase text-[#9a8558]">01</p>
          <h2
            id="contact-details-heading"
            className="mt-2 font-display text-3xl"
          >
            Contact details
          </h2>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <label htmlFor="order-name" className="grid gap-2 text-sm">
            Full name
            <input
              id="order-name"
              required
              autoComplete="name"
              value={customer.name}
              onChange={(event) =>
                updateCustomerField("name", event.target.value)
              }
              className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm outline-none transition-colors focus:border-[#b62568]"
            />
          </label>

          <label htmlFor="order-phone" className="grid gap-2 text-sm">
            Phone number
            <input
              id="order-phone"
              required
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
              value={customer.phone}
              onChange={(event) =>
                updateCustomerField("phone", event.target.value)
              }
              className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm outline-none transition-colors focus:border-[#b62568]"
            />
          </label>

          <label
            htmlFor="order-address"
            className="grid gap-2 text-sm sm:col-span-2"
          >
            Address / township
            <textarea
              id="order-address"
              required
              autoComplete="street-address"
              value={customer.address}
              onChange={(event) =>
                updateCustomerField("address", event.target.value)
              }
              rows={4}
              className="w-full resize-y rounded-[3px] border border-[#d8d2cf] bg-white px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-[#b62568]"
            />
          </label>

          <label htmlFor="order-contact" className="grid gap-2 text-sm">
            Preferred contact
            <select
              id="order-contact"
              value={customer.preferredContact}
              onChange={(event) =>
                updateCustomerField(
                  "preferredContact",
                  event.target.value as CustomerContactInfo["preferredContact"],
                )
              }
              className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm outline-none transition-colors focus:border-[#b62568]"
            >
              <option value="Viber">Viber</option>
              <option value="Messenger">Messenger</option>
              <option value="Phone">Phone</option>
            </select>
          </label>

          <label htmlFor="order-note" className="grid gap-2 text-sm">
            Note <span className="text-xs text-[#6f6864]">Optional</span>
            <textarea
              id="order-note"
              value={customer.note}
              onChange={(event) =>
                updateCustomerField("note", event.target.value)
              }
              rows={4}
              className="w-full resize-y rounded-[3px] border border-[#d8d2cf] bg-white px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-[#b62568]"
            />
          </label>
        </div>
      </section>

      <aside className="border border-[#e7e1de] bg-[#faf9f8] p-6 lg:sticky lg:top-28">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl">Order summary</h2>
          <Link
            href={routes.cart}
            className="text-xs uppercase underline decoration-[#cfc8c4] underline-offset-4 hover:text-[#b62568]"
          >
            Edit bag
          </Link>
        </div>

        <div className="mt-6 divide-y divide-[#e7e1de] border-y border-[#e7e1de]">
          {cartItems.map((item) => (
            <div
              key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
              className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 py-4"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-[#f3f1f0]">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="shrink-0 text-xs">
                    {formatMMK(item.priceMMK * item.quantity)}
                  </p>
                </div>
                <p className="mt-1 text-xs leading-5 text-[#6f6864]">
                  {item.selectedColor} / {item.selectedSize} / Qty {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between py-5">
          <p className="text-sm">Estimated total</p>
          <p className="font-medium">{formatMMK(totalMMK)}</p>
        </div>

        <p className="text-xs leading-6 text-[#6f6864]">
          No payment is collected now. JuneRose staff will contact you to
          confirm availability, payment, and fulfilment.
        </p>

        <label
          htmlFor="order-privacy"
          className="mt-5 flex items-start gap-3 border-t border-[#e7e1de] pt-5 text-xs leading-6 text-[#4f4946]"
        >
          <input
            id="order-privacy"
            type="checkbox"
            required
            checked={privacyAcknowledged}
            onChange={(event) =>
              setPrivacyAcknowledged(event.target.checked)
            }
            className="mt-1 size-4 shrink-0 accent-[#b62568]"
          />
          <span>
            I have read and acknowledge the{" "}
            <Link
              href={routes.privacy}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline decoration-[#cfc8c4] underline-offset-2 hover:text-[#b62568]"
            >
              JuneRose privacy notice
            </Link>
            .
          </span>
        </label>

        {errorMessage && (
          <p className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !privacyAcknowledged}
          className="mt-6 min-h-12 w-full rounded-[3px] bg-[#211d1b] px-6 text-sm font-medium text-white transition-colors hover:bg-[#b62568] disabled:cursor-not-allowed disabled:bg-[#cfc8c4]"
        >
          {isSubmitting ? "Sending request..." : "Send order request"}
        </button>
      </aside>
    </form>
  );
}
