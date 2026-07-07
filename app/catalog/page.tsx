import CategoryPills from "../../components/CategoryPills";
import PageShell from "../../components/PageShell";
import ProductGrid from "../../components/ProductGrid";
import SectionHeader from "../../components/SectionHeader";
import { productCategories } from "../../data/categories";
import { isProductCategory } from "../../lib/categories";
import {
  getPublicProducts,
  getPublicProductsByCategory,
} from "../../lib/products";

type CatalogPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const { category } = await searchParams;

  const activeCategory =
    category && isProductCategory(category) ? category : undefined;

  const products = activeCategory
    ? getPublicProductsByCategory(activeCategory)
    : getPublicProducts();

  const title = activeCategory ? activeCategory : "Catalog";

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <SectionHeader
          title={title}
          description="Browse JuneRose products and send an order request when you are ready."
        />

        <div className="mt-6">
          <CategoryPills
            categories={productCategories}
            activeCategory={activeCategory}
            showAll
          />
        </div>

        <div className="mt-8">
          <ProductGrid products={products} />
        </div>
      </section>
    </PageShell>
  );
}