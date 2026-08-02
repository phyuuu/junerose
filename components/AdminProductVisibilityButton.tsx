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
        className="rounded-xl border border-[#d6c4aa] px-3 py-2 text-sm font-medium text-[#8b5e3c] hover:bg-[#eadfce] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : isVisible ? "Hide" : "Show"}
      </button>

      {message && (
        <p className="mt-1 text-[11px] leading-4 text-[#8a7a6d]">
          {message}
        </p>
      )}
    </div>
  );
}