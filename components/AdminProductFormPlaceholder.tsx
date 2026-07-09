const inputClassName =
  "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 outline-none";

export default function AdminProductFormPlaceholder() {
  return (
    <form className="grid gap-4" aria-label="Disabled product form">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Product name
          <input
            disabled
            className={inputClassName}
            placeholder="Example: Lace everyday bra"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Product code
          <input
            disabled
            className={inputClassName}
            placeholder="Example: JR-BRA-001"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Category
          <input
            disabled
            className={inputClassName}
            placeholder="Example: Bras"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Price
          <input
            disabled
            className={inputClassName}
            placeholder="Example: 45000"
          />
        </label>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">
          Stock by size and color will be added here later.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          We will store detailed stock internally, but public pages will only
          show safe availability information.
        </p>
      </div>

      <button
        type="button"
        disabled
        className="w-fit rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-500"
      >
        Save product later
      </button>
    </form>
  );
}