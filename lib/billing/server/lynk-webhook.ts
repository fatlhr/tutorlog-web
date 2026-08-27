import "server-only";

import type { ParsedLynkPaymentReceived } from "@/lib/billing/providers/lynk-webhook";
import { createAdminClient } from "@/lib/supabase/admin";

const REVIEW_REASONS = new Set([
  "customer_email_missing",
  "user_not_found",
  "user_ambiguous",
  "unknown_product",
  "amount_mismatch",
  "unsupported_order",
  "processing_error",
]);

export type LynkProcessingResult = {
  status: "processed" | "duplicate" | "needs_review";
  reviewReason: string | null;
};

export class LynkWebhookProcessingError extends Error {
  constructor() {
    super("Lynk webhook processing failed");
    this.name = "LynkWebhookProcessingError";
  }
}

function normalizeRpcResult(value: unknown): LynkProcessingResult {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new LynkWebhookProcessingError();
  }

  const result = value as Record<string, unknown>;
  if (result.status === "processed" || result.status === "duplicate") {
    return { status: result.status, reviewReason: null };
  }

  if (
    result.status === "needs_review"
    && typeof result.review_reason === "string"
    && REVIEW_REASONS.has(result.review_reason)
  ) {
    if (result.review_reason === "processing_error") {
      throw new LynkWebhookProcessingError();
    }

    return {
      status: "needs_review",
      reviewReason: result.review_reason,
    };
  }

  throw new LynkWebhookProcessingError();
}

export async function processLynkPaymentReceived(
  payment: ParsedLynkPaymentReceived,
  payload: Record<string, unknown>,
): Promise<LynkProcessingResult> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("process_lynk_payment_received", {
    p_event_key: payment.eventKey,
    p_provider_reference: payment.providerReference,
    p_customer_email: payment.customerEmail,
    p_product_code: payment.productCode,
    p_product_amount: payment.productAmount,
    p_grand_total: payment.grandTotal,
    p_occurred_at: payment.occurredAt,
    p_payload: payload,
    p_review_reason: payment.reviewReason,
  });

  if (error) throw new LynkWebhookProcessingError();
  return normalizeRpcResult(data);
}
