import Link from "next/link";
import type { ReactNode } from "react";
import { routes } from "../lib/routes";

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-[#f8f3eb] text-[#2f241d]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link href={routes.admin} className="text-xl font-semibold tracking-wide">
          JuneRose Admin
        </Link>

        <nav className="flex gap-5 text-sm">
          <Link href={routes.adminOrders} className="hover:text-[#9c7a4f]">
            Orders
          </Link>

          <Link href={routes.adminProducts} className="hover:text-[#9c7a4f]">
            Products
          </Link>

          <Link href={routes.home} className="text-[#8a7a6d] hover:text-[#9c7a4f]">
            View Store
          </Link>
        </nav>
      </header>

      {children}
    </main>
  );
}