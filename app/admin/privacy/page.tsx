import AdminPrivacyRequestForm from "@/components/AdminPrivacyRequestForm";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { getAdminDataRetentionSummary } from "@/lib/admin-data-retention";
import { requireStaff } from "@/lib/auth/require-staff";

export default async function AdminDataRetentionPage() {
  await requireStaff();
  const summary = await getAdminDataRetentionSummary();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-4xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Customer Privacy"
          description="Review older customer records and handle verified privacy requests one order at a time."
        />

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Retention review</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f534a]">
            The 12-month date is a manual review reminder. Reaching it does not
            automatically change or remove any customer information.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <section className="rounded-lg border border-[#d6c4aa] bg-[#fbf7f0] p-5">
              <h3 className="text-sm font-medium text-[#6f6258]">
                Orders due for review
              </h3>
              <p className="mt-2 text-3xl font-semibold">
                {summary.eligibleCount}
              </p>
            </section>

            <section className="rounded-lg border border-[#d6c4aa] bg-[#fbf7f0] p-5">
              <h3 className="text-sm font-medium text-[#6f6258]">
                Review cutoff
              </h3>
              <p className="mt-2 text-lg font-semibold">
                {new Date(summary.cutoffAt).toLocaleDateString("en-GB")}
              </p>
              <p className="mt-1 text-sm text-[#8a7a6d]">
                {summary.retentionMonths} months
              </p>
            </section>
          </div>
        </section>

        <AdminPrivacyRequestForm />
      </section>
    </AdminShell>
  );
}
