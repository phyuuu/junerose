import PageShell from "../../components/PageShell";
import CartView from "../../components/CartView";
import SectionHeader from "../../components/SectionHeader";

export default function CartPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          title="Cart"
          description="Your selected items will appear here before you send an order request."
        />

        <CartView />
      </section>
    </PageShell>
  );
}