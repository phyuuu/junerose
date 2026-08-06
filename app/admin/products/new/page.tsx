import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import AdminProductCreateForm from "@/components/AdminProductCreateForm";
import { requireStaff } from "@/lib/auth/require-staff";

export default async function AdminNewProductPage() {
  await requireStaff();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Add Product"
          description="Create a new product for the JuneRose catalog."
        />

        <AdminProductCreateForm />
      </section>
    </AdminShell>
  );
}
