import Image from "next/image";
import Link from "next/link";
import HomeCategoryGrid from "@/components/HomeCategoryGrid";
import PageShell from "@/components/PageShell";
import ProductGrid from "@/components/ProductGrid";
import StorefrontHero from "@/components/StorefrontHero";
import { getMainProductImage } from "@/lib/product-image";
import { getPublicProducts } from "@/lib/products";
import { routes } from "@/lib/routes";
import { getPublicStorefront } from "@/lib/storefront";

export default async function Home() {
  const [products, storefront] = await Promise.all([
    getPublicProducts(),
    getPublicStorefront(),
  ]);
  const featuredProducts = products.slice(0, 4);
  const heroImage =
    storefront.heroImageUrl ??
    (products[0] ? getMainProductImage(products[0]) : "/products/soft-cotton-set.jpg");
  const productTypes = new Map<
    string,
    { name: string; slug: string; image: string }
  >();

  for (const product of products) {
    if (!productTypes.has(product.productType.slug)) {
      productTypes.set(product.productType.slug, {
        name: product.productType.name,
        slug: product.productType.slug,
        image: getMainProductImage(product),
      });
    }
  }

  const categoryTiles = [...productTypes.values()].slice(0, 4);
  const editorialProduct = products[1] ?? products[0];

  return (
    <PageShell>
      <StorefrontHero settings={storefront} imageUrl={heroImage} />

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-18 lg:px-12">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase text-[#9a8558]">Explore</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">Shop by category</h2>
          </div>
          <Link
            href={routes.catalog}
            className="shrink-0 border-b border-[#211d1b] pb-1 text-xs font-medium uppercase hover:text-[#b62568]"
          >
            View all
          </Link>
        </div>

        <HomeCategoryGrid categories={categoryTiles} />
      </section>

      <section className="border-y border-[#e7e1de] bg-[#f8edf2]">
        <div className="mx-auto grid max-w-[1440px] md:grid-cols-2">
          {editorialProduct && (
            <div className="relative min-h-[420px] md:min-h-[560px]">
              <Image
                src={getMainProductImage(editorialProduct)}
                alt={editorialProduct.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex min-h-[360px] items-center px-8 py-14 sm:px-12 lg:px-20">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase text-[#9a8558]">JuneRose</p>
              <h2 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">
                Comfort, selected with care.
              </h2>
              <p className="mt-5 text-sm leading-7 text-[#5f5854]">
                Thoughtful everyday pieces in colors, materials, and silhouettes made
                for living in.
              </p>
              <Link
                href={routes.catalog}
                className="mt-8 inline-flex min-h-12 items-center bg-[#211d1b] px-6 text-sm font-medium text-white transition-colors hover:bg-[#b62568]"
              >
                Discover the collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 sm:py-18 lg:px-12">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase text-[#9a8558]">Curated for you</p>
            <h2 className="font-display mt-2 text-3xl sm:text-4xl">Featured pieces</h2>
          </div>
          <Link
            href={routes.catalog}
            className="shrink-0 border-b border-[#211d1b] pb-1 text-xs font-medium uppercase hover:text-[#b62568]"
          >
            Shop all
          </Link>
        </div>

        <ProductGrid products={featuredProducts} />
      </section>
    </PageShell>
  );
}
