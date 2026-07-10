import CheckOrderForm from "@/components/CheckOrderForm";
import PageShell from "@/components/PageShell";
import SectionHeader from "@/components/SectionHeader";

export default function CheckOrderPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          title="Check Order"
          description="Enter your order number and phone number to review your saved order request on this device."
        />

        <CheckOrderForm />
      </section>
    </PageShell>
  );
}