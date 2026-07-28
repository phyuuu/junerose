"use client";

import { useFormStatus } from "react-dom";

export default function AdminProductSaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-fit rounded-xl bg-[#2f241d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4a382c] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}