import { notFound } from "next/navigation";
import AdminProductInfoForm from "@/components/AdminProductInfoForm";
import AdminShell from "@/components/AdminShell";
import SectionHeader from "@/components/SectionHeader";
import { getAdminProductOptions } from "@/lib/admin-product-options";
import { getAdminProductImages } from "@/lib/admin-product-images";
import { getAdminProductById } from "@/lib/admin-products";
import { requireStaff } from "@/lib/auth/require-staff";
import AdminInventoryAdjustmentPanel from "@/components/AdminInventoryAdjustmentPanel";
import AdminProductImagePanel from "@/components/AdminProductImagePanel";
import AdminProductVariantPanel from "@/components/AdminProductVariantPanel";
import AdminProductVisibilityButton from "@/components/AdminProductVisibilityButton";
import AdminStatusBadge from "@/components/AdminStatusBadge";


type AdminProductEditPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    imageMessage?: string;
    saved?: string;
  }>;
};

export default async function AdminProductEditPage({
  params,
  searchParams,
}: AdminProductEditPageProps) {
  await requireStaff();

  const { id } = await params;
  const { imageMessage, saved } = await searchParams;

  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const [product, options, images] = await Promise.all([
    getAdminProductById(productId),
    getAdminProductOptions(),
    getAdminProductImages(productId),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <AdminStatusBadge
            label={product.isVisible ? "Visible" : "Hidden"}
            tone={product.isVisible ? "green" : "gray"}
          />
          <AdminProductVisibilityButton
            productId={product.id}
            isVisible={product.isVisible}
            productName={product.name}
          />
        </div>

        <div className="mt-8">
          <AdminProductInfoForm product={product} options={options} />

          <AdminProductImagePanel
            images={images}
            product={product}
            colors={options.colors}
            message={imageMessage}
          />

          <AdminProductVariantPanel product={product} options={options} />

          <AdminInventoryAdjustmentPanel product={product} />
        </div>
      </section>
    </AdminShell>
  );
}
