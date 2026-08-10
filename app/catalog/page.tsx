import CatalogFilters from "@/components/CatalogFilters";
import PageShell from "@/components/PageShell";
import ProductGrid from "@/components/ProductGrid";
import {
  filterCatalogProducts,
  getCatalogFilterOptions,
} from "@/lib/catalog-filters";
import { getPublicProducts } from "@/lib/products";

type CatalogPageProps = {
  searchParams: Promise<{
    department?: string | string[];
    type?: string | string[];
    material?: string | string[];
    color?: string | string[];
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;
  const toArray = (value?: string | string[]) =>
    value ? (Array.isArray(value) ? value : [value]) : [];
  const selected = {
    departments: toArray(params.department),
    productTypes: toArray(params.type),
    materials: toArray(params.material),
    colors: toArray(params.color),
  };
  const allProducts = await getPublicProducts();
  const products = filterCatalogProducts(allProducts, selected);
  const options = getCatalogFilterOptions(allProducts);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase text-[#9a8558]">JuneRose</p>
          <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">
            The collection
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[#6f6864]">
            Everyday intimates, sleepwear, swimwear, and comfort pieces selected
            for thoughtful dressing.
          </p>
        </div>

        <div className="mt-10">
          <CatalogFilters
            options={options}
            selected={selected}
            resultCount={products.length}
          />
        </div>

        <div className="mt-9">
          <ProductGrid products={products} selectedColors={selected.colors} />
        </div>
      </section>
    </PageShell>
  );
}
