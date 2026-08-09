"use client";

import type { FormEvent } from "react";

type AdminMaterialActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  materialId: number;
  label: string;
  confirmMessage: string;
  nextIsActive?: boolean;
  variant: "normal" | "danger";
};

export default function AdminMaterialActionForm({
  action,
  materialId,
  label,
  confirmMessage,
  nextIsActive,
  variant,
}: AdminMaterialActionFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="materialId" value={materialId} />
      {nextIsActive !== undefined && (
        <input type="hidden" name="nextIsActive" value={String(nextIsActive)} />
      )}
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
