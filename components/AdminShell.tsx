import Link from "next/link";
import type { ReactNode } from "react";
import AdminWorkspaceShell from "@/components/AdminWorkspaceShell";
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

  if (!staff) {
    return (
      <div className="min-h-screen bg-[#f5f6f7] text-[#242220]">
        <a className="skip-link" href="#admin-main-content">
          Skip to admin content
        </a>
        <header className="border-b border-[#dfe2e5] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
            <Link href={routes.admin} className="text-lg font-semibold">
              JuneRose Admin
            </Link>
            <Link
              href={routes.home}
              className="text-sm text-[#6c6764] hover:text-[#b62568]"
            >
              View store
            </Link>
          </div>
        </header>
        <main id="admin-main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    );
  }

  return <AdminWorkspaceShell role={staff.role}>{children}</AdminWorkspaceShell>;
}
