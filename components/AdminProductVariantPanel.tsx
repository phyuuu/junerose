"use client";

import { useActionState } from "react";
import { addProductVariantAction } from "@/app/admin/products/actions";
import type { AdminProductOptions } from "@/lib/admin-product-options";
import type { InternalProduct } from "@/types/product";
import type { AddProductVariantState } from "@/types/admin-variant-action";

type AdminProductVariantPanelProps = {
  product: InternalProduct;
  options: AdminProductOptions;
};

const initialState: AddProductVariantState = {};

export default function AdminProductVariantPanel({
  product,
  options,
}: AdminProductVariantPanelProps) {
  const [state, formAction, isPending] = useActionState(
    addProductVariantAction,
    initialState,
  );

  return (
    <section className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
      <div>
        <h2 className="text-lg font-semibold">
          Product Variants
        </h2>

        <p className="mt-1 text-sm text-[#6f6258]">
          Manage size, color, and available quantities.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {product.stockItems.map((variant) => (
          <div
            key={variant.variantId}
            className="rounded-xl border border-[#d6c4aa] bg-white p-4"
          >
            <div className="flex justify-between text-sm">
              <span>
                {variant.size} / {variant.color}
              </span>

              <span>
                Quantity: {variant.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-[#d6c4aa] pt-6">
        <h3 className="text-base font-semibold">
          Add Variant
        </h3>

        {state.formError && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.formError}
          </p>
        )}

        <form action={formAction} className="mt-4 grid gap-4">
          <input
            type="hidden"
            name="productId"
            value={product.id}
          />

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">
                Size
              </label>

              <select
                name="sizeId"
                className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
              >
                <option value="">
                  Select size
                </option>

                {options.sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>

              {state.fieldErrors?.sizeId && (
                <p className="mt-1 text-sm text-red-600">
                  {state.fieldErrors.sizeId[0]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Color
              </label>

              <select
                name="colorId"
                className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
              >
                <option value="">
                  Select color
                </option>

                {options.colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>

              {state.fieldErrors?.colorId && (
                <p className="mt-1 text-sm text-red-600">
                  {state.fieldErrors.colorId[0]}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">
                Quantity
              </label>

              <input
                name="quantity"
                type="number"
                min="0"
                defaultValue="0"
                className="mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
              />

              {state.fieldErrors?.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {state.fieldErrors.quantity[0]}
                </p>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isPending}
                className="w-fit rounded-xl bg-[#2f241d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save variant"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
