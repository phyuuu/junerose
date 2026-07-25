import AdminLoginForm from "@/components/AdminLoginForm";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";

export default function AdminLoginPage() {
  return (
    <AdminShell>
      <section className="mx-auto max-w-md px-5 py-10">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Admin login"
          description="Sign in with an authorized staff account to manage products, stock, and orders."
        />

        <div className="mt-8 rounded-2xl border border-[#eadfce] bg-white p-6">
          <AdminLoginForm />
        </div>
      </section>
    </AdminShell>
  );
}