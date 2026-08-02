"use client";

import { useState } from "react";
import { archiveProductAction } from "@/app/admin/products/actions";

type AdminProductArchiveButtonProps = {
  productId: number;
  productName: string;
};

export default function AdminProductArchiveButton({
  productId,
  productName,
}: AdminProductArchiveButtonProps) {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      `Archive "${productName}"? It will be removed from active admin lists and hidden from customers, but order/history data will stay safe.`,
    );

    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setMessage("");

    const result = await archiveProductAction(productId);

    setIsPending(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Product archived.");
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Archiving..." : "Archive"}
      </button>

      {message && (
        <p className="mt-1 text-[11px] leading-4 text-[#8a7a6d]">
          {message}
        </p>
      )}
    </div>
  );
}
