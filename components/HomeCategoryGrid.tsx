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

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`${routes.catalog}?type=${encodeURIComponent(category.slug)}`}
          className="group relative aspect-[4/5] overflow-hidden rounded-[4px] bg-[#f3f0ee]"
        >
          <Image
            src={category.image}
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-black/20" />
          <span className="font-display absolute inset-x-0 bottom-0 p-4 text-2xl text-white sm:p-5 sm:text-3xl">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
