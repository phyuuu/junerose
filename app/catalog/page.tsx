import CatalogFilters from "@/components/CatalogFilters";
import PageShell from "../../components/PageShell";
import ProductGrid from "../../components/ProductGrid";
import SectionHeader from "../../components/SectionHeader";
import { filterCatalogProducts, getCatalogFilterOptions } from "@/lib/catalog-filters";
import { getPublicProducts } from "../../lib/products";

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
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          title="Catalog"
          description="Browse JuneRose products and send an order request when you are ready."
        />

        <div className="mt-6"><CatalogFilters options={options} selected={selected} /></div>

        <div className="mt-8">
          <ProductGrid products={products} selectedColors={selected.colors} />
        </div>
      </section>
    </PageShell>
  );
}
