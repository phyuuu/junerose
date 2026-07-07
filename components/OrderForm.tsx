"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart, getCartItems } from "../lib/cartStorage";
import { formatMMK } from "../lib/formatPrice";
import { generateOrderNumber } from "../lib/generateOrderNumber";
import { saveOrder } from "../lib/orderStorage";
import { routes } from "../lib/routes";
import type { CartItem } from "../types/cart";
import type { CustomerContactInfo, OrderRequest } from "../types/order";

export default function OrderForm() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerContactInfo>({
    name: "",
    phone: "",
    address: "",
    preferredContact: "Viber",
    note: "",
  });

  useEffect(() => {
    setCartItems(getCartItems());
  }, []);

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cartItems.length === 0) {
      return;
    }

    const orderNumber = generateOrderNumber();

    const order: OrderRequest = {
      orderNumber,
      customer,
      items: cartItems,
      totalMMK,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    saveOrder(order);
    clearCart();

    router.push(routes.orderSuccess(orderNumber));
  }

  if (cartItems.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <p className="text-sm text-[#8a7a6d]">
          Your cart is empty. Please add items before sending an order request.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-6 md:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <h2 className="text-lg font-medium">Contact Details</h2>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              required
              value={customer.name}
              onChange={(event) => updateCustomerField("name", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <input
              required
              value={customer.phone}
              onChange={(event) => updateCustomerField("phone", event.target.value)}
              className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Address / Township</label>
            <textarea
              required
              value={customer.address}
              onChange={(event) =>
                updateCustomerField("address", event.target.value)
              }
              rows={3}
              className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Preferred Contact</label>
            <select
              value={customer.preferredContact}
              onChange={(event) =>
                updateCustomerField(
                  "preferredContact",
                  event.target.value as CustomerContactInfo["preferredContact"]
                )
              }
              className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
            >
              <option value="Viber">Viber</option>
              <option value="Messenger">Messenger</option>
              <option value="Phone">Phone</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Note</label>
            <textarea
              value={customer.note}
              onChange={(event) => updateCustomerField("note", event.target.value)}
              rows={3}
              className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-[#f8f3eb] px-4 py-3 text-sm outline-none focus:border-[#9c7a4f]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <h2 className="text-lg font-medium">Order Summary</h2>

        <div className="mt-5 space-y-3">
          {cartItems.map((item) => (
            <div
              key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
              className="border-b border-[#e4d6c3] pb-3 last:border-b-0"
            >
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
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-[#d6c4aa] pt-4">
          <p className="text-sm font-medium">Estimated Total</p>
          <p className="text-sm font-semibold">{formatMMK(totalMMK)}</p>
        </div>

        <p className="mt-3 text-xs leading-5 text-[#8a7a6d]">
          JuneRose staff will confirm availability, payment, and pickup or
          delivery details.
        </p>

        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-[#2f241d] px-6 py-3 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
        >
          Send Order Request
        </button>
      </div>
    </form>
  );
}