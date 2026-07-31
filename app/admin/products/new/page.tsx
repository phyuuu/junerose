import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import AdminProductCreateForm from "@/components/AdminProductCreateForm";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function AdminNewProductPage() {
  await requireAdmin();

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
