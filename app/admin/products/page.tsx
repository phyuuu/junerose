import AdminShell from "../../../components/AdminShell";
import SectionHeader from "../../../components/SectionHeader";

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Products"
          description="Staff will be able to add products, edit prices, upload photos, hide unavailable items, and manage public product information."
        />

        <div className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
          <p className="text-sm text-[#8a7a6d]">
            Product management will be added here after we connect product data
            to a database.
          </p>
        </div>
      </section>
    </AdminShell>
  );
}