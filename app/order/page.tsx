import PageShell from "../../components/PageShell";
import OrderForm from "../../components/OrderForm";
import SectionHeader from "../../components/SectionHeader";

export default function OrderPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          title="Order Request"
          description="Fill in your contact details and send your selected items to JuneRose. Our staff will confirm availability, payment, and pickup or delivery."
        />

        <OrderForm />
      </section>
    </PageShell>
  );
}