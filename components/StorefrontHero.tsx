import Image from "next/image";
import Link from "next/link";
import { routes } from "@/lib/routes";
import type { StorefrontSettings } from "@/types/storefront";

export default function StorefrontHero({
  settings,
  imageUrl,
}: {
  settings: StorefrontSettings;
  imageUrl: string;
}) {
  return (
    <section className="relative h-[72svh] min-h-[540px] max-h-[760px] overflow-hidden bg-[#ded9d6]">
      <Image
        src={imageUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/25" />

      <div className="relative mx-auto flex h-full max-w-[1440px] items-end px-5 pb-12 text-white sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-medium uppercase text-white/90">
            Everyday intimates
          </p>
          <h1 className="font-display max-w-2xl text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
            {settings.heroTitle}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/95 sm:text-base">
            {settings.heroDescription}
          </p>
          <Link
            href={routes.catalog}
            className="mt-8 inline-flex min-h-12 items-center bg-white px-6 text-sm font-medium text-[#211d1b] transition-colors hover:bg-[#b62568] hover:text-white"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
