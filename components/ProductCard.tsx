import Image from "next/image";
import Link from "next/link";
import { routes } from "../lib/routes";
import type { PublicProduct } from "../types/product";
import { formatMMK } from "../lib/formatPrice";
import { getProductImageForColor } from "@/lib/product-image";
import { getPreferredProductColor } from "@/lib/catalog-filters";
import { getColorSwatchHex } from "@/lib/color-swatch";

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
  const showAvailability = product.availability !== "Available";
  const availableColors = [
    ...new Set(
      product.variants
        .filter((variant) => variant.isAvailable)
        .map((variant) => variant.color),
    ),
  ];

  return (
    <Link href={routes.productDetail(product.slug, preferredColor)} className="group block min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[4px] bg-[#f3f0ee]">
        <Image
          src={getProductImageForColor(product, preferredColor)}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 25vw, 50vw"
          loading={eagerImage ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>

      <div className="mt-3">
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="mt-1 text-sm text-[#6f6864]">
          {formatMMK(product.priceMMK)}
        </p>

        {availableColors.length > 0 && (
          <div
            className="mt-3 flex min-h-4 items-center gap-1.5"
            aria-label={`Available colors: ${availableColors.join(", ")}`}
          >
            {availableColors.slice(0, 5).map((color) => (
              <span
                key={color}
                title={color}
                className={`size-3 rounded-full border ${
                  preferredColor?.toLowerCase() === color.toLowerCase()
                    ? "border-[#b62568] ring-1 ring-[#b62568] ring-offset-1"
                    : "border-black/15"
                }`}
                style={{ backgroundColor: getColorSwatchHex(color) }}
              />
            ))}
            {availableColors.length > 5 && (
              <span className="ml-1 text-[11px] text-[#6f6864]">
                +{availableColors.length - 5}
              </span>
            )}
          </div>
        )}

        {showAvailability && (
          <p className="mt-2 text-xs text-[#b62568]">{product.availability}</p>
        )}
      </div>
    </Link>
  );
}
