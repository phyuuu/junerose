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
        className="min-h-9 rounded-[4px] border border-[#cfd3d6] px-3 text-xs font-medium text-[#4f4a47] hover:bg-[#f1f2f3] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Restoring..." : "Restore"}
      </button>

      {message && (
        <p className="mt-1 text-[11px] leading-4 text-[#6c6764]">
          {message}
        </p>
      )}
    </div>
  );
}
