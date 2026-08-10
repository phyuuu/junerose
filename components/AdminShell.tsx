import Link from "next/link";
import type { ReactNode } from "react";
import AdminSignOutButton from "@/components/AdminSignOutButton";
import { requireStaff } from "@/lib/auth/require-staff";
import { routes } from "../lib/routes";

type AdminShellProps = {
  children: ReactNode;
  showSignOut?: boolean;
};

export default async function AdminShell({
  children,
  showSignOut = false,
}: AdminShellProps) {
  const staff = showSignOut ? await requireStaff() : null;

  return (
    <div className="min-h-screen bg-[#f8f3eb] text-[#2f241d]">
      <a className="skip-link" href="#admin-main-content">
        Skip to admin content
      </a>
      <header className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href={routes.admin} className="text-xl font-semibold tracking-wide">
          JuneRose Admin
        </Link>

        <nav
          aria-label="Admin navigation"
          className="flex w-full items-center gap-5 overflow-x-auto pb-1 text-sm whitespace-nowrap sm:w-auto"
        >
          {staff && (
            <>
              <Link href={routes.adminOrders} className="hover:text-[#9c7a4f]">
                Orders
              </Link>

              <Link href={routes.adminProducts} className="hover:text-[#9c7a4f]">
                Products
              </Link>

              <Link href={routes.adminProductSizes} className="hover:text-[#9c7a4f]">
                Sizes
              </Link>

              <Link href={routes.adminProductColors} className="hover:text-[#9c7a4f]">
                Colors
              </Link>

              <Link href={routes.adminProductMaterials} className="hover:text-[#9c7a4f]">
                Materials
              </Link>

              <Link href={routes.adminStorefront} className="hover:text-[#9c7a4f]">
                Storefront
              </Link>

              <Link href={routes.adminDataRetention} className="hover:text-[#9c7a4f]">
                Data retention
              </Link>

              {staff.role === "admin" && (
                <Link href={routes.adminStaff} className="hover:text-[#9c7a4f]">
                  Staff access
                </Link>
              )}
            </>
          )}

          <Link href={routes.home} className="text-[#8a7a6d] hover:text-[#9c7a4f]">
            View Store
          </Link>

          {staff && (
            <span className="text-xs font-medium uppercase text-[#8a7a6d]">
              {staff.role}
            </span>
          )}

          {showSignOut && <AdminSignOutButton />}
        </nav>
      </header>

      <main id="admin-main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
