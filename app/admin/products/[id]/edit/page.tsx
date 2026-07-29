import { notFound } from "next/navigation";
import AdminProductInfoForm from "@/components/AdminProductInfoForm";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { getAdminProductById } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth/require-admin";
import AdminInventoryAdjustmentPanel from "@/components/AdminInventoryAdjustmentPanel";


type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    saved?: string;
  }>;
};

export default async function AdminProductEditPage({
  params,
  searchParams,
}: AdminProductEditPageProps) {
  await requireAdmin();

  const { id } = await params;
  const { saved } = await searchParams;

  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
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

        {saved === "1" && (
          <p className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            Changes saved successfully.
          </p>
        )}

        <div className="mt-8">
          <AdminProductInfoForm product={product} />
          
        <AdminInventoryAdjustmentPanel
          product={product}
        />
        </div>
      </section>
    </AdminShell>
  );
}