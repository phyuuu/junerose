import AdminNotice from "@/components/AdminNotice";
import AdminOrderList from "@/components/AdminOrderList";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Orders"
          description="Staff will be able to search orders by order number, review customer requests, and update order status."
        />

        <div className="mt-6">
          <AdminNotice title="Temporary local order preview">
            Orders shown here are saved in this browser only. This is useful for
            development, but real staff order management will need a database
            and protected admin access.
          </AdminNotice>
        </div>

        <div className="mt-8">
          <AdminOrderList />
        </div>
      </section>
    </AdminShell>
  );
}