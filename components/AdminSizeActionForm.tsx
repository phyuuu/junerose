"use client";

type AdminSizeActionFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  sizeId: number;
  label: string;
  confirmMessage: string;
  nextIsActive?: boolean;
  variant: "normal" | "danger";
};

export default function AdminSizeActionForm({
  action,
  sizeId,
  label,
  confirmMessage,
  nextIsActive,
  variant,
}: AdminSizeActionFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="sizeId" value={sizeId} />

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