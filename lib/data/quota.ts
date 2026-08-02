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
  const { data, error } = await supabase.rpc("get_billing_access_status");

  if (error) {
    console.error("Failed to check quota:", error);
    return {
      plan: "free",
      entitlementType: null,
      isLifetime: false,
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

export async function canExport(
  format: ExportFormat,
): Promise<ExportDecision> {
  const quota = await checkQuota();
  return canExportRecap(format, quota);
}
