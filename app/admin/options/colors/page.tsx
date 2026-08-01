import {
  createColorAction,
  deleteColorAction,
  toggleColorActiveAction,
} from "@/app/admin/options/colors/actions";
import AdminColorActionForm from "@/components/AdminColorActionForm";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

type ColorRow = {
  id: number;
  name: string;
  is_active: boolean;
  sort_order: number | null;
};

type AdminColorsPageProps = {
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AdminColorsPage({
  searchParams,
}: AdminColorsPageProps) {
  await requireAdmin();

  const { error: errorMessage, saved } = await searchParams;
  const supabase = await createClient();

  const { data: colors, error } = await supabase
    .from("colors")
    .select("id, name, is_active, sort_order")
    .order("sort_order")
    .order("id");

  if (error) {
    throw new Error("Unable to load colors.");
  }

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Product Colors"
          description="Manage reusable color options for product variants."
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
          action={createColorAction}
          className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5"
        >
          <h2 className="text-lg font-semibold">Add color</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
            <label className="grid gap-1 text-sm">
              Color name
              <input
                name="name"
                type="text"
                placeholder="Example: Burgundy"
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
                placeholder="Example: 80"
                className="rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm"
              />
            </label>

            <button
              type="submit"
              className="rounded-xl bg-[#2f241d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a382c]"
            >
              Save color
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
              {(colors as ColorRow[]).map((color) => (
                <tr key={color.id} className="border-t border-[#eadcc8]">
                  <td className="px-4 py-3">{color.name}</td>
                  <td className="px-4 py-3">{color.sort_order ?? "-"}</td>
                  <td className="px-4 py-3">
                    {color.is_active ? "Active" : "Inactive"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <AdminColorActionForm
                        action={toggleColorActiveAction}
                        colorId={color.id}
                        label={color.is_active ? "Deactivate" : "Activate"}
                        nextIsActive={!color.is_active}
                        variant="normal"
                        confirmMessage={
                          color.is_active
                            ? `Deactivate "${color.name}"? It will stop appearing in new product variant dropdowns, but existing products will keep it.`
                            : `Activate "${color.name}"? It will appear again in new product variant dropdowns.`
                        }
                      />

                      <AdminColorActionForm
                        action={deleteColorAction}
                        colorId={color.id}
                        label="Delete"
                        variant="danger"
                        confirmMessage={`Delete "${color.name}" permanently? Only unused colors can be deleted.`}
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
