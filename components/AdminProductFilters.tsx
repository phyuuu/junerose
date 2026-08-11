import Link from "next/link";
import type { AdminProductFilters as ProductFilters } from "@/lib/admin-product-filters";
import { routes } from "@/lib/routes";

type AdminProductFiltersProps = {
  filters: ProductFilters;
  resultCount: number;
  totalCount: number;
};

const controlClassName =
  "min-h-10 rounded-[4px] border border-[#cfd3d6] bg-white px-3 text-sm outline-none focus:border-[#b62568]";

export default function AdminProductFilters({
  filters,
  resultCount,
  totalCount,
}: AdminProductFiltersProps) {
  const hasFilters =
    Boolean(filters.search) ||
    filters.visibility !== "all" ||
    filters.stock !== "all";

  return (
    <form
      action={routes.adminProducts}
      method="get"
      className="border-y border-[#dfe2e5] bg-[#f7f8f8] px-4 py-4"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_190px_auto] md:items-end">
        <label htmlFor="product-search" className="grid gap-1.5 text-xs font-medium uppercase text-[#686360]">
          Search
          <input
            id="product-search"
            name="search"
            type="search"
            maxLength={100}
            defaultValue={filters.search}
            placeholder="Product name or code"
            className={controlClassName}
          />
        </label>

        <label htmlFor="product-visibility" className="grid gap-1.5 text-xs font-medium uppercase text-[#686360]">
          Visibility
          <select
            id="product-visibility"
            name="visibility"
            defaultValue={filters.visibility}
            className={controlClassName}
          >
            <option value="all">All visibility</option>
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>

        <label htmlFor="product-stock" className="grid gap-1.5 text-xs font-medium uppercase text-[#686360]">
          Variant stock
          <select
            id="product-stock"
            name="stock"
            defaultValue={filters.stock}
            className={controlClassName}
          >
            <option value="all">All stock states</option>
            <option value="needs_restock">Needs restock</option>
            <option value="sold_out">Fully sold out</option>
            <option value="healthy">Healthy stock</option>
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center justify-center rounded-[4px] bg-[#211f1e] px-4 text-sm font-medium text-white hover:bg-[#b62568]"
          >
            Apply
          </button>
          {hasFilters && (
            <Link
              href={routes.adminProducts}
              className="inline-flex min-h-10 items-center justify-center rounded-[4px] border border-[#cfd3d6] bg-white px-4 text-sm font-medium hover:border-[#9ea3a7]"
            >
              Reset
            </Link>
          )}
        </div>
      </div>

      <p className="mt-3 text-xs text-[#6c6764]">
        Showing {resultCount} of {totalCount} products. Needs restock means at
        least one size/color variant has 5 or fewer items.
      </p>
    </form>
  );
}
