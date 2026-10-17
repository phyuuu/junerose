"use client";

import Image from "next/image";
import Link from "next/link";
import { ClipboardList, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CartNavigationLink from "@/components/CartNavigationLink";
import { routes } from "../lib/routes";

const categoryLinks = [
  { label: "Collection", href: routes.catalog },
  { label: "Underwear", href: routes.catalogByType("underwear") },
  { label: "Pajamas", href: routes.catalogByType("pajamas") },
  { label: "Swimwear", href: routes.catalogByType("swimwear") },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const overlaysHero = pathname === "/";
  const transparent = overlaysHero && !menuOpen;

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`left-0 right-0 top-0 z-50 transition-colors ${
        overlaysHero ? "absolute" : "sticky"
      } ${
        transparent
          ? "border-b border-white/35 bg-gradient-to-b from-black/25 to-transparent text-white"
          : "border-b border-[#e7e1de] bg-white text-[#211d1b]"
      }`}
    >
      <div className="mx-auto grid h-18 w-full max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:h-20 lg:px-12">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="store-menu"
          className="flex min-h-11 w-fit items-center gap-2 text-sm font-medium transition-opacity hover:opacity-65"
        >
          {menuOpen ? (
            <X aria-hidden="true" className="size-[21px] stroke-[1.6]" />
          ) : (
            <Menu aria-hidden="true" className="size-[22px] stroke-[1.6]" />
          )}
          <span>{menuOpen ? "Close" : "Menu"}</span>
        </button>

        <Link
          href={routes.home}
          onClick={closeMenu}
          className="font-display text-2xl leading-none sm:text-[28px]"
          aria-label="JuneRose home"
        >
          June<span className={transparent ? "text-white" : "text-[#b62568]"}>Rose</span>
        </Link>

        <nav aria-label="Order navigation" className="flex items-center justify-end gap-4 sm:gap-5">
          <Link
            href={routes.checkOrder}
            onClick={closeMenu}
            className="hidden min-h-11 items-center gap-2 text-sm font-medium transition-opacity hover:opacity-65 sm:flex"
            title="Check order"
          >
            <ClipboardList aria-hidden="true" className="size-[21px] stroke-[1.6]" />
            <span className="hidden xl:inline">Check order</span>
          </Link>
          <CartNavigationLink />
        </nav>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close store menu"
            onClick={closeMenu}
            className="fixed inset-0 top-18 -z-10 cursor-default bg-black/25 lg:top-20"
          />
          <div id="store-menu" className="border-t border-[#e7e1de] bg-white text-[#211d1b]">
            <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
              <nav
                aria-label="Store categories"
                className="flex flex-col justify-between px-5 py-8 sm:px-8 sm:py-10 lg:min-h-[430px] lg:px-12"
              >
                <div className="grid gap-1">
                  {categoryLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={closeMenu}
                      className="w-fit py-2 font-display text-3xl leading-none transition-colors hover:text-[#b62568] sm:text-4xl"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#e7e1de] pt-6 text-sm">
                  <Link
                    href={routes.checkOrder}
                    onClick={closeMenu}
                    className="border-b border-[#211d1b] pb-1 hover:text-[#b62568]"
                  >
                    Check an order
                  </Link>
                  <Link
                    href={routes.cart}
                    onClick={closeMenu}
                    className="border-b border-[#211d1b] pb-1 hover:text-[#b62568]"
                  >
                    View cart
                  </Link>
                </div>
              </nav>

              <Link
                href={routes.catalog}
                onClick={closeMenu}
                className="group relative hidden min-h-[430px] overflow-hidden lg:block"
              >
                <Image
                  src="/products/soft-cotton-set.jpg"
                  alt="Explore the JuneRose collection"
                  fill
                  sizes="65vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-black/15" />
                <span className="absolute bottom-8 left-8 border-b border-white pb-1 text-sm font-medium text-white">
                  Explore the collection
                </span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
