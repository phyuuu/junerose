import ProductCard from "./ProductCard";
import type { PublicProduct } from "../types/product";

type ProductGridProps = {
  products: PublicProduct[];
  eagerImageCount?: number;
  selectedColors?: string[];
};

export default function ProductGrid({
  products,
  eagerImageCount = 4,
  selectedColors = [],
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-[4px] border border-[#e7e1de] bg-white p-6">
        <p className="text-sm text-[#6f6864]">
          No products are available in this section yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-5 lg:gap-x-6">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          eagerImage={index < eagerImageCount}
          selectedColors={selectedColors}
        />
      ))}
    </div>
  );
}
