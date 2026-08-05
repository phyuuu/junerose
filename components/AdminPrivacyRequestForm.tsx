"use client";

import { useActionState } from "react";
import { manageOrderPrivacyRequestAction } from "@/app/admin/privacy/actions";
import type { AdminPrivacyRequestState } from "@/types/admin-privacy";

const initialState: AdminPrivacyRequestState = {};
const inputClassName =
  "min-h-11 w-full rounded-lg border border-[#bca58a] bg-white px-3 py-2 text-sm outline-none focus:border-[#7d6040] disabled:cursor-not-allowed disabled:bg-[#eadfce]";

export default function AdminPrivacyRequestForm() {
  const [state, formAction, isPending] = useActionState(
    manageOrderPrivacyRequestAction,
    initialState,
  );

  return (
    <section className="mt-8 border-t border-[#d6c4aa] pt-8">
      <h2 className="text-xl font-semibold">Customer privacy request</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f534a]">
        Verify the order number and phone number supplied by the customer. Only
        the matched order can be anonymized, and active orders must be completed
        or cancelled first.
      </p>

      {state.saved && (
        <p
          role="status"
          className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {state.saved}
        </p>
      )}

      {state.error && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}

      <form
        key={state.saved ? "cleared" : "lookup"}
        action={formAction}
        className="mt-6 grid gap-4 sm:grid-cols-2 sm:items-end"
      >
        <input type="hidden" name="intent" value="lookup" />

        <label className="grid gap-2 text-sm">
          Order number
          <input
            name="orderNumber"
            required
            maxLength={40}
            autoComplete="off"
            defaultValue={state.verification?.orderNumber ?? ""}
            placeholder="JR-20260803-9746"
            className={inputClassName}
          />
        </label>

        <label className="grid gap-2 text-sm">
          Customer phone number
          <input
            name="customerPhone"
            type="tel"
            required
            maxLength={30}
            autoComplete="off"
            defaultValue={state.verification?.customerPhone ?? ""}
            className={inputClassName}
          />
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="min-h-11 rounded-lg bg-[#2f241c] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a392c] disabled:cursor-not-allowed disabled:bg-[#b8aa98] sm:col-span-2 sm:justify-self-start"
        >
          {isPending ? "Checking..." : "Find order"}
        </button>
      </form>

      {state.preview && state.verification && (
        <section className="mt-8 rounded-lg border border-[#d6c4aa] bg-[#fbf7f0] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#8a7a6d]">VERIFIED ORDER</p>
              <h3 className="mt-1 text-lg font-semibold">
                {state.preview.orderNumber}
              </h3>
            </div>
            <span className="rounded-full border border-[#bca58a] bg-white px-3 py-1 text-xs font-medium capitalize">
              {state.preview.status}
            </span>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-[#8a7a6d]">Customer</dt>
              <dd className="mt-1 font-medium">{state.preview.customerName}</dd>
            </div>
            <div>
              <dt className="text-[#8a7a6d]">Phone</dt>
              <dd className="mt-1 font-medium">{state.preview.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-[#8a7a6d]">Created</dt>
              <dd className="mt-1 font-medium">
                {new Date(state.preview.createdAt).toLocaleDateString("en-GB")}
              </dd>
            </div>
          </dl>

          {state.preview.canAnonymize ? (
            <form action={formAction} className="mt-6 border-t border-[#d6c4aa] pt-6">
              <input type="hidden" name="intent" value="anonymize" />
              <input
                type="hidden"
                name="orderNumber"
                value={state.verification.orderNumber}
              />
              <input
                type="hidden"
                name="customerPhone"
                value={state.verification.customerPhone}
              />

              <p className="max-w-2xl text-sm leading-6 text-[#5f534a]">
                This removes the customer name, phone, address, customer note,
                and internal notes from this order only. Order items, totals,
                status, and inventory history remain.
              </p>
              <p className="mt-2 text-sm font-medium text-red-800">
                This cannot be undone from the admin website.
              </p>

              <div className="mt-4 grid max-w-xl gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <label className="grid gap-2 text-sm">
                  Type ANONYMIZE to confirm
                  <input
                    name="confirmation"
                    required
                    autoComplete="off"
                    className={inputClassName}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isPending}
                  className="min-h-11 rounded-lg bg-red-800 px-5 py-2 text-sm font-semibold text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:bg-[#b8aa98]"
                >
                  {isPending ? "Anonymizing..." : "Anonymize this order"}
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-6 border-t border-[#d6c4aa] pt-5 text-sm font-medium text-amber-800">
              Complete or cancel this order before anonymizing customer details.
            </p>
          )}
        </section>
      )}
    </section>
  );
}
