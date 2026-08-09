"use client";

import { useActionState, useState } from "react";
import { createProductAction } from "@/app/admin/products/actions";
import AdminProductSaveButton from "@/components/AdminProductSaveButton";
import type { UpdateProductInfoState } from "@/types/admin-product-action";
import type { AdminProductOptions } from "@/lib/admin-product-options";

type ProductFormValues = {
  code: string;
  slug: string;
  name: string;
  description: string;
  priceMMK: string;
  departmentId: string;
  productTypeId: string;
  availability: string;
};

const initialState: UpdateProductInfoState = {};

const inputClassName =
  "mt-2 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm";

export default function AdminProductCreateForm({
  options,
}: {
  options: AdminProductOptions;
}) {
  const [state, formAction] = useActionState(
    createProductAction,
    initialState,
  );

  const [productValues, setProductValues] =
    useState<ProductFormValues>({
      code: "",
      slug: "",
      name: "",
      description: "",
      priceMMK: "",
      departmentId: String(options.departments[0]?.id ?? ""),
      productTypeId: String(options.productTypes[0]?.id ?? ""),
      availability: "Available",
    });

  function updateProductValue<
    Field extends keyof ProductFormValues,
  >(field: Field, value: ProductFormValues[Field]) {
    setProductValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <form
      action={formAction}
      className="mt-8 rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6"
    >
      <div className="grid gap-5">
        <div>
          <h2 className="text-lg font-semibold">
            Product information
          </h2>

          <p className="mt-1 text-sm text-[#6f6258]">
            Save the product first. Variants and inventory are added after this product exists.
          </p>
        </div>

        {state.formError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.formError}
          </p>
        )}

        <div>
          <label htmlFor="code" className="text-sm font-medium">
            Product code
          </label>

          <input
            id="code"
            name="code"
            type="text"
            value={productValues.code}
            onChange={(event) =>
              updateProductValue("code", event.target.value)
            }
            className={inputClassName}
          />

          {state.fieldErrors?.code && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.code[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="slug" className="text-sm font-medium">
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            value={productValues.slug}
            onChange={(event) =>
              updateProductValue("slug", event.target.value)
            }
            className={inputClassName}
          />

          <p className="mt-1 text-xs text-[#8a7a6d]">
            Used in the product URL. Example: soft-cotton-set
          </p>

          {state.fieldErrors?.slug && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.slug[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={productValues.name}
            onChange={(event) =>
              updateProductValue("name", event.target.value)
            }
            className={inputClassName}
          />

          {state.fieldErrors?.name && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.name[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            rows={4}
            value={productValues.description}
            onChange={(event) =>
              updateProductValue("description", event.target.value)
            }
            className={inputClassName}
          />

          {state.fieldErrors?.description && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.description[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="priceMMK" className="text-sm font-medium">
            Price (MMK)
          </label>

          <input
            id="priceMMK"
            name="priceMMK"
            type="number"
            min="0"
            step="1"
            value={productValues.priceMMK}
            onChange={(event) =>
              updateProductValue("priceMMK", event.target.value)
            }
            className={inputClassName}
          />

          {state.fieldErrors?.priceMMK && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.priceMMK[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="departmentId" className="text-sm font-medium">
            Department
          </label>

          <select
            id="departmentId"
            name="departmentId"
            value={productValues.departmentId}
            onChange={(event) =>
              updateProductValue("departmentId", event.target.value)
            }
            className={inputClassName}
          >
            {options.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          {state.fieldErrors?.departmentId && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.departmentId[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="productTypeId" className="text-sm font-medium">
            Product type
          </label>

          <select
            id="productTypeId"
            name="productTypeId"
            value={productValues.productTypeId}
            onChange={(event) =>
              updateProductValue("productTypeId", event.target.value)
            }
            className={inputClassName}
          >
            {options.productTypes.map((productType) => (
              <option key={productType.id} value={productType.id}>
                {productType.name}
              </option>
            ))}
          </select>

          {state.fieldErrors?.productTypeId && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.productTypeId[0]}
            </p>
          )}
        </div>

        <fieldset>
          <legend className="text-sm font-medium">Materials</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {options.materials.map((material) => (
              <label key={material.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="materialIds" value={material.id} />
                {material.name}
              </label>
            ))}
          </div>
          {options.materials.length === 0 && (
            <p className="mt-2 text-sm text-[#8a7a6d]">
              Add reusable materials before assigning them to products.
            </p>
          )}
          {state.fieldErrors?.materialIds && (
            <p className="mt-1 text-sm text-red-600">
              {state.fieldErrors.materialIds[0]}
            </p>
          )}
        </fieldset>

        <div>
          <label htmlFor="availability" className="text-sm font-medium">
            Availability
          </label>

          <select
            id="availability"
            name="availability"
            value={productValues.availability}
            onChange={(event) =>
              updateProductValue("availability", event.target.value)
            }
            className={inputClassName}
          >
            <option value="Available">Available</option>
            <option value="Low stock">Low stock</option>
            <option value="Ask staff">Ask staff</option>
          </select>
        </div>

        <AdminProductSaveButton
          idleLabel="Save product"
          pendingLabel="Saving product..."
        />
      </div>
    </form>
  );
}
