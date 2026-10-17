"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createOrderRequestAction } from "@/app/order/actions";
import { clearCart } from "@/lib/cartStorage";
import { formatMMK } from "@/lib/formatPrice";
import { saveRecentOrderAccess } from "@/lib/orderStorage";
import {
  clearOrderRequestToken,
  getOrCreateOrderRequestToken,
} from "@/lib/orderRequestToken";
import { useCartItems } from "@/hooks/useCartItems";
import { useCartValidation } from "@/hooks/useCartValidation";
import { applyCartValidation } from "@/lib/cart-validation";
import { routes } from "@/lib/routes";
import {
  createOrderRequestSchema,
  getOrderFieldErrors,
  type OrderFieldErrors,
} from "@/lib/validation/order";
import type {
  CustomerContactInfo,
  FulfillmentMethod,
} from "@/types/order";
import type { PublicStoreLocation } from "@/types/store-location";

type OrderFormProps = {
  storeLocations: PublicStoreLocation[];
};

export default function OrderForm({ storeLocations }: OrderFormProps) {
  const router = useRouter();

  const cartItems = useCartItems();
  const {
    status: validationStatus,
    validationByVariantId,
    hasBlockingIssues,
    recheck,
  } = useCartValidation(cartItems);
  const [customer, setCustomer] = useState<CustomerContactInfo>({
    name: "",
    phone: "",
    preferredContact: "Viber",
    note: "",
  });
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [pickupStoreId, setPickupStoreId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<OrderFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);

  const currentCartItems = cartItems.map((item) =>
    applyCartValidation(item, validationByVariantId.get(item.variantId)),
  );
  const totalMMK = currentCartItems.reduce(
    (total, item) => total + item.priceMMK * item.quantity,
    0
  );
  const selectedPickupStore = storeLocations.find(
    (location) => location.id === Number(pickupStoreId),
  );

  function updateCustomerField(
    field: keyof CustomerContactInfo,
    value: string
  ) {
    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      [field]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
  }

  function selectFulfillmentMethod(method: FulfillmentMethod) {
    setFulfillmentMethod(method);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      address: undefined,
      pickupStoreId: undefined,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      cartItems.length === 0 ||
      isSubmitting ||
      validationStatus !== "ready" ||
      hasBlockingIssues
    ) {
      return;
    }

    const requestToken = getOrCreateOrderRequestToken(cartItems);
    const orderInput = {
      customer,
      fulfillment:
        fulfillmentMethod === "delivery"
          ? {
              method: "delivery" as const,
              address: deliveryAddress,
            }
          : {
              method: "pickup" as const,
              storeId: Number(pickupStoreId),
            },
      items: cartItems,
      requestToken,
      privacyAcknowledged,
    };
    const parsedOrder = createOrderRequestSchema.safeParse(orderInput);

    setErrorMessage("");
    setFieldErrors({});

    if (!parsedOrder.success) {
      const nextFieldErrors = getOrderFieldErrors(parsedOrder.error);
      setFieldErrors(nextFieldErrors);

      if (Object.keys(nextFieldErrors).length === 0) {
        setErrorMessage("Check your shopping bag and try again.");
      }

      return;
    }

    setIsSubmitting(true);

    const result = await createOrderRequestAction(parsedOrder.data);

    setIsSubmitting(false);

    if (!result.ok) {
      const nextFieldErrors = result.fieldErrors ?? {};
      setFieldErrors(nextFieldErrors);
      setErrorMessage(
        Object.keys(nextFieldErrors).length > 0 ? "" : result.error,
      );

      if (result.code === "cart_changed") {
        recheck();
      }

      return;
    }

    saveRecentOrderAccess(result.orderNumber, customer.phone.trim());
    clearOrderRequestToken();
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
      noValidate
      className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start"
    >
      <div className="grid gap-12">
      <section aria-labelledby="fulfillment-heading">
        <div className="border-b border-[#e7e1de] pb-4">
          <p className="text-xs font-medium uppercase text-[#9a8558]">01</p>
          <h2 id="fulfillment-heading" className="mt-2 font-display text-3xl">
            Delivery or pickup
          </h2>
        </div>

        <fieldset className="mt-7 grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Choose delivery or store pickup</legend>
          <label
            className={`cursor-pointer border p-4 transition-colors ${
              fulfillmentMethod === "delivery"
                ? "border-[#211d1b] bg-[#faf9f8]"
                : "border-[#e7e1de] bg-white hover:border-[#b7afab]"
            }`}
          >
            <span className="flex items-start gap-3">
              <input
                type="radio"
                name="fulfillment-method"
                value="delivery"
                checked={fulfillmentMethod === "delivery"}
                onChange={() => selectFulfillmentMethod("delivery")}
                className="mt-1 size-4 accent-[#b62568]"
              />
              <span>
                <span className="block text-sm font-medium">Delivery</span>
                <span className="mt-1 block text-xs leading-5 text-[#6f6864]">
                  Enter your address. Staff will confirm the delivery fee and
                  timing.
                </span>
              </span>
            </span>
          </label>

          {storeLocations.length > 0 && (
            <label
              className={`cursor-pointer border p-4 transition-colors ${
                fulfillmentMethod === "pickup"
                  ? "border-[#211d1b] bg-[#faf9f8]"
                  : "border-[#e7e1de] bg-white hover:border-[#b7afab]"
              }`}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name="fulfillment-method"
                  value="pickup"
                  checked={fulfillmentMethod === "pickup"}
                  onChange={() => selectFulfillmentMethod("pickup")}
                  className="mt-1 size-4 accent-[#b62568]"
                />
                <span>
                  <span className="block text-sm font-medium">
                    Store pickup
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-[#6f6864]">
                    Choose the JuneRose store where you want to collect your
                    order.
                  </span>
                </span>
              </span>
            </label>
          )}
        </fieldset>

        {storeLocations.length === 0 && (
          <p className="mt-3 text-xs leading-5 text-[#6f6864]">
            Store pickup will appear when a pickup location is available.
          </p>
        )}

        {fulfillmentMethod === "delivery" ? (
          <label htmlFor="order-address" className="mt-6 grid gap-2 text-sm">
            Delivery address / township
            <textarea
              id="order-address"
              required
              autoComplete="street-address"
              value={deliveryAddress}
              aria-invalid={Boolean(fieldErrors.address)}
              aria-describedby={
                fieldErrors.address ? "order-address-error" : undefined
              }
              onChange={(event) => {
                setDeliveryAddress(event.target.value);
                setFieldErrors((currentErrors) => ({
                  ...currentErrors,
                  address: undefined,
                }));
              }}
              rows={4}
              className="w-full resize-y rounded-[3px] border border-[#d8d2cf] bg-white px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-[#b62568]"
            />
            {fieldErrors.address && (
              <span id="order-address-error" className="text-xs text-red-700">
                {fieldErrors.address}
              </span>
            )}
          </label>
        ) : (
          <div className="mt-6 grid gap-3">
            <label htmlFor="pickup-store" className="grid gap-2 text-sm">
              Pickup store
              <select
                id="pickup-store"
                required
                value={pickupStoreId}
                aria-invalid={Boolean(fieldErrors.pickupStoreId)}
                aria-describedby={
                  fieldErrors.pickupStoreId
                    ? "pickup-store-error"
                    : undefined
                }
                onChange={(event) => {
                  setPickupStoreId(event.target.value);
                  setFieldErrors((currentErrors) => ({
                    ...currentErrors,
                    pickupStoreId: undefined,
                  }));
                }}
                className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm outline-none transition-colors focus:border-[#b62568]"
              >
                <option value="">Choose a store</option>
                {storeLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} — {location.township}
                  </option>
                ))}
              </select>
              {fieldErrors.pickupStoreId && (
                <span id="pickup-store-error" className="text-xs text-red-700">
                  {fieldErrors.pickupStoreId}
                </span>
              )}
            </label>

            {selectedPickupStore && (
              <div className="border-l-2 border-[#9a8558] pl-4 text-xs leading-6 text-[#6f6864]">
                <p className="font-medium text-[#211d1b]">
                  {selectedPickupStore.name}
                </p>
                <p>{selectedPickupStore.address}</p>
                <p>{selectedPickupStore.township}</p>
                {selectedPickupStore.openingHours && (
                  <p>Hours: {selectedPickupStore.openingHours}</p>
                )}
                {selectedPickupStore.phone && (
                  <p>Phone: {selectedPickupStore.phone}</p>
                )}
                {selectedPickupStore.mapUrl && (
                  <a
                    href={selectedPickupStore.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-2 hover:text-[#b62568]"
                  >
                    View map
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <section aria-labelledby="contact-details-heading">
        <div className="border-b border-[#e7e1de] pb-4">
          <p className="text-xs font-medium uppercase text-[#9a8558]">02</p>
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
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "order-name-error" : undefined}
              onChange={(event) =>
                updateCustomerField("name", event.target.value)
              }
              className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm outline-none transition-colors focus:border-[#b62568]"
            />
            {fieldErrors.name && (
              <span id="order-name-error" className="text-xs text-red-700">
                {fieldErrors.name}
              </span>
            )}
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
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "order-phone-error" : undefined}
              onChange={(event) =>
                updateCustomerField("phone", event.target.value)
              }
              className="min-h-12 w-full rounded-[3px] border border-[#d8d2cf] bg-white px-4 text-sm outline-none transition-colors focus:border-[#b62568]"
            />
            {fieldErrors.phone && (
              <span id="order-phone-error" className="text-xs text-red-700">
                {fieldErrors.phone}
              </span>
            )}
          </label>

          <label htmlFor="order-contact" className="grid gap-2 text-sm">
            Preferred contact
            <select
              id="order-contact"
              value={customer.preferredContact}
              aria-invalid={Boolean(fieldErrors.preferredContact)}
              aria-describedby={
                fieldErrors.preferredContact ? "order-contact-error" : undefined
              }
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
            {fieldErrors.preferredContact && (
              <span id="order-contact-error" className="text-xs text-red-700">
                {fieldErrors.preferredContact}
              </span>
            )}
            {customer.preferredContact === "Messenger" && (
              <span className="text-xs leading-5 text-[#6f6864]">
                After submitting, send your order number through Messenger so
                staff can continue the conversation.
              </span>
            )}
          </label>

          <label htmlFor="order-note" className="grid gap-2 text-sm">
            Note <span className="text-xs text-[#6f6864]">Optional</span>
            <textarea
              id="order-note"
              value={customer.note}
              aria-invalid={Boolean(fieldErrors.note)}
              aria-describedby={fieldErrors.note ? "order-note-error" : undefined}
              onChange={(event) =>
                updateCustomerField("note", event.target.value)
              }
              rows={4}
              className="w-full resize-y rounded-[3px] border border-[#d8d2cf] bg-white px-4 py-3 text-sm leading-6 outline-none transition-colors focus:border-[#b62568]"
            />
            {fieldErrors.note && (
              <span id="order-note-error" className="text-xs text-red-700">
                {fieldErrors.note}
              </span>
            )}
          </label>
        </div>
      </section>
      </div>

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
          {currentCartItems.map((item) => (
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

        {validationStatus === "checking" && (
          <p className="mt-4 text-xs text-[#6f6864]" aria-live="polite">
            Checking current price and availability...
          </p>
        )}

        {validationStatus === "error" && (
          <div className="mt-4 border-l-2 border-red-600 pl-3 text-xs leading-5 text-red-700">
            <p>Unable to confirm current availability.</p>
            <button
              type="button"
              onClick={recheck}
              className="mt-2 font-medium underline underline-offset-2"
            >
              Check again
            </button>
          </div>
        )}

        {hasBlockingIssues && (
          <p className="mt-4 border-l-2 border-[#b62568] pl-3 text-xs leading-5 text-[#8f1f58]">
            Your shopping bag changed. Return to the bag and update the
            unavailable quantities before sending this request.
          </p>
        )}

        <label
          htmlFor="order-privacy"
          className="mt-5 flex items-start gap-3 border-t border-[#e7e1de] pt-5 text-xs leading-6 text-[#4f4946]"
        >
          <input
            id="order-privacy"
            type="checkbox"
            required
            checked={privacyAcknowledged}
            aria-invalid={Boolean(fieldErrors.privacyAcknowledged)}
            aria-describedby={
              fieldErrors.privacyAcknowledged
                ? "order-privacy-error"
                : undefined
            }
            onChange={(event) => {
              setPrivacyAcknowledged(event.target.checked);
              setFieldErrors((currentErrors) => ({
                ...currentErrors,
                privacyAcknowledged: undefined,
              }));
            }}
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

        {fieldErrors.privacyAcknowledged && (
          <p id="order-privacy-error" className="mt-2 text-xs text-red-700">
            {fieldErrors.privacyAcknowledged}
          </p>
        )}

        {errorMessage && (
          <p className="mt-4 border-l-2 border-red-600 pl-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={
            isSubmitting ||
            validationStatus !== "ready" ||
            hasBlockingIssues
          }
          className="mt-6 min-h-12 w-full rounded-[3px] bg-[#211d1b] px-6 text-sm font-medium text-white transition-colors hover:bg-[#b62568] disabled:cursor-not-allowed disabled:bg-[#cfc8c4]"
        >
          {isSubmitting ? "Sending request..." : "Send order request"}
        </button>
      </aside>
    </form>
  );
}
