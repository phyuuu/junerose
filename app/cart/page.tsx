import PageShell from "../../components/PageShell";
import CartView from "../../components/CartView";
import SectionHeader from "../../components/SectionHeader";

export default function CartPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <SectionHeader
          eyebrow="Your selection"
          title="Shopping bag"
          description="Review your pieces before sending an order request. No payment is collected on this website."
          appearance="editorial"
        />

        <CartView />
      </section>
    </PageShell>
  );
}
