import Link from "next/link";

type AdminSummaryCardProps = {
  label: string;
  value: string | number;
  href?: string;
  active?: boolean;
};

export default function AdminSummaryCard({
  label,
  value,
  href,
  active = false,
}: AdminSummaryCardProps) {
  const content = (
    <div
      className={`rounded-[4px] border bg-white px-4 py-3 ${
        active ? "border-[#b62568]" : "border-[#d7dadd]"
      }`}
    >
      <p className="text-xs font-medium uppercase text-[#77716e]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#242220]">
        {value}
      </p>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="block rounded-[4px] outline-none hover:ring-1 hover:ring-[#b62568] focus-visible:ring-2 focus-visible:ring-[#b62568]"
    >
      {content}
    </Link>
  );
}
