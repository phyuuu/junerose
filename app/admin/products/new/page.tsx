import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import AdminProductCreateForm from "@/components/AdminProductCreateForm";
import { requireStaff } from "@/lib/auth/require-staff";
import { getAdminProductOptions } from "@/lib/admin-product-options";

export default async function AdminNewProductPage() {
  await requireStaff();
  const options = await getAdminProductOptions();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Add Product"
          description="Create a new product for the JuneRose catalog."
        />

        <AdminProductCreateForm options={options} />
      </section>
    </AdminShell>
  );
}
