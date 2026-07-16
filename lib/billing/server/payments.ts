import "server-only";

import type {
  PaymentMethod,
  PaymentState,
  PaymentStatusView,
  PurchaseSummary,
} from "@/lib/billing/contracts";
import { BillingError } from "@/lib/billing/errors";
import { createPaymentProvider } from "@/lib/billing/providers";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertPaymentProviderEnabled } from "./catalog";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

interface PurchaseRow {
  id: string;
  product_code_snapshot: PurchaseSummary["packageCode"];
  product_name_snapshot: string;
  state: PurchaseSummary["state"];
}

interface PaymentRow {
  id: string;
  purchase_id: string;
  provider: string;
  provider_reference: string | null;
  method: PaymentMethod;
  state: PaymentState;
  base_amount: number;
  channel_fee: number;
  total_amount: number;
  currency: string;
  safe_reference: string;
  redirect_url: string | null;
  instructions: unknown;
  expires_at: string | null;
  verification_deadline: string | null;
  duplicate_review: boolean;
  paid_at: string | null;
  created_at: string;
}

function toPaymentStatus(row: PaymentRow): PaymentStatusView {
  if (
    row.provider !== "ipaymu"
    || row.currency !== "IDR"
    || !Array.isArray(row.instructions)
    || !row.instructions.every((item) => typeof item === "string")
  ) {
    throw new BillingError("PROVIDER_RESPONSE_INVALID", "Stored payment is invalid");
  }

  return {
    id: row.id,
    purchaseId: row.purchase_id,
    provider: "ipaymu",
    packageName: "",
    method: row.method,
    state: row.state,
    baseAmount: row.base_amount,
    channelFee: row.channel_fee,
    totalAmount: row.total_amount,
    currency: "IDR",
    safeReference: row.safe_reference,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    expiresAt: row.expires_at,
    redirectUrl: row.redirect_url,
    instructions: row.instructions as string[],
    verificationDeadline: row.verification_deadline,
    duplicateReview: row.duplicate_review,
  };
}

async function readPurchase(userId: string, purchaseId: string): Promise<PurchaseSummary> {
  const admin = createAdminClient();
  const { data: purchaseData, error: purchaseError } = await admin
    .from("billing_purchases")
    .select("id, product_code_snapshot, product_name_snapshot, state")
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (purchaseError) throw new Error("Failed to load billing purchase");
  if (!purchaseData) throw new BillingError("PURCHASE_NOT_FOUND", "Purchase not found");
  const purchase = purchaseData as PurchaseRow;

  const { data: paymentData, error: paymentError } = await admin
    .from("billing_payments")
    .select(`
      id,
      purchase_id,
      provider,
      provider_reference,
      method,
      state,
      base_amount,
      channel_fee,
      total_amount,
      currency,
      safe_reference,
      redirect_url,
      instructions,
      expires_at,
      verification_deadline,
      duplicate_review,
      paid_at,
      created_at
    `)
    .eq("user_id", userId)
    .eq("purchase_id", purchaseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentError) throw new Error("Failed to load billing payment");
  const payment = paymentData ? toPaymentStatus(paymentData as PaymentRow) : null;
  if (payment) payment.packageName = purchase.product_name_snapshot;

  return {
    id: purchase.id,
    packageCode: purchase.product_code_snapshot,
    packageName: purchase.product_name_snapshot,
    state: purchase.state,
    payment,
  };
}

export async function getPurchaseStatus(
  userId: string,
  purchaseId: string,
): Promise<PurchaseSummary> {
  const purchase = await readPurchase(userId, purchaseId);
  if (process.env.BILLING_PAYMENT_PROVIDER_ENABLED !== "true") return purchase;

  if (purchase.payment?.state !== "pending") return purchase;
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("claim_billing_payment_inquiry", {
    p_user_id: userId,
    p_purchase_id: purchaseId,
  });
  if (error) return purchase;

  const claim = (data ?? {}) as Record<string, unknown>;
  if (claim.claimed !== true || typeof claim.provider_reference !== "string") return purchase;

  try {
    const provider = createPaymentProvider();
    await provider.getPaymentStatus(claim.provider_reference);
  } catch {
    return purchase;
  }

  return readPurchase(userId, purchaseId);
}

async function readCancelablePayment(userId: string, paymentId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("billing_payments")
    .select("id, purchase_id, state")
    .eq("id", paymentId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error("Failed to load billing payment");
  if (!data) throw new BillingError("PAYMENT_NOT_FOUND", "Payment not found");
  if (data.state !== "created" && data.state !== "pending") {
    throw new BillingError("PAYMENT_NOT_CANCELABLE", "Payment cannot be canceled");
  }
  return data as { id: string; purchase_id: string; state: "created" | "pending" };
}

function cancellationFailureCode(error: unknown): string {
  if (error instanceof BillingError) return error.code;
  return "PROVIDER_UNAVAILABLE";
}

async function recordCancellationFailure(
  userId: string,
  paymentId: string,
  errorCode: string,
): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_billing_cancellation_failure", {
    p_user_id: userId,
    p_payment_id: paymentId,
    p_error_code: errorCode,
  });
  if (error) throw new Error("Failed to record cancellation failure");

  const record = (data ?? {}) as Record<string, unknown>;
  if (record.recorded !== true) {
    throw new Error("Cancellation failure was not recorded");
  }
}

export async function cancelProviderPaymentBestEffort(
  userId: string,
  paymentId: string,
  providerReference: string,
): Promise<void> {
  let cancellationCode: string | null = null;
  try {
    const provider = createPaymentProvider();
    const cancellation = await provider.cancelPayment(providerReference);
    if (!cancellation.accepted) cancellationCode = "PROVIDER_CANCELLATION_REJECTED";
  } catch (error) {
    cancellationCode = cancellationFailureCode(error);
  }

  if (cancellationCode) {
    await recordCancellationFailure(userId, paymentId, cancellationCode);
  }
}

export async function cancelPendingPayment(
  userId: string,
  paymentId: string,
): Promise<PurchaseSummary> {
  assertPaymentProviderEnabled();
  await readCancelablePayment(userId, paymentId);

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("supersede_billing_payment", {
    p_user_id: userId,
    p_payment_id: paymentId,
  });
  if (error) throw new Error("Failed to supersede billing payment");

  const result = (data ?? {}) as Record<string, unknown>;
  if (result.superseded !== true || typeof result.purchase_id !== "string") {
    throw new BillingError("PAYMENT_NOT_CANCELABLE", "Payment cannot be canceled");
  }

  if (typeof result.provider_reference !== "string" || !result.provider_reference.trim()) {
    await recordCancellationFailure(userId, paymentId, "PROVIDER_REFERENCE_MISSING");
  } else {
    await cancelProviderPaymentBestEffort(userId, paymentId, result.provider_reference);
  }

  return readPurchase(userId, result.purchase_id);
}

type ProviderEventOutcome =
  | "processed"
  | "duplicate"
  | "amount_mismatch"
  | "ignored"
  | "unknown_reference";

export async function processIpaymuCallback(
  rawBody: string,
  headers: Headers,
  now: Date = new Date(),
): Promise<void> {
  if (process.env.BILLING_PAYMENT_PROVIDER_ENABLED !== "true") {
    throw new BillingError("PAYMENT_PROVIDER_NOT_READY", "Payment provider is not ready");
  }

  const provider = createPaymentProvider();
  const verified = provider.verifyCallback({ rawBody, headers });
  const occurredAt = Date.parse(verified.occurredAt);
  const receivedAt = now.getTime();
  if (
    !Number.isFinite(occurredAt)
    || !Number.isFinite(receivedAt)
    || occurredAt < receivedAt - 10 * 60 * 1000
    || occurredAt > receivedAt + 2 * 60 * 1000
  ) {
    throw new BillingError("PROVIDER_RESPONSE_INVALID", "Payment callback is invalid");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("process_billing_provider_event", {
    p_provider: "ipaymu",
    p_event_key: verified.eventReference,
    p_provider_reference: verified.providerReference,
    p_event_type: verified.state,
    p_amount: verified.amount,
    p_channel_fee: verified.channelFee,
    p_occurred_at: verified.occurredAt,
    p_payload: verified.raw,
  });
  if (error) {
    throw new BillingError("PROVIDER_UNAVAILABLE", "Payment callback is unavailable");
  }

  const result = (data ?? {}) as Record<string, unknown>;
  const outcome = result.status as ProviderEventOutcome | undefined;
  if (outcome === "unknown_reference") {
    throw new BillingError("PROVIDER_UNAVAILABLE", "Payment callback is unavailable");
  }
  if (!["processed", "duplicate", "amount_mismatch", "ignored"].includes(outcome ?? "")) {
    throw new BillingError("PROVIDER_UNAVAILABLE", "Payment callback is unavailable");
  }
}
