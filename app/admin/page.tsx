import Link from "next/link";
import AdminShell from "../../components/AdminShell";
import { routes } from "../../lib/routes";
import { requireStaff } from "@/lib/auth/require-staff";

export default async function AdminPage() {
  const staff = await requireStaff();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-6xl px-5 py-6">
        <p className="text-sm tracking-[0.25em] text-[#9c7a4f]">
          STAFF AREA
        </p>

        <h1 className="mt-3 text-2xl font-semibold">Staff Dashboard</h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[#6f6258]">
          Manage JuneRose products, order requests, and inventory records.
          This area is protected by staff login.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href={routes.adminOrders}
            className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6 hover:border-[#9c7a4f]"
          >
            <h2 className="text-lg font-medium">
              Orders
            </h2>

            <p className="mt-2 text-sm text-[#8a7a6d]">
              View and manage customer order requests.
            </p>
          </Link>

          <Link
            href={routes.adminProducts}
            className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6 hover:border-[#9c7a4f]"
          >
            <h2 className="text-lg font-medium">
              Products
            </h2>

            <p className="mt-2 text-sm text-[#8a7a6d]">
              Add, edit, hide, and organize product listings.
            </p>
          </Link>

          <Link
            href={routes.adminInventoryHistory}
            className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6 hover:border-[#9c7a4f]"
          >
            <h2 className="text-lg font-medium">
              Inventory History
            </h2>

            <p className="mt-2 text-sm text-[#8a7a6d]">
              Review all stock adjustments made by staff.
            </p>
          </Link>

          <Link
            href={routes.adminDataRetention}
            className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6 hover:border-[#9c7a4f]"
          >
            <h2 className="text-lg font-medium">Data Retention</h2>

            <p className="mt-2 text-sm text-[#8a7a6d]">
              Review retention and process verified privacy requests.
            </p>
          </Link>

          <Link
            href={routes.adminStorefront}
            className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6 hover:border-[#9c7a4f]"
          >
            <h2 className="text-lg font-medium">Storefront</h2>

            <p className="mt-2 text-sm text-[#8a7a6d]">
              Update the homepage hero image and public text.
            </p>
          </Link>

          {staff.role === "admin" && (
            <Link
              href={routes.adminStaff}
              className="rounded-2xl border border-[#d6c4aa] bg-[#fbf7f0] p-6 hover:border-[#9c7a4f]"
            >
              <h2 className="text-lg font-medium">Staff Access</h2>

              <p className="mt-2 text-sm text-[#8a7a6d]">
                Add, deactivate, and review authorized staff accounts.
              </p>
            </Link>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
