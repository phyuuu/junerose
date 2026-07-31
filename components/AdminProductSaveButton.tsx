"use client";

import { useFormStatus } from "react-dom";

type AdminProductSaveButtonProps = {
  idleLabel?: string;
  pendingLabel?: string;
};

export default function AdminProductSaveButton({
  idleLabel = "Save changes",
  pendingLabel = "Saving...",
}: AdminProductSaveButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-xl bg-[#2f241d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
