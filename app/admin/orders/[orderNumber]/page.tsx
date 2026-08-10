import AdminOrderDetailView from "@/components/AdminOrderDetailView";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { getAdminOrderNotes } from "@/lib/admin-order-notes";
import { getAdminOrderByNumber } from "@/lib/admin-orders";
import { requireStaff } from "@/lib/auth/require-staff";

type AdminOrderDetailPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  await requireStaff();

  const { orderNumber } = await params;
  const order = await getAdminOrderByNumber(orderNumber);
  const notes = order ? await getAdminOrderNotes(orderNumber) : [];

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
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
