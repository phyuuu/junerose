import {
  createSizeAction,
  deleteSizeAction,
  toggleSizeActiveAction,
} from "@/app/admin/options/sizes/actions";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";
import AdminSizeActionForm from "@/components/AdminSizeActionForm";

type SizeRow = {
  id: number;
  name: string;
  is_active: boolean;
  sort_order: number | null;
};

type AdminSizesPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AdminSizesPage({
  searchParams,
}: AdminSizesPageProps) {
  await requireAdmin();

  const { error: errorMessage, saved } = await searchParams;
  const supabase = await createClient();

  const { data: sizes, error } = await supabase
    .from("sizes")
    .select("id, name, is_active, sort_order")
    .order("sort_order")
    .order("id");

  if (error) {
    throw new Error("Unable to load sizes.");
  }

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Product Sizes"
          description="Manage reusable size options for product variants."
        />

        {saved && (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {saved}
          </p>
        )}

        {errorMessage && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <form
          action={createSizeAction}
          className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5"
        >
          <h2 className="text-lg font-semibold">Add size</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
            <label className="grid gap-1 text-sm">
              Size name
              <input
                name="name"
                type="text"
                placeholder="Example: 3XL"
                className="rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="grid gap-1 text-sm">
              Sort order
              <input
                name="sortOrder"
                type="number"
                min="0"
                step="1"
                placeholder="Example: 70"
                className="rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-[#2f241d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a382c]"
            >
              Save size
            </button>
          </div>
        </form>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#d6c4aa] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fbf7f0]">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Sort order</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {(sizes as SizeRow[]).map((size) => (
                <tr key={size.id} className="border-t border-[#eadcc8]">
                  <td className="px-4 py-3">{size.name}</td>
                  <td className="px-4 py-3">{size.sort_order ?? "-"}</td>
                  <td className="px-4 py-3">
                    {size.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                        
                      <AdminSizeActionForm
                        action={toggleSizeActiveAction}
                        sizeId={size.id}
                        label={size.is_active ? "Deactivate" : "Activate"}
                        nextIsActive={!size.is_active}
                        variant="normal"
                        confirmMessage={
                            size.is_active
                            ? `Deactivate "${size.name}"? It will stop appearing in new product variant dropdowns, but existing products will keep it.`
                            : `Activate "${size.name}"? It will appear again in new product variant dropdowns.`
                        }
                        />

                        <AdminSizeActionForm
                        action={deleteSizeAction}
                        sizeId={size.id}
                        label="Delete"
                        variant="danger"
                        confirmMessage={`Delete "${size.name}" permanently? Only unused sizes can be deleted.`}
                        />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}