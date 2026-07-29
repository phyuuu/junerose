import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAllInventoryAdjustments } from "@/lib/admin-inventory";

export default async function InventoryHistoryPage() {
  await requireAdmin();

  const history = await getAllInventoryAdjustments();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Inventory History"
          description="View all stock adjustments made by staff."
        />

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[#d6c4aa]">
              <tr>
                <th className="px-5 py-3">
                  Product
                </th>

                <th className="px-5 py-3">
                  Variant
                </th>

                <th className="px-5 py-3">
                  Change
                </th>

                <th className="px-5 py-3">
                  Changed by
                </th>

                <th className="px-5 py-3">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#eadbc7]"
                >
                  <td className="px-5 py-3">
                    {item.productName}
                  </td>

                  <td className="px-5 py-3">
                    {item.size} / {item.color}
                  </td>

                  <td className="px-5 py-3 font-medium">
                    {item.quantityChange > 0 ? "+" : ""}
                    {item.quantityChange}
                  </td>

                  <td className="px-5 py-3">
                    {item.changedBy}
                  </td>

                  <td className="px-5 py-3">
                    {new Date(
                      item.createdAt,
                    ).toLocaleString()}
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