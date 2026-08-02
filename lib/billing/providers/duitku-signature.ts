import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { BillingError } from "@/lib/billing/errors";
import type { VerifiedProviderEvent } from "./provider";

function invalidProviderData(): BillingError {
  return new BillingError("PROVIDER_RESPONSE_INVALID", "Payment provider data is invalid");
}

function asString(value: unknown): string {
  if (typeof value === "string") return value;
  throw invalidProviderData();
}

function asNonNegativeIntegerString(value: unknown): string {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return String(value);
  }
  if (typeof value !== "string" || !/^(0|[1-9]\d*)$/.test(value)) {
    throw invalidProviderData();
  }
  return value;
}

export function createDuitkuInquirySignature(
  merchantCode: string,
  merchantOrderId: string,
  paymentAmount: number,
  apiKey: string,
): string {
  const stringToSign = `${merchantCode}${merchantOrderId}${paymentAmount}`;
  return createHmac("sha256", apiKey).update(stringToSign).digest("hex");
}

export function createDuitkuStatusSignature(
  merchantCode: string,
  merchantOrderId: string,
  apiKey: string,
): string {
  const stringToSign = `${merchantCode}${merchantOrderId}`;
  return createHmac("sha256", apiKey).update(stringToSign).digest("hex");
}

export function createDuitkuCallbackSignature(
  merchantCode: string,
  amount: string,
  merchantOrderId: string,
  apiKey: string,
): string {
  const stringToSign = `${merchantCode}${amount}${merchantOrderId}`;
  return createHmac("sha256", apiKey).update(stringToSign).digest("hex");
}

function parseFormUrlEncoded(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of new URLSearchParams(body)) {
    result[key] = value;
  }
  return result;
}

function callbackState(resultCode: string): VerifiedProviderEvent["state"] {
  if (resultCode === "00") return "paid";
  if (resultCode === "01") return "failed";
  if (resultCode === "02") return "canceled";
  throw invalidProviderData();
}

export function verifyDuitkuCallback(input: {
  rawBody: string;
  merchantCode: string;
  apiKey: string;
}): VerifiedProviderEvent {
  try {
    const fields = parseFormUrlEncoded(input.rawBody);

    const merchantCode = asString(fields.merchantCode);
    const merchantOrderId = asString(fields.merchantOrderId);
    const resultCode = asString(fields.resultCode);
    const signature = asString(fields.signature);
    const amount = asString(fields.amount);
    const reference = asString(fields.reference);
    if (merchantCode !== input.merchantCode) throw invalidProviderData();

    const expectedSignature = createDuitkuCallbackSignature(
      input.merchantCode,
      amount,
      merchantOrderId,
      input.apiKey,
    );

    if (!/^[a-fA-F0-9]{64}$/.test(signature)) throw invalidProviderData();
    const expectedBytes = Buffer.from(expectedSignature, "hex");
    const suppliedBytes = Buffer.from(signature, "hex");
    if (expectedBytes.length !== suppliedBytes.length) throw invalidProviderData();
    if (!timingSafeEqual(expectedBytes, suppliedBytes)) throw invalidProviderData();

    const amountValue = asNonNegativeIntegerString(amount);

    return {
      eventReference: merchantOrderId,
      providerReference: reference,
      state: callbackState(resultCode),
      amount: Number(amountValue),
      channelFee: 0,
      occurredAt: new Date().toISOString(),
      raw: Object.fromEntries(
        Object.entries(fields).filter(([key]) => key !== "signature"),
      ),
    };
  } catch (error) {
    if (error instanceof BillingError) throw error;
    throw invalidProviderData();
  }
}
