import { notFound } from "next/navigation";
import PageShell from "../../../components/PageShell";
import ProductOptions from "../../../components/ProductOptions";
import ProductGallery from "@/components/ProductGallery";
import { getPublicProductBySlug } from "../../../lib/products";
import { formatMMK } from "../../../lib/formatPrice";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <PageShell>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-6 md:grid-cols-2">
        <ProductGallery product={product} />

        <div className="max-w-md">
          <p className="text-sm text-[#9c7a4f]">{product.category}</p>

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

          <p className="mt-3 text-xs leading-5 text-[#8a7a6d]">
            Availability, final total, and pickup or delivery details will be
            confirmed by our staff after you send an order request.
          </p>

          <ProductOptions product={product} />
        </div>
      </section>
    </PageShell>
  );
}