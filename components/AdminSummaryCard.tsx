type AdminSummaryCardProps = {
  label: string;
  value: string | number;
};

export default function AdminSummaryCard({
  label,
  value,
}: AdminSummaryCardProps) {
  return (
    <div className="rounded-[4px] border border-[#d7dadd] bg-white px-4 py-3">
      <p className="text-xs font-medium uppercase text-[#77716e]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#242220]">
        {value}
      </p>
    </div>
  );
}
