"use client";

import {
  ClipboardList,
  Database,
  House,
  Image,
  LockKeyhole,
  Package,
  Palette,
  Ruler,
  Shirt,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";
import type { StaffRole } from "@/types/staff";

type AdminNavigationProps = {
  role: StaffRole;
  collapsed?: boolean;
  mobile?: boolean;
};

const navigationGroups = [
  {
    label: "Workspace",
    links: [
      { label: "Overview", href: routes.admin, icon: House },
      { label: "Orders", href: routes.adminOrders, icon: ClipboardList },
      { label: "Products", href: routes.adminProducts, icon: Package },
      {
        label: "Inventory history",
        href: routes.adminInventoryHistory,
        icon: Database,
      },
    ],
  },
  {
    label: "Catalog setup",
    links: [
      { label: "Sizes", href: routes.adminProductSizes, icon: Ruler },
      { label: "Colors", href: routes.adminProductColors, icon: Palette },
      {
        label: "Materials",
        href: routes.adminProductMaterials,
        icon: Shirt,
      },
      { label: "Storefront", href: routes.adminStorefront, icon: Image },
    ],
  },
  {
    label: "Governance",
    links: [
      {
        label: "Data retention",
        href: routes.adminDataRetention,
        icon: LockKeyhole,
      },
    ],
  },
] as const;

export default function AdminNavigation({
  role,
  collapsed = false,
  mobile = false,
}: AdminNavigationProps) {
  const pathname = usePathname();
  const groups = navigationGroups.map((group) => ({
    ...group,
    links:
      group.label === "Governance" && role === "admin"
        ? [
            ...group.links,
            { label: "Staff access", href: routes.adminStaff, icon: Users },
          ]
        : group.links,
  }));

  function isActive(href: string) {
    if (href === routes.admin) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav
      aria-label="Admin navigation"
      className={mobile ? "space-y-5" : collapsed ? "space-y-3" : "space-y-7"}
    >
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p
              className={
                mobile
                  ? "px-3 text-[11px] font-semibold uppercase text-[#8a8582]"
                  : "px-3 text-[11px] font-semibold uppercase text-[#928c88]"
              }
            >
              {group.label}
            </p>
          )}

          <div className={`${collapsed ? "" : "mt-2"} grid gap-1`}>
            {group.links.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? link.label : undefined}
                  title={collapsed ? link.label : undefined}
                  className={
                    mobile
                      ? `flex min-h-11 items-center gap-3 border-l-2 px-3 text-sm ${
                          active
                            ? "border-[#b62568] bg-[#f8edf2] font-medium text-[#211d1b]"
                            : "border-transparent text-[#5f5a57] hover:bg-[#f5f3f2]"
                        }`
                      : `flex min-h-10 items-center border-l-2 text-sm transition-colors ${
                          collapsed ? "justify-center px-0" : "gap-3 px-3"
                        } ${
                          active
                            ? "border-[#d7679c] bg-white/10 font-medium text-white"
                            : "border-transparent text-[#c8c3c0] hover:bg-white/[0.06] hover:text-white"
                        }`
                  }
                >
                  <Icon aria-hidden="true" className="shrink-0" size={18} />
                  <span className={collapsed ? "sr-only" : undefined}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
