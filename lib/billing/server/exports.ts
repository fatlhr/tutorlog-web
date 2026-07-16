"use server";

import type { ExportAuthorizationResult } from "@/lib/billing/contracts";
import { createClient } from "@/lib/supabase/server";

export type ExportFeature = "recap_pdf" | "recap_csv" | "invoice_pdf";

const EXPORT_FEATURES: readonly ExportFeature[] = [
  "recap_pdf",
  "recap_csv",
  "invoice_pdf",
];

function isExportFeature(value: unknown): value is ExportFeature {
  return typeof value === "string" && EXPORT_FEATURES.includes(value as ExportFeature);
}

function asNullableCount(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function normalizeAuthorization(data: unknown): ExportAuthorizationResult {
  const payload = (data ?? {}) as Record<string, unknown>;
  const reason = payload.reason === "free-limit"
    || payload.reason === "expired"
    || payload.reason === "invoice-locked"
    ? payload.reason
    : null;

  if (typeof payload.allowed !== "boolean") {
    throw new Error("Export authorization response is invalid");
  }

  return {
    allowed: payload.allowed,
    authorizationId: typeof payload.authorization_id === "string"
      ? payload.authorization_id
      : null,
    reason,
    used: asNullableCount(payload.used),
    limit: asNullableCount(payload.limit),
  };
}

export async function authorizeExport(
  feature: ExportFeature,
): Promise<ExportAuthorizationResult> {
  if (!isExportFeature(feature)) {
    throw new Error("Export feature is not supported");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("authorize_feature_export", {
    p_feature: feature,
  });

  if (error) {
    throw new Error("Failed to authorize export");
  }

  return normalizeAuthorization(data);
}
