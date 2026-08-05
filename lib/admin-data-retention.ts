import "server-only";

import { throwReportedServerError } from "@/lib/server/report-error";
import { createClient } from "@/lib/supabase/server";

export type AdminDataRetentionSummary = {
  eligibleCount: number;
  cutoffAt: string;
  retentionMonths: number;
};

type RetentionSummaryResponse = {
  eligible_count?: unknown;
  cutoff_at?: unknown;
  retention_months?: unknown;
};

export async function getAdminDataRetentionSummary(): Promise<AdminDataRetentionSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_order_retention_summary");

  if (error) {
    throwReportedServerError({
      operation: "admin.data_retention.load_summary",
      error,
      message: "Unable to load the data-retention summary.",
    });
  }

  const summary = data as RetentionSummaryResponse | null;

  if (
    !summary ||
    typeof summary.eligible_count !== "number" ||
    typeof summary.cutoff_at !== "string" ||
    typeof summary.retention_months !== "number"
  ) {
    throwReportedServerError({
      operation: "admin.data_retention.parse_summary",
      error: new Error("Unexpected retention summary response"),
      message: "Unable to load the data-retention summary.",
    });
  }

  return {
    eligibleCount: summary.eligible_count,
    cutoffAt: summary.cutoff_at,
    retentionMonths: summary.retention_months,
  };
}
