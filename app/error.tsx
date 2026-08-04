"use client";

import AppErrorView from "@/components/AppErrorView";
import { routes } from "@/lib/routes";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppErrorView
      error={error}
      reset={reset}
      homeHref={routes.home}
      homeLabel="Return to store"
      title="Something went wrong"
    />
  );
}
