import Link from "next/link";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import ProductDetailExperience from "@/components/ProductDetailExperience";
import { formatMMK } from "@/lib/formatPrice";
import { getPublicProductBySlug } from "@/lib/products";
import { routes } from "@/lib/routes";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string }>;
};

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const { color } = await searchParams;
  const product = await getPublicProductBySlug(slug);

  if (!product) notFound();

  return (
    <PageShell>
      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-6 sm:px-8 sm:pt-8 lg:px-12">
        <ProductDetailExperience product={product} initialColor={color}>
          <Link
            href={routes.catalog}
            className="text-xs font-semibold uppercase text-[#9a8558] hover:text-[#b62568]"
          >
            Shop / {product.department.name} / {product.productType.name}
          </Link>

          <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">
            {product.name}
          </h1>

          <p className="mt-4 text-lg">{formatMMK(product.priceMMK)}</p>

          <div className="mt-4 flex items-center gap-2 text-sm text-[#6f6864]">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${
                product.availability === "Sold out"
                  ? "bg-[#9c9692]"
                  : product.availability === "Low stock"
                    ? "bg-[#b62568]"
                    : "bg-[#6f8b70]"
              }`}
            />
            {product.availability}
          </div>

          <p className="mt-7 text-sm leading-7 text-[#5f5854]">
            {product.description}
          </p>

          {product.materials.length > 0 && (
            <div className="mt-6 border-t border-[#e7e1de] pt-5">
              <p className="text-xs font-semibold uppercase text-[#6f6864]">Materials</p>
              <p className="mt-2 text-sm">
                {product.materials.map((material) => material.name).join(", ")}
              </p>
            </div>
          )}
        </ProductDetailExperience>
      </section>
    </PageShell>
  );
}
