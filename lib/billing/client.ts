import type {
  CheckoutQuote,
  ExportAuthorizationResult,
  PackageCode,
  PaymentMethod,
  ProductSummary,
  PurchaseSummary,
} from "./contracts";
import type { BillingErrorCode } from "./errors";
import { trackBillingEvent } from "./analytics-client";

const BROWSER_REQUEST_TIMEOUT_MS = 15000;

const ERROR_MESSAGES: Record<BillingErrorCode, string> = {
  AUTH_REQUIRED: "Login diperlukan",
  PAYMENT_PROVIDER_NOT_READY: "Penyedia pembayaran belum siap",
  PACKAGE_NOT_FOUND: "Paket tidak ditemukan",
  PACKAGE_UNAVAILABLE: "Paket tidak tersedia",
  PRICE_CHANGED: "Harga paket telah berubah",
  LIFETIME_ALREADY_ACTIVE: "Akses lifetime sudah aktif",
  PURCHASE_NOT_FOUND: "Pembelian tidak ditemukan",
  PAYMENT_NOT_FOUND: "Pembayaran tidak ditemukan",
  PAYMENT_NOT_CANCELABLE: "Pembayaran tidak dapat dibatalkan",
  INVALID_PAYMENT_TRANSITION: "Status pembayaran tidak valid",
  PROVIDER_UNAVAILABLE: "Layanan pembayaran tidak tersedia",
  PROVIDER_RESPONSE_INVALID: "Respons layanan pembayaran tidak valid",
  EXPORT_NOT_ALLOWED: "Aksi tidak diizinkan",
};

export class BillingClientError extends Error {
  constructor(public readonly code: BillingErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = "BillingClientError";
  }
}

function isBillingErrorCode(value: unknown): value is BillingErrorCode {
  return typeof value === "string" && value in ERROR_MESSAGES;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const requestController = new AbortController();
  const callerSignal = init?.signal;
  const timeoutError = new Error("Billing request timed out");
  timeoutError.name = "TimeoutError";
  let timedOut = false;
  const abortFromCaller = () => requestController.abort(callerSignal?.reason);

  if (callerSignal?.aborted) {
    abortFromCaller();
  } else if (callerSignal) {
    callerSignal.addEventListener("abort", abortFromCaller, { once: true });
  }

  const timeoutId = setTimeout(() => {
    if (requestController.signal.aborted) return;
    timedOut = true;
    requestController.abort(timeoutError);
  }, BROWSER_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: init?.body
        ? { "content-type": "application/json", ...init.headers }
        : init?.headers,
      signal: requestController.signal,
    });

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().includes("application/json")) {
      throw new BillingClientError("PROVIDER_RESPONSE_INVALID");
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      if (requestController.signal.aborted) throw error;
      throw new BillingClientError("PROVIDER_RESPONSE_INVALID");
    }

    if (!response.ok) {
      const code = (body as { error?: { code?: unknown } } | null)?.error?.code;
      throw new BillingClientError(
        isBillingErrorCode(code) ? code : "PROVIDER_RESPONSE_INVALID",
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof BillingClientError) throw error;
    if (timedOut) throw timeoutError;
    if (callerSignal?.aborted) throw requestController.signal.reason ?? error;
    throw new BillingClientError("PROVIDER_UNAVAILABLE");
  } finally {
    clearTimeout(timeoutId);
    callerSignal?.removeEventListener("abort", abortFromCaller);
  }
}

function jsonBody(value: unknown): Pick<RequestInit, "body" | "method"> {
  return { method: "POST", body: JSON.stringify(value) };
}

export function getProducts(): Promise<ProductSummary[]> {
  return requestJson("/api/products");
}

export function getCheckoutQuote(
  packageCode: PackageCode,
  method: PaymentMethod,
): Promise<CheckoutQuote> {
  return requestJson("/api/quotes", jsonBody({ packageCode, method }));
}

export function createOrResumePurchase(
  packageCode: PackageCode,
  method: PaymentMethod,
): Promise<PurchaseSummary> {
  return requestJson("/api/purchases", jsonBody({ packageCode, method }));
}

export function getPurchaseStatus(purchaseId: string): Promise<PurchaseSummary> {
  return requestJson(`/api/purchases/${encodeURIComponent(purchaseId)}`);
}

export function cancelPendingPayment(paymentId: string): Promise<PurchaseSummary> {
  return requestJson(
    `/api/payments/${encodeURIComponent(paymentId)}/cancel`,
    jsonBody({}),
  );
}

export async function authorizeExport(
  feature: "recap_pdf" | "recap_csv" | "invoice_pdf",
): Promise<ExportAuthorizationResult> {
  const result = await requestJson<ExportAuthorizationResult>(
    "/api/exports/authorize",
    jsonBody({ feature }),
  );
  trackBillingEvent(result.allowed ? "export_allowed" : "export_blocked", {
    feature,
    surface: "export",
  });
  return result;
}
