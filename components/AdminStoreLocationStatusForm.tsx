"use client";

import type { FormEvent } from "react";

type AdminStoreLocationStatusFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  storeLocationId: number;
  storeName: string;
  nextIsActive: boolean;
};

export default function AdminStoreLocationStatusForm({
  action,
  storeLocationId,
  storeName,
  nextIsActive,
}: AdminStoreLocationStatusFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const verb = nextIsActive ? "Activate" : "Deactivate";

    if (!window.confirm(`${verb} "${storeName}"?`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="storeLocationId" value={storeLocationId} />
      <input type="hidden" name="nextIsActive" value={String(nextIsActive)} />
      <button
        type="submit"
        className="rounded-[3px] border border-[#b8b2ae] px-3 py-2 text-sm font-medium hover:border-[#b62568] hover:text-[#b62568]"
      >
        {nextIsActive ? "Activate" : "Deactivate"}
      </button>
    </form>
  );
}
