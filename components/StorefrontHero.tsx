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
    <section className="relative h-[68svh] min-h-[500px] max-h-[680px] overflow-hidden bg-[#ded9d6]">
      <Image
        src={imageUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/35" />

      <div className="relative mx-auto flex h-full max-w-[1440px] items-end px-5 pb-12 text-white sm:px-8 sm:pb-16 lg:px-12">
        <div className="max-w-2xl">
          <div className="mb-5 h-px w-14 bg-[#c8ad72]" />
          <h1 className="font-display text-5xl leading-none sm:text-6xl lg:text-7xl">
            JuneRose
          </h1>
          <p className="font-display mt-4 max-w-xl text-3xl leading-tight sm:text-4xl">
            {settings.heroTitle}
          </p>
          <p className="mt-4 max-w-lg text-sm leading-6 text-white/90 sm:text-base">
            {settings.heroDescription}
          </p>
          <Link
            href={routes.catalog}
            className="mt-7 inline-flex min-h-12 items-center border border-white bg-white px-6 text-sm font-medium text-[#211d1b] transition-colors hover:border-[#b62568] hover:bg-[#b62568] hover:text-white"
          >
            Shop the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
