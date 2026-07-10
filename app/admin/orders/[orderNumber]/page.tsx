import AdminOrderDetailView from "@/components/AdminOrderDetailView";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";

type AdminOrderDetailPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { orderNumber } = await params;

  return (
    <AdminShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Order Detail"
          description="Review customer order request details. Status updates will be connected after database and protected admin actions are added."
        />

        <div className="mt-8">
          <AdminOrderDetailView orderNumber={orderNumber} />
        </div>
      </section>
    </AdminShell>
  );
}