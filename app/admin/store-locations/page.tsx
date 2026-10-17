import {
  createStoreLocationAction,
  toggleStoreLocationActiveAction,
  updateStoreLocationAction,
} from "@/app/admin/store-locations/actions";
import AdminShell from "@/components/AdminShell";
import AdminStoreLocationStatusForm from "@/components/AdminStoreLocationStatusForm";
import SectionHeader from "@/components/SectionHeader";
import { requireStaff } from "@/lib/auth/require-staff";
import { createClient } from "@/lib/supabase/server";

type StoreLocationRow = {
  id: number;
  name: string;
  township: string;
  address: string;
  phone: string | null;
  opening_hours: string | null;
  map_url: string | null;
  is_active: boolean;
  display_order: number;
};

type AdminStoreLocationsPageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

const inputClassName =
  "min-h-11 rounded-[3px] border border-[#d8d2cf] bg-white px-3 py-2 text-sm outline-none focus:border-[#b62568]";

export default async function AdminStoreLocationsPage({
  searchParams,
}: AdminStoreLocationsPageProps) {
  await requireStaff();

  const [{ error: errorMessage, saved }, supabase] = await Promise.all([
    searchParams,
    createClient(),
  ]);
  const { data, error } = await supabase
    .from("store_locations")
    .select(
      "id, name, township, address, phone, opening_hours, map_url, is_active, display_order",
    )
    .order("display_order")
    .order("id");

  if (error) {
    throw new Error("Unable to load store locations.");
  }

  const locations = (data ?? []) as StoreLocationRow[];

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-10">
        <SectionHeader
          eyebrow="STAFF AREA"
          title="Store Locations"
          description="Manage the locations customers will eventually be able to select for pickup."
        />

        {saved && (
          <p className="mt-6 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {saved}
          </p>
        )}
        {errorMessage && (
          <p className="mt-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </p>
        )}

        <form
          action={createStoreLocationAction}
          className="mt-8 border border-[#dfe2e5] bg-white p-5"
        >
          <div>
            <h2 className="text-lg font-semibold">Add store</h2>
            <p className="mt-1 text-sm text-[#6c6764]">
              Required information is marked below. Contact details and map links can be added later.
            </p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Store name
              <input name="name" required maxLength={120} className={inputClassName} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Township
              <input name="township" required maxLength={120} className={inputClassName} />
            </label>
            <label className="grid gap-2 text-sm font-medium md:col-span-2">
              Full address
              <textarea
                name="address"
                required
                maxLength={500}
                rows={3}
                className={`${inputClassName} resize-y`}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Phone <span className="font-normal text-[#6c6764]">Optional</span>
              <input name="phone" inputMode="tel" maxLength={30} className={inputClassName} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Display order
              <input name="displayOrder" type="number" min="0" step="1" defaultValue="0" className={inputClassName} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Opening hours <span className="font-normal text-[#6c6764]">Optional</span>
              <textarea name="openingHours" maxLength={300} rows={3} className={`${inputClassName} resize-y`} />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Google Maps link <span className="font-normal text-[#6c6764]">Optional</span>
              <input name="mapUrl" type="url" placeholder="https://..." maxLength={500} className={inputClassName} />
            </label>
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm">
            <input name="isActive" type="checkbox" defaultChecked />
            Active store
          </label>

          <button
            type="submit"
            className="mt-5 min-h-11 rounded-[3px] bg-[#211d1b] px-5 text-sm font-semibold text-white hover:bg-[#b62568]"
          >
            Save store
          </button>
        </form>

        <div className="mt-8 grid gap-5">
          {locations.length === 0 ? (
            <p className="border border-[#dfe2e5] bg-white px-5 py-8 text-sm text-[#6c6764]">
              No store locations have been added yet.
            </p>
          ) : (
            locations.map((location) => (
              <section key={location.id} className="border border-[#dfe2e5] bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-semibold">{location.name}</h2>
                      <span className={`text-xs font-medium uppercase ${location.is_active ? "text-green-700" : "text-[#6c6764]"}`}>
                        {location.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[#6c6764]">{location.township}</p>
                  </div>
                  <AdminStoreLocationStatusForm
                    action={toggleStoreLocationActiveAction}
                    storeLocationId={location.id}
                    storeName={location.name}
                    nextIsActive={!location.is_active}
                  />
                </div>

                <form action={updateStoreLocationAction} className="mt-5 grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="storeLocationId" value={location.id} />
                  <label className="grid gap-2 text-sm font-medium">
                    Store name
                    <input name="name" required maxLength={120} defaultValue={location.name} className={inputClassName} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Township
                    <input name="township" required maxLength={120} defaultValue={location.township} className={inputClassName} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium md:col-span-2">
                    Full address
                    <textarea name="address" required maxLength={500} rows={3} defaultValue={location.address} className={`${inputClassName} resize-y`} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Phone <span className="font-normal text-[#6c6764]">Optional</span>
                    <input name="phone" inputMode="tel" maxLength={30} defaultValue={location.phone ?? ""} className={inputClassName} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Display order
                    <input name="displayOrder" type="number" min="0" step="1" defaultValue={location.display_order} className={inputClassName} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Opening hours <span className="font-normal text-[#6c6764]">Optional</span>
                    <textarea name="openingHours" maxLength={300} rows={3} defaultValue={location.opening_hours ?? ""} className={`${inputClassName} resize-y`} />
                  </label>
                  <label className="grid gap-2 text-sm font-medium">
                    Google Maps link <span className="font-normal text-[#6c6764]">Optional</span>
                    <input name="mapUrl" type="url" maxLength={500} defaultValue={location.map_url ?? ""} className={inputClassName} />
                  </label>
                  <label className="flex items-center gap-3 text-sm md:col-span-2">
                    <input name="isActive" type="checkbox" defaultChecked={location.is_active} />
                    Active store
                  </label>
                  <button type="submit" className="min-h-11 w-fit rounded-[3px] bg-[#211d1b] px-5 text-sm font-semibold text-white hover:bg-[#b62568]">
                    Save changes
                  </button>
                </form>
              </section>
            ))
          )}
        </div>
      </section>
    </AdminShell>
  );
}
