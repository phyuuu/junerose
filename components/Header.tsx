import Link from "next/link";
import { routes } from "../lib/routes";

export default function Header() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5">
      <Link href={routes.home} className="text-xl font-semibold tracking-wide">
        JuneRose
      </Link>

      <nav
        aria-label="Store navigation"
        className="flex shrink-0 gap-4 text-sm sm:gap-5"
      >
        <Link href={routes.catalog} className="hover:text-[#9c7a4f]">
          Catalog
        </Link>

        <Link href={routes.cart} className="hover:text-[#9c7a4f]">
          Cart
        </Link>
      </nav>
    </header>
  );
}
