const inputClassName =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none";

export default function AdminProductTableToolbar() {
  return (
    <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-800">
            Inventory controls
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Search, filter, and sorting will be connected after products are
            stored in a database.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:w-[560px]">
          <input
            disabled
            className={inputClassName}
            placeholder="Search products later"
            aria-label="Search products disabled"
          />

          <select
            disabled
            className={inputClassName}
            aria-label="Filter by visibility disabled"
            defaultValue=""
          >
            <option value="">All visibility</option>
          </select>

          <select
            disabled
            className={inputClassName}
            aria-label="Sort products disabled"
            defaultValue=""
          >
            <option value="">Sort later</option>
          </select>
        </div>
      </div>
    </div>
  );
}