export type ExportFormat = "pdf" | "csv";
export type AccessState = "free" | "plus_active" | "plus_expired";
export type PaywallReason = "free-limit" | "expired" | "invoice-locked";

export interface QuotaInfo {
  plan: string;
  pdfExportCount30d: number;
  csvExportCount30d: number;
  pdfExportUnlimited: boolean;
  exportWindowDays: number;
  activeUntil: string | null;
  rekapExportLimit: number;
  rekapExportUnlimited: boolean;
  rekapPdfExportCount: number;
  rekapCsvExportCount: number;
}

export interface AccessInfo {
  state: AccessState;
  isPlus: boolean;
  isPlusActive: boolean;
  isPlusExpired: boolean;
}

export interface ExportDecision {
  allowed: boolean;
  quota: QuotaInfo;
  reason?: PaywallReason;
  used?: number;
  limit?: number;
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }
  return fallback;
}

function asStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function normalizeQuotaPayload(payload: Record<string, unknown> | null | undefined): QuotaInfo {
  const result = payload ?? {};
  const pdfExportCount30d = asNumber(result.pdf_export_count_30d, 0);
  const csvExportCount30d = asNumber(result.csv_export_count_30d, 0);
  const pdfExportUnlimited = asBoolean(result.pdf_export_unlimited, false);
  const legacyPdfLimit = asNumber(result.pdf_export_free_limit, 1);
  const rekapExportLimit = asNumber(result.rekap_export_limit, legacyPdfLimit);
  const rekapExportUnlimited = asBoolean(result.rekap_export_unlimited, pdfExportUnlimited);

  return {
    plan: typeof result.plan === "string" && result.plan.trim() ? result.plan : "free",
    pdfExportCount30d,
    csvExportCount30d,
    pdfExportUnlimited,
    exportWindowDays: asNumber(result.export_window_days, 30),
    activeUntil: asStringOrNull(result.active_until),
    rekapExportLimit,
    rekapExportUnlimited,
    rekapPdfExportCount: asNumber(result.rekap_pdf_export_count, pdfExportCount30d),
    rekapCsvExportCount: asNumber(result.rekap_csv_export_count, csvExportCount30d),
  };
}

export function getAccessState(quota: QuotaInfo, now: Date = new Date()): AccessInfo {
  const paidPlan = quota.plan.toLowerCase() !== "free" || quota.rekapExportUnlimited || quota.pdfExportUnlimited;
  const expiresAt = quota.activeUntil ? new Date(quota.activeUntil).getTime() + 86400000 : null;
  const isExpired = Boolean(paidPlan && expiresAt !== null && expiresAt < now.getTime());
  const isPlusActive = paidPlan && !isExpired;

  return {
    state: isPlusActive ? "plus_active" : isExpired ? "plus_expired" : "free",
    isPlus: paidPlan,
    isPlusActive,
    isPlusExpired: isExpired,
  };
}

export function isPlusActive(quota: QuotaInfo): boolean {
  return getAccessState(quota).isPlusActive;
}

export function isPlusExpired(quota: QuotaInfo): boolean {
  return getAccessState(quota).isPlusExpired;
}

export function canExportRecap(format: ExportFormat, quota: QuotaInfo): ExportDecision {
  const access = getAccessState(quota);
  const used = format === "pdf" ? quota.rekapPdfExportCount : quota.rekapCsvExportCount;
  const limit = quota.rekapExportLimit;

  if (access.isPlusActive) {
    return { allowed: true, quota, used, limit };
  }

  return {
    allowed: used < limit,
    quota,
    reason: access.isPlusExpired ? "expired" : "free-limit",
    used,
    limit,
  };
}

export function canExportInvoice(quota: QuotaInfo): ExportDecision {
  const access = getAccessState(quota);
  return {
    allowed: access.isPlusActive,
    quota,
    reason: access.isPlusExpired ? "expired" : "invoice-locked",
  };
}
