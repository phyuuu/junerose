import type { ReactNode } from "react";

type AdminTableActionButtonProps = {
  children: ReactNode;
  disabledReason: string;
  variant?: "primary" | "neutral";
};

export default function AdminTableActionButton({
  children,
  disabledReason,
  variant = "neutral",
}: AdminTableActionButtonProps) {
  const variantClassName =
    variant === "primary"
      ? "border-[#c8a27a] bg-[#f8efe6] text-[#7b4f2f]"
      : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <button
      type="button"
      disabled
      title={disabledReason}
      aria-label={`${children} disabled: ${disabledReason}`}
      className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${variantClassName} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {children}
    </button>
  );
}