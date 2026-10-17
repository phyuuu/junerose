import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";

type HomeCategory = {
  name: string;
  slug: string;
  image: string;
};

export default function HomeCategoryGrid({ categories }: { categories: HomeCategory[] }) {
  if (categories.length === 0) {
    return (
      <div className="border border-[#e7e1de] px-5 py-10 text-sm text-[#6f6864]">
        Categories will appear when products are published.
      </div>
    );
  }

  const visibleCategories = categories.slice(0, 3);
  const categoryCount = visibleCategories.length;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-12 md:grid-rows-2 md:gap-5">
      {visibleCategories.map((category, index) => {
        const layoutClass =
          categoryCount === 1
            ? "col-span-2 aspect-[16/10] md:col-span-12 md:row-span-2 md:aspect-[16/7] md:min-h-[520px]"
            : categoryCount === 2
              ? "col-span-1 aspect-[4/5] md:col-span-6 md:row-span-2 md:aspect-auto md:min-h-[620px]"
              : index === 0
                ? "col-span-2 aspect-[4/5] md:col-span-7 md:row-span-2 md:aspect-auto md:min-h-[680px]"
                : "col-span-1 aspect-[4/5] md:col-span-5 md:min-h-[330px] md:aspect-auto";
        const imageSizes =
          categoryCount === 1
            ? "100vw"
            : categoryCount === 2
              ? "(min-width: 768px) 50vw, 50vw"
              : index === 0
                ? "(min-width: 768px) 58vw, 100vw"
                : "(min-width: 768px) 42vw, 50vw";

        return (
          <Link
            key={category.slug}
            href={`${routes.catalog}?type=${encodeURIComponent(category.slug)}`}
            className={`group relative overflow-hidden bg-[#f3f0ee] ${layoutClass}`}
          >
            <Image
              src={category.image}
              alt=""
              fill
              sizes={imageSizes}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/15" />
            <span className="absolute inset-x-0 bottom-0 p-4 text-xs font-medium uppercase text-white sm:p-5">
              {category.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
