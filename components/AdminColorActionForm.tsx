"use client";

import type { FormEvent } from "react";

type AdminColorActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  colorId: number;
  label: string;
  confirmMessage: string;
  nextIsActive?: boolean;
  variant: "normal" | "danger";
};

export default function AdminColorActionForm({
  action,
  colorId,
  label,
  confirmMessage,
  nextIsActive,
  variant,
}: AdminColorActionFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="colorId" value={colorId} />

      {nextIsActive !== undefined && (
        <input
          type="hidden"
          name="nextIsActive"
          value={String(nextIsActive)}
        />
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
