import AdminProductTable from "@/components/AdminProductTable";
import type { InternalProduct } from "@/types/product";
import AdminProductTableToolbar from "@/components/AdminProductTableToolbar";

type AdminProductInventoryPanelProps = {
  products: InternalProduct[];
};

export default function AdminProductInventoryPanel({
  products,
}: AdminProductInventoryPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Product inventory
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Internal staff-only product data, including product codes and
              exact stock details.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Read-only preview
          </span>
        </div>
      </div>

      <AdminProductTableToolbar />

      <AdminProductTable products={products} />

      <div className="border-t border-slate-200 px-5 py-4">
        <p className="text-xs leading-5 text-slate-500">
          Product code and exact stock details are shown here for staff, but
          they are not exposed on customer-facing product pages. Total stock is
          calculated from the size/color stock rows.
        </p>
      </div>
    </section>
  );
}