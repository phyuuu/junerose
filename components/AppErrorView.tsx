"use client";

import Link from "next/link";

type AppErrorViewProps = {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref: string;
  homeLabel: string;
  title: string;
};

export default function AppErrorView({
  error,
  reset,
  homeHref,
  homeLabel,
  title,
}: AppErrorViewProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f3eb] px-5 text-[#2f241d]">
      <section
        role="alert"
        className="w-full max-w-lg border border-[#d6c4aa] bg-[#fbf7f0] p-6"
      >
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#6f6258]">
          The page could not be loaded. Try again, or return to a safe page.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-[#8a7a6d]">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 bg-[#2f241d] px-5 py-2 text-sm font-medium text-white hover:bg-[#4a382c]"
          >
            Try again
          </button>
          <Link
            href={homeHref}
            className="inline-flex min-h-11 items-center border border-[#d6c4aa] px-5 py-2 text-sm font-medium hover:bg-[#eadfce]"
          >
            {homeLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
