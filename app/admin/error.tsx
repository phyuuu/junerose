"use client";

import AppErrorView from "@/components/AppErrorView";
import { routes } from "@/lib/routes";

export default function AdminError({
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
      homeHref={routes.admin}
      homeLabel="Return to admin"
      title="Admin page unavailable"
    />
  );
}
