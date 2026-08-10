import CheckOrderForm from "@/components/CheckOrderForm";
import PageShell from "@/components/PageShell";
import SectionHeader from "@/components/SectionHeader";

export default function CheckOrderPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <SectionHeader
          eyebrow="Order care"
          title="Check your order"
          description="Use the order number and phone number from your request to view its current status and details."
          appearance="editorial"
        />

        <CheckOrderForm />
      </section>
    </PageShell>
  );
}
