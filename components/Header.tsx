import Link from "next/link";
import { routes } from "../lib/routes";

export default function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Link href={routes.home} className="text-xl font-semibold tracking-wide">
        JuneRose
      </Link>

      <nav className="flex gap-5 text-sm">
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