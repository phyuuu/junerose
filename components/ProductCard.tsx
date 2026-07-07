import Image from "next/image";
import Link from "next/link";
import { routes } from "../lib/routes";
import type { PublicProduct } from "../types/product";
import { formatMMK } from "../lib/formatPrice";
import { getMainProductImage } from "@/lib/product-image";

type ProductCardProps = {
  product: PublicProduct;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={routes.productDetail(product.slug)} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#eadfce] transition group-hover:bg-[#e2d2bc]">
        <Image
          src={getMainProductImage(product)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
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