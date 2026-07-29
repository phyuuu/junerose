"use client";

import { useState } from "react";
import { adjustProductStockAction } from "@/app/admin/products/stock-actions";
import type { InternalProduct } from "@/types/product";

type AdminInventoryAdjustmentPanelProps = {
  product: InternalProduct;
};

export default function AdminInventoryAdjustmentPanel({
  product,
}: AdminInventoryAdjustmentPanelProps) {
  const [adjustments, setAdjustments] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");

  async function handleAdjustStock(variantId: number) {
    const amount = Number(adjustments[variantId]);

    const result = await adjustProductStockAction(
      product.id,
      variantId,
      amount,
    );

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Stock updated successfully.");

    setAdjustments((current) => ({
      ...current,
      [variantId]: "",
    }));
  }

  return (
    <section className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
      <h2 className="text-lg font-semibold">
        Inventory adjustment
      </h2>

      <p className="mt-2 text-sm text-[#6f6258]">
        Use positive numbers to add stock and negative numbers to reduce stock.
        Every adjustment is recorded.
      </p>

      {message && (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-sm">
          {message}
        </p>
      )}

      <div className="mt-5 space-y-5">
        {product.stockItems.map((item) => (
          <div
            key={item.variantId}
            className="rounded-xl border border-[#d6c4aa] bg-white p-4"
          >
            <p className="font-medium">
              {item.size} / {item.color}
            </p>

            <p className="mt-1 text-sm text-[#6f6258]">
              Current quantity: {item.quantity}
            </p>

            <div className="mt-3 flex gap-3">
              <input
                type="number"
                placeholder="+5 or -2"
                value={adjustments[item.variantId] ?? ""}
                onChange={(event) =>
                  setAdjustments((current) => ({
                    ...current,
                    [item.variantId]: event.target.value,
                  }))
                }
                className="w-32 rounded-xl border border-[#d6c4aa] px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={() => handleAdjustStock(item.variantId)}
                className="rounded-xl bg-[#2f241d] px-4 py-2 text-sm text-white"
              >
                Adjust stock
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}