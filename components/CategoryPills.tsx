import Link from "next/link";
import { routes } from "../lib/routes";
import type { ProductCategory } from "../types/product";

type CategoryPillsProps = {
  categories: ProductCategory[];
  activeCategory?: ProductCategory;
  showAll?: boolean;
};

export default function CategoryPills({
  categories,
  activeCategory,
  showAll = false,
}: CategoryPillsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {showAll && (
        <Link
          href={routes.catalog}
          className={`rounded-full border px-5 py-2 text-sm transition ${
            !activeCategory
              ? "border-[#2f241d] bg-[#2f241d] text-[#f8f3eb]"
              : "border-[#d6c4aa] text-[#2f241d] hover:border-[#9c7a4f] hover:text-[#9c7a4f]"
          }`}
        >
          All
        </Link>
      )}

      {categories.map((category) => (
        <Link
          key={category}
          href={routes.catalogByCategory(category)}
          className={`rounded-full border px-5 py-2 text-sm transition ${
            activeCategory === category
              ? "border-[#2f241d] bg-[#2f241d] text-[#f8f3eb]"
              : "border-[#d6c4aa] text-[#2f241d] hover:border-[#9c7a4f] hover:text-[#9c7a4f]"
          }`}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}