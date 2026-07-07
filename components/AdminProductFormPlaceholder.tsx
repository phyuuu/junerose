export default function AdminProductFormPlaceholder() {
  return (
    <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#3f342b]">
          Add product
        </h2>
        <p className="mt-1 text-sm text-[#8a7a6d]">
          This form is a UI placeholder. Real saving will be added after database,
          image storage, and admin authentication are connected.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">
            Product code
          </span>
          <input
            disabled
            placeholder="Example: JR-W001 or A-927-BLACK"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">
            Product name
          </span>
          <input
            disabled
            placeholder="Soft Cotton Set"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">
            Price MMK
          </span>
          <input
            disabled
            type="number"
            placeholder="18000"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">
            Stock quantity
          </span>
          <input
            disabled
            type="number"
            placeholder="20"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-[#6f6258]">
            Product images
          </span>
          <input
            disabled
            type="file"
            multiple
            accept="image/*"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
          <p className="mt-1 text-xs text-[#8a7a6d]">
            Later, staff can upload one or more images from this field.
          </p>
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-[#6f6258]">
            Description
          </span>
          <textarea
            disabled
            placeholder="Product description..."
            rows={3}
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          disabled
          className="rounded-full bg-[#c8ad86] px-5 py-2.5 text-sm font-medium text-white"
        >
          Save product later
        </button>
      </div>
    </div>
  );
}