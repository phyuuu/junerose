import Link from "next/link";
import PageShell from "../components/PageShell";
import CategoryPills from "../components/CategoryPills";
import ProductGrid from "../components/ProductGrid";
import { productCategories } from "../data/categories";
import { getFeaturedProducts } from "../lib/products";
import { routes } from "../lib/routes";

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 pt-10">
        <p className="mb-3 text-sm tracking-[0.25em] text-[#9c7a4f]">
          BOUTIQUE CATALOG
        </p>

        <h2 className="max-w-xl text-4xl font-semibold leading-tight">
          Elegant everyday essentials
        </h2>

        <p className="mt-4 max-w-md text-sm leading-6 text-[#6f6258]">
          Underwear, pajamas, swimwear, and daily comfort pieces selected for
          simple, confident living.
        </p>

        <p className="mt-3 max-w-md text-xs leading-5 text-[#8a7a6d]">
          Browse items and send an order request. Our staff will confirm
          availability, total price, and pickup or delivery details.
        </p>

        <Link
          href={routes.catalog}
          className="mt-7 inline-block rounded-full bg-[#2f241d] px-6 py-3 text-sm text-[#f8f3eb] hover:bg-[#4a382c]"
        >
          Browse Collection
        </Link>

        <div className="mt-8">
          <CategoryPills categories={productCategories} />
        </div>

        <section className="mt-12 pb-14">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-medium">Featured Products</h3>

            <Link
              href={routes.catalog}
              className="text-sm text-[#9c7a4f] hover:underline"
            >
              View all
            </Link>
          </div>

          <ProductGrid products={featuredProducts} />
        </section>
      </section>
    </PageShell>
  );
}