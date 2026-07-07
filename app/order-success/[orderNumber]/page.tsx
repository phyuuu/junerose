import PageShell from "../../../components/PageShell";
import OrderSuccessView from "../../../components/OrderSuccessView";
import SectionHeader from "../../../components/SectionHeader";

type OrderSuccessPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
};

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const { orderNumber } = await params;

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          title="Order Request Sent"
          description="Your order request has been saved on this device. Please keep your order number and share it with JuneRose staff if needed."
        />

        <OrderSuccessView orderNumber={orderNumber} />
      </section>
    </PageShell>
  );
}