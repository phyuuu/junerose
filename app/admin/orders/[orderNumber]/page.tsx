import AdminOrderDetailView from "@/components/AdminOrderDetailView";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { getAdminOrderNotes } from "@/lib/admin-order-notes";
import { getAdminOrderByNumber } from "@/lib/admin-orders";
import { requireAdmin } from "@/lib/auth/require-admin";

type AdminOrderDetailPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  await requireAdmin();

  const { orderNumber } = await params;
  const order = await getAdminOrderByNumber(orderNumber);
  const notes = order ? await getAdminOrderNotes(orderNumber) : [];

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Order Detail"
          description="Review customer request details, update order status, and track stock reservation."
        />

        <div className="mt-8">
          <AdminOrderDetailView order={order} notes={notes} />
        </div>
      </section>
    </AdminShell>
  );
}
