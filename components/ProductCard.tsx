import Image from "next/image";
import Link from "next/link";
import { routes } from "../lib/routes";
import type { PublicProduct } from "../types/product";
import { formatMMK } from "../lib/formatPrice";
import { getProductImageForColor } from "@/lib/product-image";
import { getPreferredProductColor } from "@/lib/catalog-filters";

type ProductCardProps = {
  product: PublicProduct;
  eagerImage?: boolean;
  selectedColors?: string[];
};

export default function ProductCard({
  product,
  eagerImage = false,
  selectedColors = [],
}: ProductCardProps) {
  const preferredColor = getPreferredProductColor(product, selectedColors);
  return (
    <Link href={routes.productDetail(product.slug, preferredColor)} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#eadfce] transition group-hover:bg-[#e2d2bc]">
        <Image
          src={getProductImageForColor(product, preferredColor)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          loading={eagerImage ? "eager" : "lazy"}
          className="object-cover"
        />
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{product.name}</p>
          <p className="mt-1 text-sm text-[#8a7a6d]">
            {formatMMK(product.priceMMK)}
          </p>

          <p className="mt-1 text-xs text-[#9c7a4f]">
            {product.availability}
          </p>
        </div>

        <span className="text-lg leading-none text-[#9c7a4f] opacity-0 transition group-hover:opacity-100">
          +
        </span>
      </div>
    </Link>
  );
}
