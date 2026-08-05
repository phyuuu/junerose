import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How JuneRose collects, uses, protects, and retains customer order information.",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <article className="mx-auto max-w-3xl px-5 py-8">
        <p className="text-sm text-[#8a7a6d]">Effective August 5, 2026</p>
        <h1 className="mt-2 text-3xl font-semibold">Privacy at JuneRose</h1>
        <p className="mt-4 text-sm leading-7 text-[#5f534a]">
          JuneRose is a physical retail shop in Myanmar. This notice explains
          how we handle information submitted through our catalog and order
          request website. The website does not process online payments.
        </p>

        <div className="mt-10 space-y-10">
          <section aria-labelledby="privacy-collection">
            <h2 id="privacy-collection" className="text-xl font-semibold">
              Information we collect
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              When you send an order request, we collect your name, phone
              number, address or township, preferred contact method, optional
              note, selected products, order total, order number, status, and
              relevant dates. Name, phone, address, and product selections are
              required so staff can identify, confirm, and prepare the order.
              The note is optional.
            </p>
          </section>

          <section aria-labelledby="privacy-use">
            <h2 id="privacy-use" className="text-xl font-semibold">
              How we use information
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              We use this information to create and manage your order request,
              contact you about availability, payment, pickup, or delivery,
              manage stock, respond to order questions, maintain necessary
              business records, and prevent misuse of the order service. We do
              not sell customer information or use it for automated profiling.
            </p>
          </section>

          <section aria-labelledby="privacy-access">
            <h2 id="privacy-access" className="text-xl font-semibold">
              Who can access information
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              Customer details are available only to authorized JuneRose staff
              and technology providers needed to host the website, database,
              and product images. We may disclose information when required by
              law or to protect customers, staff, or the service.
            </p>
          </section>

          <section aria-labelledby="privacy-retention">
            <h2 id="privacy-retention" className="text-xl font-semibold">
              Retention and anonymization
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              Customer contact details are reviewed after 12 months. This
              review does not remove information automatically. Details may be
              retained longer when the customer asks JuneRose to keep them for
              future order support, or when they are still needed for an
              unresolved issue, business records, or a legal obligation.
              Customers may request earlier deletion where applicable. After
              anonymization, JuneRose may retain non-personal order items,
              totals, statuses, and inventory history for business records.
              Backup copies may remain temporarily until the provider&apos;s
              normal backup cycle replaces them.
            </p>
          </section>

          <section aria-labelledby="privacy-browser">
            <h2 id="privacy-browser" className="text-xl font-semibold">
              Information in your browser
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              Your cart is stored in your browser so it remains available while
              shopping. After a successful order request, the browser may keep
              the order number and phone number for up to 10 minutes in
              session-only storage so the success page can be opened once.
              JuneRose does not store complete orders in browser local storage.
              Customer pages do not currently use advertising or analytics
              trackers.
            </p>
          </section>

          <section aria-labelledby="privacy-security">
            <h2 id="privacy-security" className="text-xl font-semibold">
              Security
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              JuneRose limits customer details to protected staff workflows,
              validates order information on the server, restricts database
              access, rate-limits public order operations, and removes personal
              details from application error logs. No internet service can be
              guaranteed completely secure, but we review and improve these
              safeguards as the service changes.
            </p>
          </section>

          <section aria-labelledby="privacy-requests">
            <h2 id="privacy-requests" className="text-xl font-semibold">
              Access, correction, and deletion requests
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              You may ask JuneRose staff to explain, correct, or delete your
              customer information where applicable. Contact staff through the
              store contact channel used for your order. To protect your
              information, staff may ask you to verify the order number and
              phone number before responding. Some non-personal transaction or
              inventory records may be retained when needed for legitimate
              business or legal obligations.
            </p>
          </section>

          <section aria-labelledby="privacy-changes">
            <h2 id="privacy-changes" className="text-xl font-semibold">
              Changes to this notice
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5f534a]">
              We may update this notice when our order process or technology
              changes. The effective date at the top identifies the current
              version.
            </p>
          </section>
        </div>
      </article>
    </PageShell>
  );
}
