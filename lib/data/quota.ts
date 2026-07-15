"use server";

import { createClient } from "@/lib/supabase/server";
import {
  canExportRecap,
  normalizeQuotaPayload,
  type ExportDecision,
  type ExportFormat,
  type QuotaInfo,
} from "@/lib/data/quota-access";

export type { QuotaInfo } from "@/lib/data/quota-access";

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
      activeUntil: null,
      rekapExportLimit: 1,
      rekapExportUnlimited: false,
      rekapPdfExportCount: 0,
      rekapCsvExportCount: 0,
    };
  }

  return normalizeQuotaPayload(data as Record<string, unknown>);
}

export async function recordExportEvent(
  format: ExportFormat,
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
  format: ExportFormat,
): Promise<ExportDecision> {
  const quota = await checkQuota();
  return canExportRecap(format, quota);
}
