export default function AdminProductFormPlaceholder() {
  return (
    <div className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6">
      <div>
        <h2 className="text-lg font-semibold text-[#3f342b]">
          Add product
        </h2>
        <p className="mt-1 text-sm text-[#8a7a6d]">
          This form is a UI placeholder. Real saving will be added after
          database, image storage, and admin authentication are connected.
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
          <span className="text-sm font-medium text-[#6f6258]">Slug</span>
          <input
            disabled
            placeholder="soft-cotton-set"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">Category</span>
          <select
            disabled
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          >
            <option>Women</option>
            <option>Men</option>
            <option>Pajamas</option>
            <option>Swimwear</option>
          </select>
        </label>

        <div className="block">
      <span className="text-sm font-medium text-[#6f6258]">
        Stock by size and color
      </span>

      <div className="mt-1 overflow-hidden rounded-xl border border-[#d6c4aa] bg-white">
        <div className="grid grid-cols-3 bg-[#eadfce] px-3 py-2 text-xs font-semibold text-[#6f6258]">
          <div>Size</div>
          <div>Color</div>
          <div>Quantity</div>
        </div>

        <div className="grid grid-cols-3 border-t border-[#d6c4aa] px-3 py-2 text-sm text-[#8a7a6d]">
          <div>S</div>
          <div>Ivory</div>
          <div>10</div>
        </div>

        <div className="grid grid-cols-3 border-t border-[#d6c4aa] px-3 py-2 text-sm text-[#8a7a6d]">
          <div>M</div>
          <div>Ivory</div>
          <div>20</div>
        </div>
      </div>

      <p className="mt-1 text-xs text-[#8a7a6d]">
        Later, staff can add multiple stock rows such as S / Ivory / 10 and
        M / Black / 20. Total stock will be calculated automatically from these rows.
      </p>
    </div>

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

        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">Sizes</span>
          <input
            disabled
            placeholder="S, M, L, XL"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">Colors</span>
          <input
            disabled
            placeholder="Ivory, Black, Rose"
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#6f6258]">
            Availability
          </span>
          <select
            disabled
            className="mt-1 w-full rounded-xl border border-[#d6c4aa] bg-white px-3 py-2 text-sm text-[#8a7a6d]"
          >
            <option>Available</option>
            <option>Low stock</option>
            <option>Ask staff</option>
          </select>
        </label>

        <label className="flex items-center gap-2 pt-7 text-sm text-[#6f6258]">
          <input disabled type="checkbox" defaultChecked />
          Visible to customers
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