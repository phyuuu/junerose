"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, ShieldCheck, Store } from "lucide-react";
import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";
import AdminNavigation from "@/components/AdminNavigation";
import AdminSignOutButton from "@/components/AdminSignOutButton";
import { routes } from "@/lib/routes";
import type { StaffRole } from "@/types/staff";

const sidebarPreferenceKey = "junerose-admin-sidebar-collapsed";
const sidebarPreferenceEvent = "junerose-admin-sidebar-preference";

function subscribeToSidebarPreference(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(sidebarPreferenceEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(sidebarPreferenceEvent, onStoreChange);
  };
}

function getSidebarPreference() {
  return localStorage.getItem(sidebarPreferenceKey) === "true";
}

function getServerSidebarPreference() {
  return false;
}

type AdminWorkspaceShellProps = {
  children: ReactNode;
  role: StaffRole;
};

export default function AdminWorkspaceShell({
  children,
  role,
}: AdminWorkspaceShellProps) {
  const isCollapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarPreference,
    getServerSidebarPreference,
  );

  function toggleSidebar() {
    localStorage.setItem(sidebarPreferenceKey, String(!isCollapsed));
    window.dispatchEvent(new Event(sidebarPreferenceEvent));
  }

  const toggleLabel = isCollapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <div
      className={`min-h-screen bg-[#f5f6f7] text-[#242220] transition-[grid-template-columns] duration-200 lg:grid ${
        isCollapsed
          ? "lg:grid-cols-[72px_minmax(0,1fr)]"
          : "lg:grid-cols-[248px_minmax(0,1fr)]"
      }`}
    >
      <a className="skip-link" href="#admin-main-content">
        Skip to admin content
      </a>

      <aside className="sticky top-0 hidden h-screen min-w-0 flex-col overflow-hidden bg-[#211f1e] text-white lg:flex">
        <div
          className={`flex min-h-[89px] items-center border-b border-white/10 ${
            isCollapsed ? "justify-center px-3" : "justify-between gap-3 px-6"
          }`}
        >
          {!isCollapsed && (
            <Link href={routes.admin} className="min-w-0">
              <span className="block text-lg font-semibold">JuneRose</span>
              <span className="mt-1 block text-xs uppercase text-[#aaa4a0]">
                Operations
              </span>
            </Link>
          )}

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={toggleLabel}
            title={toggleLabel}
            className="flex size-9 shrink-0 items-center justify-center rounded-[4px] text-[#c8c3c0] transition-colors hover:bg-white/10 hover:text-white"
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" size={18} />
            ) : (
              <PanelLeftClose aria-hidden="true" size={18} />
            )}
          </button>
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto py-6 ${
            isCollapsed ? "px-2" : "px-3"
          }`}
        >
          <AdminNavigation role={role} collapsed={isCollapsed} />
        </div>

        <div
          className={`border-t border-white/10 ${
            isCollapsed ? "flex flex-col items-center gap-4 px-2 py-5" : "px-6 py-5"
          }`}
        >
          {isCollapsed ? (
            <>
              <span
                className="flex size-9 items-center justify-center rounded-[4px] border border-white/15 text-[#d2cdca]"
                title={`${role} account`}
              >
                <ShieldCheck aria-hidden="true" size={18} />
                <span className="sr-only">{role} account</span>
              </span>
              <Link
                href={routes.home}
                aria-label="View store"
                title="View store"
                className="flex size-9 items-center justify-center rounded-[4px] text-[#aaa4a0] transition-colors hover:bg-white/10 hover:text-white"
              >
                <Store aria-hidden="true" size={18} />
              </Link>
              <AdminSignOutButton compact />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium uppercase text-[#d2cdca]">
                  {role}
                </span>
                <Link
                  href={routes.home}
                  className="text-xs text-[#aaa4a0] hover:text-white"
                >
                  View store
                </Link>
              </div>
              <AdminSignOutButton className="mt-4 text-sm text-[#c8c3c0] hover:text-white" />
            </>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b border-[#dfe2e5] bg-white lg:hidden">
          <div className="flex min-h-16 items-center justify-between px-5">
            <Link href={routes.admin} className="font-semibold">
              JuneRose Admin
            </Link>
            <span className="text-xs font-medium uppercase text-[#6c6764]">
              {role}
            </span>
          </div>

          <details className="border-t border-[#eceeef]">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-5 text-sm font-medium [&::-webkit-details-marker]:hidden">
              Menu
              <span aria-hidden="true">+</span>
            </summary>
            <div className="border-t border-[#eceeef] bg-white px-2 py-5">
              <AdminNavigation role={role} mobile />
              <div className="mt-5 flex items-center justify-between border-t border-[#eceeef] px-3 pt-5">
                <Link
                  href={routes.home}
                  className="text-sm text-[#6c6764] hover:text-[#b62568]"
                >
                  View store
                </Link>
                <AdminSignOutButton />
              </div>
            </div>
          </details>
        </header>

        <main id="admin-main-content" tabIndex={-1} className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
