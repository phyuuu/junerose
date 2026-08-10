"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  CatalogFilterOptions,
  CatalogFilterState,
} from "@/lib/catalog-filters";
import { routes } from "@/lib/routes";

type FilterOption = { label: string; value: string };

type FilterGroupProps = {
  label: string;
  queryKey: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (queryKey: string, value: string) => void;
};

function FilterGroup({
  label,
  queryKey,
  options,
  selected,
  onToggle,
}: FilterGroupProps) {
  if (options.length === 0) return null;

  return (
    <details className="group relative border-b border-[#e7e1de] md:border-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-xs font-semibold uppercase md:min-h-0 md:justify-start">
        <span>
          {label}
          {selected.length > 0 && (
            <span className="ml-1 text-[#b62568]">({selected.length})</span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="text-base font-normal transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>

      <fieldset className="z-30 grid gap-3 bg-white pb-5 pt-2 md:absolute md:left-0 md:top-[calc(100%+14px)] md:min-w-60 md:border md:border-[#e7e1de] md:p-5 md:shadow-lg">
        <legend className="sr-only">{label}</legend>
        {options.map((option) => (
          <label
            key={option.value}
            className="flex min-h-8 cursor-pointer items-center gap-3 text-sm"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(queryKey, option.value)}
              className="size-4 accent-[#b62568]"
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
    </details>
  );
}

export default function CatalogFilters({
  options,
  selected,
  resultCount,
}: {
  options: CatalogFilterOptions;
  selected: CatalogFilterState;
  resultCount: number;
}) {
  const router = useRouter();
  const groups: Array<{
    label: string;
    queryKey: string;
    options: FilterOption[];
    selected: string[];
  }> = [
    {
      label: "Department",
      queryKey: "department",
      options: options.departments.map((item) => ({
        label: item.name,
        value: item.slug,
      })),
      selected: selected.departments,
    },
    {
      label: "Product type",
      queryKey: "type",
      options: options.productTypes.map((item) => ({
        label: item.name,
        value: item.slug,
      })),
      selected: selected.productTypes,
    },
    {
      label: "Material",
      queryKey: "material",
      options: options.materials.map((item) => ({
        label: item.name,
        value: item.slug,
      })),
      selected: selected.materials,
    },
    {
      label: "Color",
      queryKey: "color",
      options: options.colors.map((color) => ({ label: color, value: color })),
      selected: selected.colors,
    },
  ];

  function toggleValue(queryKey: string, value: string) {
    const valuesByKey: Record<string, string[]> = {
      department: selected.departments,
      type: selected.productTypes,
      material: selected.materials,
      color: selected.colors,
    };
    const values = valuesByKey[queryKey] ?? [];
    const nextValues = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
    const next = new URLSearchParams();

    for (const [key, currentValues] of Object.entries(valuesByKey)) {
      const valuesToAdd = key === queryKey ? nextValues : currentValues;
      for (const item of valuesToAdd) next.append(key, item);
    }

    router.replace(`${routes.catalog}${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
    });
  }

  const activeFilters = groups.flatMap((group) =>
    group.selected.map((value) => ({
      group: group.queryKey,
      value,
      label: group.options.find((option) => option.value === value)?.label ?? value,
    })),
  );

  return (
    <div>
      <div className="border-y border-[#e7e1de] py-4 md:flex md:min-h-16 md:items-center md:justify-between md:gap-8">
        <div className="grid md:flex md:items-center md:gap-8">
          {groups.map((group) => (
            <FilterGroup
              key={group.queryKey}
              label={group.label}
              queryKey={group.queryKey}
              options={group.options}
              selected={group.selected}
              onToggle={toggleValue}
            />
          ))}
        </div>
        <p className="pt-4 text-xs uppercase text-[#6f6864] md:shrink-0 md:pt-0">
          {resultCount} {resultCount === 1 ? "piece" : "pieces"}
        </p>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-[#e7e1de] py-4">
          {activeFilters.map((filter) => (
            <button
              key={`${filter.group}-${filter.value}`}
              type="button"
              onClick={() => toggleValue(filter.group, filter.value)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#f8edf2] px-3 text-xs text-[#8f1f58] hover:bg-[#f2dce6]"
              aria-label={`Remove ${filter.label} filter`}
            >
              {filter.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <Link
            href={routes.catalog}
            className="ml-1 border-b border-[#211d1b] pb-1 text-xs font-medium uppercase hover:text-[#b62568]"
          >
            Clear all
          </Link>
        </div>
      )}
    </div>
  );
}
