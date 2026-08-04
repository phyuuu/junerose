"use client";

import AppErrorView from "@/components/AppErrorView";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <AppErrorView
          error={error}
          reset={reset}
          homeHref="/"
          homeLabel="Return to store"
          title="JuneRose is temporarily unavailable"
        />
      </body>
    </html>
  );
}
