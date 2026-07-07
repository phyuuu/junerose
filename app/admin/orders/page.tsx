import AdminShell from "../../../components/AdminShell";
import SectionHeader from "../../../components/SectionHeader";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Orders"
          description="Staff will be able to search orders by order number, review customer requests, and update order status."
        />

        <div className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
          <p className="text-sm text-[#8a7a6d]">
            Order management will be added here after we connect orders to a
            database.
          </p>
        </div>
      </section>
    </AdminShell>
  );
}