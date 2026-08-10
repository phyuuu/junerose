import {
  createMaterialAction,
  deleteMaterialAction,
  toggleMaterialActiveAction,
  updateMaterialSortOrderAction,
} from "@/app/admin/options/materials/actions";
import AdminMaterialActionForm from "@/components/AdminMaterialActionForm";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireStaff } from "@/lib/auth/require-staff";
import { createClient } from "@/lib/supabase/server";

type MaterialRow = {
  id: number;
  name: string;
  is_active: boolean;
  sort_order: number | null;
};

export default async function AdminMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireStaff();
  const { error: errorMessage, saved } = await searchParams;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materials")
    .select("id, name, is_active, sort_order")
    .order("sort_order")
    .order("id");

  if (error) {
    throw new Error("Unable to load materials.");
  }

  const materials = (data ?? []) as MaterialRow[];

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Product Materials"
          description="Manage reusable materials that staff can assign to products."
        />

        {saved && <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{saved}</p>}
        {errorMessage && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</p>}

        <form action={createMaterialAction} className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
          <h2 className="text-lg font-semibold">Add material</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
            <label className="grid gap-1 text-sm">
              Material name
              <input name="name" type="text" placeholder="Example: Bamboo viscose" className="rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm" />
            </label>
            <label className="grid gap-1 text-sm">
              Sort order
              <input name="sortOrder" type="number" min="0" step="1" placeholder="Example: 60" className="rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm" />
            </label>
            <button type="submit" className="rounded-xl bg-[#2f241d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#4a382c]">Save material</button>
          </div>
        </form>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-[#d6c4aa] bg-white">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-[#fbf7f0]"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Sort order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-t border-[#eadcc8]">
                  <td className="px-4 py-3">{material.name}</td>
                  <td className="px-4 py-3">
                    <form action={updateMaterialSortOrderAction} className="flex items-center gap-2">
                      <input type="hidden" name="materialId" value={material.id} />
                      <input name="sortOrder" type="number" min="0" step="1" defaultValue={material.sort_order ?? ""} className="w-24 rounded-xl border border-[#d6c4aa] px-3 py-1" />
                      <button type="submit" className="rounded-xl border border-[#9c7a4f] px-3 py-1 text-[#6d4c2f]">Save order</button>
                    </form>
                  </td>
                  <td className="px-4 py-3">{material.is_active ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3"><div className="flex gap-2">
                    <AdminMaterialActionForm action={toggleMaterialActiveAction} materialId={material.id} label={material.is_active ? "Deactivate" : "Activate"} nextIsActive={!material.is_active} variant="normal" confirmMessage={`${material.is_active ? "Deactivate" : "Activate"} "${material.name}"?`} />
                    <AdminMaterialActionForm action={deleteMaterialAction} materialId={material.id} label="Delete" variant="danger" confirmMessage={`Delete "${material.name}" permanently? Only unused materials can be deleted.`} />
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
