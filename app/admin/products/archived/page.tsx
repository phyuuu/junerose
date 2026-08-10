import Link from "next/link";
import AdminArchivedProductTable from "@/components/AdminArchivedProductTable";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { getArchivedAdminProducts } from "@/lib/admin-products";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "@/lib/routes";

export default async function AdminArchivedProductsPage() {
  await requireStaff();

  const products = await getArchivedAdminProducts();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <SectionHeader
            eyebrow="STAFF AREA"
            title="Archived Products"
            description="Review retired products and restore them if needed."
          />

          <Link
            href={routes.adminProducts}
            className="w-fit rounded-xl border border-[#d6c4aa] px-4 py-2 text-sm font-semibold text-[#8b5e3c] hover:bg-[#eadfce]"
          >
            Back to products
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-[#d6c4aa] bg-[#fbf7f0] px-4 py-3 text-sm text-[#6f6258]">
          Restored products return to the active admin list but stay hidden
          from customers until you choose Show.
        </div>

        <AdminArchivedProductTable products={products} />
      </section>
    </AdminShell>
  );
}
