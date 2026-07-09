type AdminStatusBadgeTone = "green" | "amber" | "gray";

type AdminStatusBadgeProps = {
  label: string;
  tone: AdminStatusBadgeTone;
};

const toneClasses: Record<AdminStatusBadgeTone, string> = {
  green: "border-green-200 bg-green-50 text-green-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  gray: "border-gray-200 bg-gray-50 text-gray-600",
};

export default function AdminStatusBadge({
  label,
  tone,
}: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}