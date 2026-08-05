import Link from "next/link";
import { routes } from "@/lib/routes";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#dfd0bc]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-[#6f6258] sm:flex-row sm:items-center sm:justify-between">
        <p>JuneRose retail shop</p>

        <nav aria-label="Store information" className="flex gap-5">
          <Link href={routes.checkOrder} className="hover:text-[#2f241d]">
            Check order
          </Link>
          <Link href={routes.privacy} className="hover:text-[#2f241d]">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
