import "server-only";

import type { User } from "@supabase/supabase-js";

import type { PackageCode, PaymentMethod, PurchaseSummary } from "@/lib/billing/contracts";
import { BillingError } from "@/lib/billing/errors";
import { createPaymentProvider, type ProviderPaymentResult } from "@/lib/billing/providers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessSummary } from "./access";
import { assertPaymentProviderEnabled, getQuote } from "./catalog";
import { cancelProviderPaymentBestEffort, getPurchaseStatus } from "./payments";

interface ReservationResult {
  purchaseId: string;
  paymentId: string;
  shouldCreateProvider: boolean;
  priceId: string;
  baseAmount: number;
  channelFee: number;
  totalAmount: number;
  currency: "IDR";
}

interface FinalizationResult {
  state: "pending" | "failed" | "superseded";
  requiresCancellation: boolean;
}

function normalizeReservation(data: unknown): ReservationResult {
  const value = (data ?? {}) as Record<string, unknown>;
  if (
    typeof value.purchase_id !== "string"
    || typeof value.payment_id !== "string"
    || typeof value.should_create_provider !== "boolean"
    || typeof value.price_id !== "string"
    || !Number.isSafeInteger(value.base_amount)
    || !Number.isSafeInteger(value.channel_fee)
    || !Number.isSafeInteger(value.total_amount)
    || (value.base_amount as number) < 0
    || (value.channel_fee as number) < 0
    || value.total_amount !== (value.base_amount as number) + (value.channel_fee as number)
    || value.currency !== "IDR"
  ) {
    throw new BillingError("PROVIDER_RESPONSE_INVALID", "Purchase reservation is invalid");
  }

  return {
    purchaseId: value.purchase_id,
    paymentId: value.payment_id,
    shouldCreateProvider: value.should_create_provider,
    priceId: value.price_id,
    baseAmount: value.base_amount as number,
    channelFee: value.channel_fee as number,
    totalAmount: value.total_amount as number,
    currency: "IDR",
  };
}

function normalizeFinalization(
  data: unknown,
  expectedState: ProviderPaymentResult["state"],
): FinalizationResult {
  const value = (data ?? {}) as Record<string, unknown>;
  if (
    value.finalized !== true
    || (value.state !== "pending" && value.state !== "failed" && value.state !== "superseded")
    || typeof value.requires_cancellation !== "boolean"
    || (value.requires_cancellation === true && value.state !== "superseded")
    || (value.requires_cancellation === false && value.state !== expectedState)
  ) {
    throw new Error("Provider payment was not finalized");
  }

  return {
    state: value.state,
    requiresCancellation: value.requires_cancellation,
  };
}

function throwReservationError(error: { message: string }): never {
  if (error.message === "PACKAGE_UNAVAILABLE") {
    throw new BillingError("PACKAGE_UNAVAILABLE", "Package unavailable");
  }
  if (error.message === "PRICE_CHANGED") {
    throw new BillingError("PRICE_CHANGED", "Price changed");
  }
  throw new Error("Billing purchase reservation failed");
}

function stableFailureCode(error: unknown): string {
  if (
    error instanceof BillingError
    && (
      error.code === "PAYMENT_PROVIDER_NOT_READY"
      || error.code === "PROVIDER_UNAVAILABLE"
      || error.code === "PROVIDER_RESPONSE_INVALID"
    )
  ) {
    return error.code;
  }
  return "PROVIDER_UNAVAILABLE";
}

async function recordProviderFailure(
  userId: string,
  paymentId: string,
  errorCode: string,
): Promise<void> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("record_billing_provider_failure", {
    p_user_id: userId,
    p_payment_id: paymentId,
    p_error_code: errorCode,
  });
  if (error) throw new Error("Failed to record provider failure");

  const record = (data ?? {}) as Record<string, unknown>;
  if (record.recorded !== true) throw new Error("Provider failure was not recorded");
}

function quoteDoesNotMatchReservation(
  quote: Awaited<ReturnType<typeof getQuote>>,
  reservation: ReservationResult,
): boolean {
  return quote.package.priceId !== reservation.priceId
    || quote.baseAmount !== reservation.baseAmount
    || quote.channelFee !== reservation.channelFee
    || quote.totalAmount !== reservation.totalAmount
    || quote.currency !== reservation.currency;
}

function assertProviderResult(
  result: ProviderPaymentResult,
  reservation: ReservationResult,
): void {
  if (
    !result.providerReference.trim()
    || !Number.isSafeInteger(result.channelFee)
    || !Number.isSafeInteger(result.totalAmount)
    || result.channelFee !== reservation.channelFee
    || result.totalAmount !== reservation.totalAmount
  ) {
    throw new BillingError("PROVIDER_RESPONSE_INVALID", "Payment result is invalid");
  }
}

function customerFromUser(user: User) {
  const metadata = user.user_metadata as Record<string, unknown>;
  const name = typeof metadata.full_name === "string" && metadata.full_name.trim()
    ? metadata.full_name.trim()
    : user.email?.split("@")[0] ?? "TutorLog User";
  const phone = typeof metadata.phone === "string" && metadata.phone.trim()
    ? metadata.phone.trim()
    : undefined;

  return { name, email: user.email ?? "", ...(phone ? { phone } : {}) };
}

export async function createOrResumePurchase(
  user: User,
  packageCode: PackageCode,
  method: PaymentMethod,
): Promise<PurchaseSummary> {
  assertPaymentProviderEnabled();

  const quote = await getQuote(packageCode, method);
  const access = await getAccessSummary();
  if (access.isLifetime) {
    throw new BillingError("LIFETIME_ALREADY_ACTIVE", "Lifetime access is already active");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("reserve_billing_purchase", {
    p_user_id: user.id,
    p_package_code: packageCode,
    p_method: method,
    p_channel_fee: quote.channelFee,
  });
  if (error) throwReservationError(error);

  const reservation = normalizeReservation(data);
  if (!reservation.shouldCreateProvider) {
    return getPurchaseStatus(user.id, reservation.purchaseId);
  }

  if (quoteDoesNotMatchReservation(quote, reservation)) {
    await recordProviderFailure(user.id, reservation.paymentId, "PRICE_CHANGED");
    throw new BillingError("PRICE_CHANGED", "Price changed");
  }

  let result: ProviderPaymentResult;
  try {
    const provider = createPaymentProvider();
    result = await provider.createPayment({
      purchaseId: reservation.purchaseId,
      amount: reservation.baseAmount,
      method,
      customer: customerFromUser(user),
      callbackUrl: process.env.IPAYMU_CALLBACK_URL ?? "",
      returnUrl: process.env.IPAYMU_RETURN_URL ?? "",
    });
    assertProviderResult(result, reservation);
  } catch (error) {
    await recordProviderFailure(user.id, reservation.paymentId, stableFailureCode(error));
    if (error instanceof BillingError) throw error;
    throw new BillingError("PROVIDER_UNAVAILABLE", "Payment provider is unavailable");
  }

  const { data: finalizationData, error: finalizationError } = await admin.rpc(
    "finalize_billing_provider_payment",
    {
      p_user_id: user.id,
      p_payment_id: reservation.paymentId,
      p_provider_reference: result.providerReference,
      p_state: result.state,
      p_redirect_url: result.redirectUrl,
      p_channel_fee: result.channelFee,
      p_total_amount: result.totalAmount,
      p_expires_at: result.expiresAt,
    },
  );
  if (finalizationError) throw new Error("Failed to finalize provider payment");

  const finalization = normalizeFinalization(finalizationData, result.state);
  if (finalization.requiresCancellation) {
    await cancelProviderPaymentBestEffort(
      user.id,
      reservation.paymentId,
      result.providerReference,
    );
  }

  return getPurchaseStatus(user.id, reservation.purchaseId);
}
