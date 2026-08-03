import AdminOrderDashboard from "@/components/AdminOrderDashboard";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminOrders } from "@/lib/admin-orders";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAdminOrders();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Orders"
          description="Staff will be able to search orders by order number, review customer requests, and update order status."
        />

        <AdminOrderDashboard orders={orders} />
      </section>
    </AdminShell>
  );
}
