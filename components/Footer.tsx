import Link from "next/link";
import { routes } from "@/lib/routes";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#e7e1de] bg-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 sm:grid-cols-3 sm:px-8 lg:px-12">
        <div>
          <p className="font-display text-2xl">
            June<span className="text-[#b62568]">Rose</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[#6f6864]">
            Everyday intimates and comfort pieces selected with care.
          </p>
        </div>

        <nav aria-label="Shop links" className="grid content-start gap-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase text-[#9a8558]">Shop</p>
          <Link href={routes.catalog} className="w-fit hover:text-[#b62568]">Catalog</Link>
          <Link href={routes.cart} className="w-fit hover:text-[#b62568]">Cart</Link>
        </nav>

        <nav aria-label="Store information" className="grid content-start gap-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase text-[#9a8558]">Information</p>
          <Link href={routes.checkOrder} className="w-fit hover:text-[#b62568]">Check order</Link>
          <Link href={routes.privacy} className="w-fit hover:text-[#b62568]">Privacy</Link>
        </nav>
      </div>
      <div className="border-t border-[#e7e1de] px-5 py-5 text-center text-xs text-[#6f6864]">
        © {new Date().getFullYear()} JuneRose
      </div>
    </footer>
  );
}
