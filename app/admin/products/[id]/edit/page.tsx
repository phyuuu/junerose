import { notFound } from "next/navigation";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminProductById } from "@/lib/admin-products";
import AdminProductInfoForm from "@/components/AdminProductInfoForm";

type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductEditPage({
  params,
}: AdminProductEditPageProps) {
  await requireAdmin();

  const { id } = await params;

  const productId = Number(id);

  if (Number.isNaN(productId)) {
    notFound();
  }

  const product = await getAdminProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Edit Product"
          description={`Editing: ${product.name}`}
        />

        <div className="mt-8">
            <AdminProductInfoForm product={product} />
        </div>
      </section>
    </AdminShell>
  );
}