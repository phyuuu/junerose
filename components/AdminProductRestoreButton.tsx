"use client";

import { useState } from "react";
import { restoreProductAction } from "@/app/admin/products/actions";

type AdminProductRestoreButtonProps = {
  productId: number;
  productName: string;
};

export default function AdminProductRestoreButton({
  productId,
  productName,
}: AdminProductRestoreButtonProps) {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    const confirmed = window.confirm(
      `Restore "${productName}" to active admin products? It will stay hidden from customers until you click Show.`,
    );

    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setMessage("");

    const result = await restoreProductAction(productId);

    setIsPending(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage("Product restored.");
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-xl border border-[#9c7a4f] px-3 py-2 text-sm font-medium text-[#6d4c2f] hover:bg-[#eadfce] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Restoring..." : "Restore"}
      </button>

      {message && (
        <p className="mt-1 text-[11px] leading-4 text-[#8a7a6d]">
          {message}
        </p>
      )}
    </div>
  );
}
