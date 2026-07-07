import ProductCard from "./ProductCard";
import type { PublicProduct } from "../types/product";

type ProductGridProps = {
  products: PublicProduct[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
        <p className="text-sm text-[#8a7a6d]">
          No products are available in this section yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}