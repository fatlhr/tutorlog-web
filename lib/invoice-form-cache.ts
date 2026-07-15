export const INVOICE_DRAFT_KEY = "tutorlog-invoice-draft:v1";
export const INVOICE_SETTINGS_KEY = "tutorlog-invoice-settings";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function readJson(storage: StorageLike, key: string): Record<string, unknown> | null {
  try {
    const saved = storage.getItem(key);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    try { storage.removeItem(key); } catch { /* ignore */ }
    return null;
  }
}

function writeJson(storage: StorageLike, key: string, value: Record<string, unknown>) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export function getInvoiceDraft(storage: StorageLike): Record<string, unknown> | null {
  return readJson(storage, INVOICE_DRAFT_KEY);
}

export function saveInvoiceDraft(storage: StorageLike, value: Record<string, unknown>) {
  writeJson(storage, INVOICE_DRAFT_KEY, value);
}

export function getInvoiceSettings(storage: StorageLike): Record<string, unknown> | null {
  return readJson(storage, INVOICE_SETTINGS_KEY);
}

export function saveInvoiceSettings(storage: StorageLike, value: Record<string, unknown>) {
  writeJson(storage, INVOICE_SETTINGS_KEY, value);
}

export function removeInvoiceSettings(storage: StorageLike) {
  try {
    storage.removeItem(INVOICE_SETTINGS_KEY);
  } catch {
    /* storage unavailable */
  }
}

export function clearInvoiceFormCache({
  localStorage,
  sessionStorage,
}: {
  localStorage?: StorageLike;
  sessionStorage?: StorageLike;
}) {
  try {
    localStorage?.removeItem(INVOICE_SETTINGS_KEY);
  } catch {
    /* storage unavailable */
  }

  try {
    sessionStorage?.removeItem(INVOICE_DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
}

function stringValue(source: Record<string, unknown> | null | undefined, key: string): string {
  const value = source?.[key];
  return typeof value === "string" ? value.trim() : "";
}

export function resolveInvoiceTutorName({
  draft,
  settings,
  accountName,
  email,
}: {
  draft: Record<string, unknown> | null;
  settings: Record<string, unknown> | null;
  accountName: string;
  email: string;
}) {
  return (
    stringValue(draft, "tutorName") ||
    stringValue(settings, "tutorName") ||
    accountName.trim() ||
    email.split("@")[0] ||
    ""
  );
}
