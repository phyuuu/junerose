import type { InternalProduct } from "@/types/product";

type AdminProductInfoFormProps = {
  product: InternalProduct;
};

const inputClassName =
  "rounded-xl border border-[#d6c4aa] bg-[#fbf7f0] px-3 py-2 text-sm text-[#3f342b] outline-none";

export default function AdminProductInfoForm({
  product,
}: AdminProductInfoFormProps) {
  return (
    <section className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-5">
      <h2 className="text-lg font-semibold">Product information</h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Product name
          <input
            defaultValue={product.name}
            className={inputClassName}
          />
        </label>

        <label className="grid gap-1 text-sm">
          Product code
          <input
            value={product.code}
            readOnly
            className={inputClassName}
          />
        </label>

        <label className="grid gap-1 text-sm">
          Category
          <input
            defaultValue={product.category}
            className={inputClassName}
          />
        </label>

        <label className="grid gap-1 text-sm">
          Price (MMK)
          <input
            defaultValue={product.priceMMK}
            className={inputClassName}
          />
        </label>
      </div>
    </section>
  );
}