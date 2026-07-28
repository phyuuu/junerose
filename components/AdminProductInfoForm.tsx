import type { InternalProduct } from "@/types/product";
import { updateProductInfoAction } from "@/app/admin/products/actions";
import AdminProductSaveButton from "@/components/AdminProductSaveButton";

type AdminProductInfoFormProps = {
  product: InternalProduct;
};

const inputClassName =
  "rounded-xl border border-[#d6c4aa] bg-[#fbf7f0] px-3 py-2 text-sm text-[#3f342b] outline-none focus:border-[#9c7a4f]";

export default function AdminProductInfoForm({
  product,
}: AdminProductInfoFormProps) {
  return (
    <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
      <h2 className="text-lg font-semibold">Product information</h2>

      <form action={updateProductInfoAction} className="mt-5 grid gap-5">
        <input type="hidden" name="productId" value={product.id} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Product name
            <input
              name="name"
              type="text"
              required
              maxLength={120}
              defaultValue={product.name}
              className={inputClassName}
            />
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
            Category
            <select
              name="category"
              defaultValue={product.category}
              className={inputClassName}
            >
              <option value="Women">Women</option>
              <option value="Men">Men</option>
              <option value="Pajamas">Pajamas</option>
              <option value="Swimwear">Swimwear</option>
            </select>
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
              className={inputClassName}
            />
          </label>

          <label className="grid gap-1 text-sm">
            Availability
            <select
              name="availability"
              defaultValue={product.availability}
              className={inputClassName}
            >
              <option value="Available">Available</option>
              <option value="Low stock">Low stock</option>
              <option value="Ask staff">Ask staff</option>
            </select>
          </label>

          <label className="flex items-center gap-3 self-end rounded-xl border border-[#d6c4aa] px-3 py-2 text-sm">
            <input
              name="isVisible"
              type="checkbox"
              defaultChecked={product.isVisible}
              className="h-4 w-4"
            />
            Visible to customers
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          Description
          <textarea
            name="description"
            required
            maxLength={2000}
            rows={5}
            defaultValue={product.description}
            className={inputClassName}
          />
        </label>

        <AdminProductSaveButton />
      </form>
    </section>
  );
}