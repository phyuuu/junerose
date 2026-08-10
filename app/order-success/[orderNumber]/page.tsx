import OrderSuccessView from "@/components/OrderSuccessView";
import PageShell from "@/components/PageShell";
import SectionHeader from "@/components/SectionHeader";

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
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <SectionHeader
          eyebrow="Request received"
          title="Thank you"
          description="Your order request has been saved. Keep your order number so you can return and check its progress."
          appearance="editorial"
        />

        <OrderSuccessView orderNumber={orderNumber} />
      </section>
    </PageShell>
  );
}
