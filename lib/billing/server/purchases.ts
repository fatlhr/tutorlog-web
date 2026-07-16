import "server-only";

import type { User } from "@supabase/supabase-js";

import type { PackageCode, PaymentMethod, PurchaseSummary } from "@/lib/billing/contracts";
import { BillingError } from "@/lib/billing/errors";
import { createPaymentProvider } from "@/lib/billing/providers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessSummary } from "./access";
import { assertPaymentProviderEnabled, getQuote } from "./catalog";
import { getPurchaseStatus } from "./payments";

interface ReservationResult {
  purchaseId: string;
  paymentId: string;
  shouldCreateProvider: boolean;
}

function normalizeReservation(data: unknown): ReservationResult {
  const value = (data ?? {}) as Record<string, unknown>;
  if (
    typeof value.purchase_id !== "string"
    || typeof value.payment_id !== "string"
    || typeof value.should_create_provider !== "boolean"
  ) {
    throw new BillingError("PROVIDER_RESPONSE_INVALID", "Purchase reservation is invalid");
  }

  return {
    purchaseId: value.purchase_id,
    paymentId: value.payment_id,
    shouldCreateProvider: value.should_create_provider,
  };
}

function stableFailureCode(error: unknown): string {
  if (error instanceof BillingError) return error.code;
  return "PROVIDER_UNAVAILABLE";
}

async function markProviderCreationFailed(
  userId: string,
  paymentId: string,
  error: unknown,
): Promise<void> {
  const admin = createAdminClient();
  const { error: failureUpdateError } = await admin
    .from("billing_payments")
    .update({
      state: "failed",
      provider_error_code: stableFailureCode(error),
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .eq("user_id", userId)
    .eq("state", "created");

  if (failureUpdateError) throw new Error("Failed to record payment failure");
}

function assertProviderResult(
  result: {
    providerReference: string;
    state: "pending" | "failed";
    redirectUrl: string;
    channelFee: number;
    totalAmount: number;
    expiresAt: string | null;
  },
  expectedChannelFee: number,
  expectedTotal: number,
): void {
  if (
    !result.providerReference.trim()
    || !Number.isSafeInteger(result.channelFee)
    || !Number.isSafeInteger(result.totalAmount)
    || result.channelFee !== expectedChannelFee
    || result.totalAmount !== expectedTotal
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

  if (error) throw new BillingError("PACKAGE_UNAVAILABLE", "Package unavailable");
  const reservation = normalizeReservation(data);
  if (!reservation.shouldCreateProvider) {
    return getPurchaseStatus(user.id, reservation.purchaseId);
  }

  try {
    const provider = createPaymentProvider();
    const result = await provider.createPayment({
      purchaseId: reservation.purchaseId,
      amount: quote.baseAmount,
      method,
      customer: customerFromUser(user),
      callbackUrl: process.env.IPAYMU_CALLBACK_URL ?? "",
      returnUrl: process.env.IPAYMU_RETURN_URL ?? "",
    });
    assertProviderResult(result, quote.channelFee, quote.totalAmount);

    const { error: updateError } = await admin
      .from("billing_payments")
      .update({
        provider_reference: result.providerReference,
        state: result.state,
        channel_fee: result.channelFee,
        total_amount: result.totalAmount,
        redirect_url: result.redirectUrl,
        expires_at: result.expiresAt,
        provider_error_code: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reservation.paymentId)
      .eq("user_id", user.id)
      .eq("state", "created");

    if (updateError) {
      throw new BillingError("PROVIDER_UNAVAILABLE", "Payment could not be saved");
    }
  } catch (error) {
    await markProviderCreationFailed(user.id, reservation.paymentId, error);
    if (error instanceof BillingError) throw error;
    throw new BillingError("PROVIDER_UNAVAILABLE", "Payment provider is unavailable");
  }

  return getPurchaseStatus(user.id, reservation.purchaseId);
}
