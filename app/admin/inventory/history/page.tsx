import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireStaff } from "@/lib/auth/require-staff";
import { getAllInventoryAdjustments } from "@/lib/admin-inventory";

export default async function InventoryHistoryPage() {
  await requireStaff();

  const history = await getAllInventoryAdjustments();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Inventory History"
          description="View all stock adjustments made by staff."
        />

        <div className="mt-8 overflow-x-auto rounded-[4px] border border-[#d7dadd] bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-[#d7dadd] bg-[#f1f2f3] text-xs uppercase text-[#686360]">
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
                  className="border-b border-[#e5e7e9] hover:bg-[#fafbfb]"
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
                    {item.changedByName}
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
