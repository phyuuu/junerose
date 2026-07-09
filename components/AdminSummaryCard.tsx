type AdminSummaryCardProps = {
  label: string;
  value: string | number;
};

export default function AdminSummaryCard({
  label,
  value,
}: AdminSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-4">
      <p className="text-sm text-[#8a7a6d]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#3f342b]">
        {value}
      </p>
    </div>
  );
}