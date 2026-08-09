"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CatalogFilterOptions, CatalogFilterState } from "@/lib/catalog-filters";
import { routes } from "@/lib/routes";

type FilterGroupProps = {
  label: string;
  queryKey: string;
  options: { label: string; value: string }[];
  selected: string[];
  onToggle: (queryKey: string, value: string) => void;
};

function FilterGroup({ label, queryKey, options, selected, onToggle }: FilterGroupProps) {
  if (options.length === 0) return null;

  return (
    <fieldset className="min-w-[150px]">
      <legend className="text-xs font-semibold uppercase text-[#6f6258]">{label}</legend>
      <div className="mt-3 grid gap-2">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => onToggle(queryKey, option.value)}
              className="h-4 w-4 accent-[#2f241d]"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function CatalogFilters({
  options,
  selected,
}: {
  options: CatalogFilterOptions;
  selected: CatalogFilterState;
}) {
  const router = useRouter();
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

  const hasFilters = Object.values(selected).some((values) => values.length > 0);

  return (
    <div className="border-y border-[#d6c4aa] py-5">
      <div className="flex flex-wrap gap-x-10 gap-y-6">
        <FilterGroup label="Department" queryKey="department" options={options.departments.map((item) => ({ label: item.name, value: item.slug }))} selected={selected.departments} onToggle={toggleValue} />
        <FilterGroup label="Product type" queryKey="type" options={options.productTypes.map((item) => ({ label: item.name, value: item.slug }))} selected={selected.productTypes} onToggle={toggleValue} />
        <FilterGroup label="Material" queryKey="material" options={options.materials.map((item) => ({ label: item.name, value: item.slug }))} selected={selected.materials} onToggle={toggleValue} />
        <FilterGroup label="Color" queryKey="color" options={options.colors.map((color) => ({ label: color, value: color }))} selected={selected.colors} onToggle={toggleValue} />
      </div>
      {hasFilters && <Link href={routes.catalog} className="mt-5 inline-block text-sm text-[#9c7a4f] hover:underline">Clear filters</Link>}
    </div>
  );
}
