type AdminNoticeProps = {
  title: string;
  children: React.ReactNode;
};

export default function AdminNotice({ title, children }: AdminNoticeProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">{title}</p>
      <div className="mt-1 leading-6">{children}</div>
    </div>
  );
}