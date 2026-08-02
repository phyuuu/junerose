"use client";

import type { FormEvent } from "react";

type AdminProductImageActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  productId: number;
  imageId: number;
  label: string;
  confirmMessage: string;
  variant: "normal" | "danger";
};

export default function AdminProductImageActionForm({
  action,
  productId,
  imageId,
  label,
  confirmMessage,
  variant,
}: AdminProductImageActionFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="imageId" value={imageId} />

      <button
        type="submit"
        className={
          variant === "danger"
            ? "rounded-xl border border-red-300 px-3 py-1 text-sm text-red-700"
            : "rounded-xl border border-[#9c7a4f] px-3 py-1 text-sm text-[#6d4c2f]"
        }
      >
        {label}
      </button>
    </form>
  );
}
