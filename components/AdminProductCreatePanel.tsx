import AdminProductFormPlaceholder from "@/components/AdminProductFormPlaceholder";

export default function AdminProductCreatePanel() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Add product
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            This form is intentionally disabled for now. Product creation will
            be connected after we add a database, authentication, and protected
            admin actions.
          </p>
        </div>

        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Coming later
        </span>
      </div>

      <AdminProductFormPlaceholder />
    </section>
  );
}