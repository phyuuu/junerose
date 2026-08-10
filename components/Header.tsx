import Link from "next/link";
import CartNavigationLink from "@/components/CartNavigationLink";
import { routes } from "../lib/routes";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e1de] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-18 w-full max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link
          href={routes.home}
          className="font-display text-2xl leading-none text-[#211d1b] sm:text-[28px]"
          aria-label="JuneRose home"
        >
          June<span className="text-[#b62568]">Rose</span>
        </Link>

        <nav
          aria-label="Store navigation"
          className="hidden items-center gap-8 text-[13px] font-medium uppercase md:flex"
        >
          <Link href={routes.catalog} className="transition-colors hover:text-[#b62568]">
            Shop
          </Link>
          <Link href={routes.checkOrder} className="transition-colors hover:text-[#b62568]">
            Check order
          </Link>
          <CartNavigationLink />
        </nav>

        <details className="group relative md:hidden">
          <summary className="flex min-h-11 cursor-pointer list-none items-center border-b border-[#211d1b] text-xs font-medium uppercase">
            Menu
          </summary>
          <nav
            aria-label="Mobile store navigation"
            className="absolute right-0 top-[calc(100%+12px)] grid w-56 gap-1 border border-[#e7e1de] bg-white p-3 text-sm shadow-lg"
          >
            <Link href={routes.catalog} className="min-h-11 px-3 py-3 hover:bg-[#f8edf2]">
              Shop
            </Link>
            <Link href={routes.checkOrder} className="min-h-11 px-3 py-3 hover:bg-[#f8edf2]">
              Check order
            </Link>
            <CartNavigationLink mobile />
          </nav>
        </details>
      </div>
    </header>
  );
}
