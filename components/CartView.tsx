"use client";

import { useCartItems } from "@/hooks/useCartItems";
import { useCartValidation } from "@/hooks/useCartValidation";
import Image from "next/image";
import Link from "next/link";
import { applyCartValidation } from "@/lib/cart-validation";
import { formatMMK } from "@/lib/formatPrice";
import {
  removeCartItem,
  updateCartItemQuantity,
} from "@/lib/cartStorage";
import { routes } from "@/lib/routes";
import type { CartItem } from "@/types/cart";

export default function CartView() {
  const cartItems = useCartItems();
  const {
    status: validationStatus,
    validationByVariantId,
    hasBlockingIssues,
    recheck,
  } = useCartValidation(cartItems);

  function handleQuantityChange(item: CartItem, quantity: number) {
    updateCartItemQuantity(item, quantity);
  }

  function handleRemove(item: CartItem) {
    removeCartItem(item);
  }

  if (cartItems.length === 0) {
    return (
      <div className="mt-12 border-y border-[#e7e1de] py-16 text-center sm:py-24">
        <p className="font-display text-3xl">Your shopping bag is empty</p>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#6f6864]">
          Explore the collection and choose a color and size to add your first
          piece.
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

  const currentCartItems = cartItems.map((item) =>
    applyCartValidation(item, validationByVariantId.get(item.variantId)),
  );
  const totalMMK = currentCartItems.reduce(
    (total, item) => total + item.priceMMK * item.quantity,
    0
  );
  const canContinue =
    validationStatus === "ready" && !hasBlockingIssues;

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <section aria-labelledby="cart-items-heading">
        <div className="flex items-center justify-between border-b border-[#e7e1de] pb-4">
          <h2 id="cart-items-heading" className="text-sm font-medium uppercase">
            Selected pieces
          </h2>
          <p className="text-xs uppercase text-[#6f6864]">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div>
          {cartItems.map((item) => {
            const validation = validationByVariantId.get(item.variantId);
            const currentItem = applyCartValidation(item, validation);
            const priceChanged =
              validation?.priceMMK !== null &&
              validation?.priceMMK !== undefined &&
              validation.priceMMK !== item.priceMMK;

            return (
              <article
                key={item.variantId}
                className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 border-b border-[#e7e1de] py-6 sm:grid-cols-[128px_minmax(0,1fr)] sm:gap-6"
              >
              <Link
                href={routes.productDetail(
                  currentItem.slug,
                  currentItem.selectedColor,
                )}
                className="relative aspect-[3/4] overflow-hidden rounded-[3px] bg-[#f5f3f2]"
              >
                <Image
                  src={currentItem.image}
                  alt={currentItem.name}
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={routes.productDetail(
                        currentItem.slug,
                        currentItem.selectedColor,
                      )}
                      className="font-medium hover:text-[#b62568]"
                    >
                      {currentItem.name}
                    </Link>
                    <p className="mt-2 text-xs leading-5 text-[#6f6864]">
                      {currentItem.selectedColor} / {currentItem.selectedSize}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-medium">
                    {formatMMK(currentItem.priceMMK * item.quantity)}
                  </p>
                </div>

                {validation?.status === "unavailable" && (
                  <p className="mt-3 border-l-2 border-red-600 pl-3 text-xs leading-5 text-red-700">
                    This option is no longer available. Remove it to continue.
                  </p>
                )}

                {validation?.status === "insufficient_stock" && (
                  <p className="mt-3 border-l-2 border-[#b62568] pl-3 text-xs leading-5 text-[#8f1f58]">
                    The requested quantity is not available. Reduce the
                    quantity to continue.
                  </p>
                )}

                {priceChanged && validation?.status === "available" && (
                  <p className="mt-3 text-xs leading-5 text-[#795f25]">
                    Price updated from {formatMMK(item.priceMMK)} to{" "}
                    {formatMMK(currentItem.priceMMK)}.
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5">
                  <div
                    className="grid h-10 grid-cols-[40px_36px_40px] border border-[#d8d2cf]"
                    aria-label={`${item.name} quantity`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item, item.quantity - 1)
                      }
                      aria-label={`Decrease ${item.name} quantity`}
                      className="text-lg transition-colors hover:bg-[#f8edf2]"
                    >
                      −
                    </button>

                    <span
                      className="flex items-center justify-center text-sm"
                      aria-live="polite"
                    >
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuantityChange(item, item.quantity + 1)
                      }
                      disabled={
                        item.quantity >= 20 ||
                        validation?.status === "unavailable" ||
                        validation?.status === "insufficient_stock"
                      }
                      aria-label={`Increase ${item.name} quantity`}
                      className="text-lg transition-colors hover:bg-[#f8edf2] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="text-xs uppercase text-[#6f6864] underline decoration-[#cfc8c4] underline-offset-4 hover:text-[#b62568]"
                  >
                    Remove
                  </button>
                </div>
              </div>
              </article>
            );
          })}
        </div>
      </section>

      <aside className="border border-[#e7e1de] bg-[#faf9f8] p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">Order summary</h2>

        <div className="mt-6 flex items-center justify-between border-y border-[#e7e1de] py-4">
          <p className="text-sm">Estimated total</p>
          <p className="text-base font-medium">{formatMMK(totalMMK)}</p>
        </div>

        <p className="mt-5 text-xs leading-6 text-[#6f6864]">
          No payment is collected now. JuneRose staff will confirm final
          availability, price, and pickup or delivery details.
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
            Update the highlighted items before continuing.
          </p>
        )}

        {canContinue ? (
          <Link
            href={routes.order}
            className="mt-6 flex min-h-12 w-full items-center justify-center rounded-[3px] bg-[#211d1b] px-6 text-center text-sm font-medium text-white transition-colors hover:bg-[#b62568]"
          >
            Continue to order request
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="mt-6 flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[3px] bg-[#cfc8c4] px-6 text-center text-sm font-medium text-white"
          >
            Continue to order request
          </span>
        )}

        <Link
          href={routes.catalog}
          className="mt-4 flex min-h-11 w-full items-center justify-center text-xs uppercase underline decoration-[#cfc8c4] underline-offset-4 hover:text-[#b62568]"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
