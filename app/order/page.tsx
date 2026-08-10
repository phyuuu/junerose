import PageShell from "../../components/PageShell";
import OrderForm from "../../components/OrderForm";
import SectionHeader from "../../components/SectionHeader";

export default function OrderPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <SectionHeader
          eyebrow="Final step"
          title="Send your order request"
          description="Tell us how to contact you. JuneRose staff will confirm availability, payment, and pickup or delivery after receiving your request."
          appearance="editorial"
        />

        <OrderForm />
      </section>
    </PageShell>
  );
}
