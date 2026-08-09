"use client";

import { useActionState } from "react";
import { updateProductInfoAction } from "@/app/admin/products/actions";
import AdminProductSaveButton from "@/components/AdminProductSaveButton";
import type { UpdateProductInfoState } from "@/types/admin-product-action";
import type { InternalProduct } from "@/types/product";
import type { AdminProductOptions } from "@/lib/admin-product-options";

type AdminProductInfoFormProps = {
  product: InternalProduct;
  options: AdminProductOptions;
};

const initialState: UpdateProductInfoState = {};

const inputClassName =
  "rounded-xl border border-[#d6c4aa] bg-[#fbf7f0] px-3 py-2 text-sm text-[#3f342b] outline-none focus:border-[#9c7a4f]";

const errorClassName = "text-xs text-red-700";

export default function AdminProductInfoForm({
  product,
  options,
}: AdminProductInfoFormProps) {
  const [state, formAction] = useActionState(
    updateProductInfoAction,
    initialState,
  );

  return (
    <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
      <h2 className="text-lg font-semibold">Product information</h2>

      <form action={formAction} noValidate className="mt-5 grid gap-5">
        <input type="hidden" name="productId" value={product.id} />
        {product.materials
          .filter(
            (selected) =>
              !options.materials.some((material) => material.id === selected.id),
          )
          .map((material) => (
            <input
              key={material.id}
              type="hidden"
              name="materialIds"
              value={material.id}
            />
          ))}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Product name
            <input
              name="name"
              type="text"
              required
              maxLength={120}
              defaultValue={product.name}
              aria-invalid={Boolean(state.fieldErrors?.name)}
              className={inputClassName}
            />

            {state.fieldErrors?.name?.map((error) => (
              <span key={error} className={errorClassName}>
                {error}
              </span>
            ))}
          </label>

          <label className="grid gap-1 text-sm">
            Product code
            <input
              type="text"
              value={product.code}
              readOnly
              className={`${inputClassName} cursor-not-allowed opacity-70`}
            />
          </label>

          <label className="grid gap-1 text-sm">
            Slug
            <input
              type="text"
              value={product.slug}
              readOnly
              className={`${inputClassName} cursor-not-allowed opacity-70`}
            />
          </label>

          <label className="grid gap-1 text-sm">
            Department
            <select
              name="departmentId"
              defaultValue={product.department.id}
              aria-invalid={Boolean(state.fieldErrors?.departmentId)}
              className={inputClassName}
            >
              {options.departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            {state.fieldErrors?.departmentId?.map((error) => (
              <span key={error} className={errorClassName}>
                {error}
              </span>
            ))}
          </label>

          <label className="grid gap-1 text-sm">
            Product type
            <select
              name="productTypeId"
              defaultValue={product.productType.id}
              aria-invalid={Boolean(state.fieldErrors?.productTypeId)}
              className={inputClassName}
            >
              {options.productTypes.map((productType) => (
                <option key={productType.id} value={productType.id}>
                  {productType.name}
                </option>
              ))}
            </select>

            {state.fieldErrors?.productTypeId?.map((error) => (
              <span key={error} className={errorClassName}>
                {error}
              </span>
            ))}
          </label>

          <label className="grid gap-1 text-sm">
            Price (MMK)
            <input
              name="priceMMK"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={product.priceMMK}
              aria-invalid={Boolean(state.fieldErrors?.priceMMK)}
              className={inputClassName}
            />

            {state.fieldErrors?.priceMMK?.map((error) => (
              <span key={error} className={errorClassName}>
                {error}
              </span>
            ))}
          </label>

          <label className="grid gap-1 text-sm">
            Availability
            <select
              name="availability"
              defaultValue={product.availability}
              aria-invalid={Boolean(state.fieldErrors?.availability)}
              className={inputClassName}
            >
              <option value="Available">Available</option>
              <option value="Low stock">Low stock</option>
              <option value="Ask staff">Ask staff</option>
            </select>

            {state.fieldErrors?.availability?.map((error) => (
              <span key={error} className={errorClassName}>
                {error}
              </span>
            ))}
          </label>

        </div>

        <fieldset>
          <legend className="text-sm">Materials</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {options.materials.map((material) => (
              <label key={material.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="materialIds"
                  value={material.id}
                  defaultChecked={product.materials.some(
                    (selected) => selected.id === material.id,
                  )}
                />
                {material.name}
              </label>
            ))}
          </div>
          {state.fieldErrors?.materialIds?.map((error) => (
            <span key={error} className={errorClassName}>
              {error}
            </span>
          ))}
        </fieldset>

        <label className="grid gap-1 text-sm">
          Description
          <textarea
            name="description"
            required
            maxLength={2000}
            rows={5}
            defaultValue={product.description}
            aria-invalid={Boolean(state.fieldErrors?.description)}
            className={inputClassName}
          />

          {state.fieldErrors?.description?.map((error) => (
            <span key={error} className={errorClassName}>
              {error}
            </span>
          ))}
        </label>

        {state.formError && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.formError}
          </p>
        )}

        <AdminProductSaveButton />
      </form>
    </section>
  );
}
