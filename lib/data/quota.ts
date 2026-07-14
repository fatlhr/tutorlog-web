"use server";

import { createClient } from "@/lib/supabase/server";

export interface QuotaInfo {
  plan: string;
  pdfExportCount30d: number;
  csvExportCount30d: number;
  pdfExportUnlimited: boolean;
  exportWindowDays: number;
}

export async function checkQuota(): Promise<QuotaInfo> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_user_access_status");

  if (error) {
    console.error("Failed to check quota:", error);
    return {
      plan: "free",
      pdfExportCount30d: 0,
      csvExportCount30d: 0,
      pdfExportUnlimited: false,
      exportWindowDays: 30,
    };
  }

  const result = data as Record<string, unknown>;
  return {
    plan: (result.plan as string) ?? "free",
    pdfExportCount30d: (result.pdf_export_count_30d as number) ?? 0,
    csvExportCount30d: (result.csv_export_count_30d as number) ?? 0,
    pdfExportUnlimited: (result.pdf_export_unlimited as boolean) ?? false,
    exportWindowDays: (result.export_window_days as number) ?? 30,
  };
}

export async function recordExportEvent(
  format: "pdf" | "csv",
): Promise<{ success: boolean; quotaExceeded: boolean }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("record_feature_usage_event", {
    p_feature_key: "recap_export",
    p_event_type: "success",
    p_metadata: { format },
  });

  if (error) {
    console.error("Failed to record export event:", error);
    return { success: false, quotaExceeded: false };
  }

  const result = data as Record<string, unknown>;
  return {
    success: (result.success as boolean) ?? false,
    quotaExceeded: false,
  };
}

export async function canExport(
  format: "pdf" | "csv",
): Promise<{ allowed: boolean; quota: QuotaInfo }> {
  const quota = await checkQuota();

  if (quota.pdfExportUnlimited || quota.plan !== "free") {
    return { allowed: true, quota };
  }

  const count = format === "pdf" ? quota.pdfExportCount30d : quota.csvExportCount30d;
  const allowed = count < 1;

  return { allowed, quota };
}