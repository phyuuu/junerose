import Link from "next/link";
import AdminShell from "../../components/AdminShell";
import AdminSummaryCard from "@/components/AdminSummaryCard";
import { getAdminOperationalSummary } from "@/lib/admin-overview";
import { routes } from "../../lib/routes";
import { requireStaff } from "@/lib/auth/require-staff";

export default async function AdminPage() {
  const staff = await requireStaff();
  const summary = await getAdminOperationalSummary();

  return (
    <AdminShell showSignOut>
      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        <div className="flex flex-col gap-4 border-b border-[#dfe2e5] pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-[#8a8582]">
              Operations
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Overview</h1>
            <p className="mt-2 text-sm text-[#6c6764]">
              Products, orders, inventory, and storefront management.
            </p>
          </div>
          <span className="w-fit rounded-full border border-[#d7dadd] bg-white px-3 py-1 text-xs font-medium uppercase text-[#5f5a57]">
            {staff.role}
          </span>
        </div>

        <div className="mt-8">
          <div className="flex items-end justify-between border-b border-[#dfe2e5] pb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase">Action required</h2>
              <p className="mt-1 text-xs text-[#6c6764]">
                Live counts from orders and size/color inventory.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <AdminSummaryCard
              label="Pending orders"
              value={summary.pendingOrderCount}
              href={`${routes.adminOrders}?status=pending`}
            />
            <AdminSummaryCard
              label="Ready orders"
              value={summary.readyOrderCount}
              href={`${routes.adminOrders}?status=ready`}
            />
            <AdminSummaryCard
              label="Needs restock"
              value={summary.needsRestockProductCount}
              href={`${routes.adminProducts}?stock=needs_restock`}
            />
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Link
            href={routes.adminOrders}
            className="group rounded-[6px] border border-[#d7dadd] bg-white p-6 transition-colors hover:border-[#b62568]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#8a8582]">
                  Customer workflow
                </p>
                <h2 className="mt-2 text-xl font-semibold">Orders</h2>
                <p className="mt-2 text-sm text-[#6c6764]">
                  Review requests and update fulfilment status.
                </p>
              </div>
              <span className="text-xl text-[#8a8582] group-hover:text-[#b62568]">
                →
              </span>
            </div>
          </Link>

          <Link
            href={routes.adminProducts}
            className="group rounded-[6px] border border-[#d7dadd] bg-white p-6 transition-colors hover:border-[#b62568]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase text-[#8a8582]">
                  Catalog workflow
                </p>
                <h2 className="mt-2 text-xl font-semibold">Products</h2>
                <p className="mt-2 text-sm text-[#6c6764]">
                  Maintain listings, variants, images, and stock.
                </p>
              </div>
              <span className="text-xl text-[#8a8582] group-hover:text-[#b62568]">
                →
              </span>
            </div>
          </Link>
        </div>

        <div className="mt-10">
          <div className="flex items-end justify-between border-b border-[#dfe2e5] pb-3">
            <h2 className="text-sm font-semibold uppercase">Management</h2>
          </div>
          <div className="divide-y divide-[#dfe2e5]">
          <Link
            href={routes.adminInventoryHistory}
            className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4"
          >
            <div>
              <h3 className="font-medium">Inventory history</h3>
              <p className="mt-1 text-sm text-[#6c6764]">
                Stock adjustments and staff attribution
              </p>
            </div>
            <span className="text-[#8a8582] group-hover:text-[#b62568]">→</span>
          </Link>

          <Link
            href={routes.adminStorefront}
            className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4"
          >
            <div>
              <h3 className="font-medium">Storefront</h3>
              <p className="mt-1 text-sm text-[#6c6764]">
                Homepage image and public text
              </p>
            </div>
            <span className="text-[#8a8582] group-hover:text-[#b62568]">→</span>
          </Link>

          <Link
            href={routes.adminDataRetention}
            className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4"
          >
            <div>
              <h3 className="font-medium">Data retention</h3>
              <p className="mt-1 text-sm text-[#6c6764]">
                Verified customer privacy requests
              </p>
            </div>
            <span className="text-[#8a8582] group-hover:text-[#b62568]">→</span>
          </Link>

          {staff.role === "admin" && (
            <Link
              href={routes.adminStaff}
              className="group grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4"
            >
              <div>
                <h3 className="font-medium">Staff access</h3>
                <p className="mt-1 text-sm text-[#6c6764]">
                  Authorized accounts and roles
                </p>
              </div>
              <span className="text-[#8a8582] group-hover:text-[#b62568]">→</span>
            </Link>
          )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
