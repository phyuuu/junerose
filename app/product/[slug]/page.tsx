import { notFound } from "next/navigation";
import PageShell from "../../../components/PageShell";
import ProductDetailExperience from "@/components/ProductDetailExperience";
import { getPublicProductBySlug } from "../../../lib/products";
import { formatMMK } from "../../../lib/formatPrice";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ color?: string }>;
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const { color } = await searchParams;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-6 md:grid-cols-2">
        <ProductDetailExperience product={product} initialColor={color}>
          <p className="text-sm text-[#9c7a4f]">
            {product.department.name} / {product.productType.name}
          </p>

          <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>

          <p className="mt-3 text-lg text-[#6f6258]">
            {formatMMK(product.priceMMK)}
          </p>

          <p className="mt-2 inline-block rounded-full bg-[#eadfce] px-4 py-2 text-sm text-[#9c7a4f]">
            {product.availability}
          </p>

          <p className="mt-5 text-sm leading-6 text-[#6f6258]">
            {product.description}
          </p>

          {product.materials.length > 0 && (
            <p className="mt-3 text-sm text-[#6f6258]">
              Materials: {product.materials.map((material) => material.name).join(", ")}
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-[#8a7a6d]">
            Availability, final total, and pickup or delivery details will be
            confirmed by our staff after you send an order request.
          </p>

        </ProductDetailExperience>
      </section>
    </PageShell>
  );
}
