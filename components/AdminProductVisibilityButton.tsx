"use client";

import { useState } from "react";
import { toggleProductVisibilityAction } from "@/app/admin/products/actions";

type AdminProductVisibilityButtonProps = {
  productId: number;
  isVisible: boolean;
  productName: string;
};

export default function AdminProductVisibilityButton({
  productId,
  isVisible,
  productName,
}: AdminProductVisibilityButtonProps) {
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    const nextIsVisible = !isVisible;

    const confirmed = window.confirm(
      nextIsVisible
        ? `Show "${productName}" on the customer catalog?`
        : `Hide "${productName}" from the customer catalog?`,
    );

    if (!confirmed) {
      return;
    }

    setIsPending(true);
    setMessage("");

    const result = await toggleProductVisibilityAction(
      productId,
      nextIsVisible,
    );

    setIsPending(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setMessage(
      nextIsVisible
        ? "Product is now visible."
        : "Product is now hidden.",
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="min-h-9 rounded-[4px] border border-[#cfd3d6] px-3 text-xs font-medium text-[#4f4a47] hover:bg-[#f1f2f3] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : isVisible ? "Hide" : "Show"}
      </button>

      {message && (
        <p className="mt-1 text-[11px] leading-4 text-[#6c6764]">
          {message}
        </p>
      )}
    </div>
  );
}
