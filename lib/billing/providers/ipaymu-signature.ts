import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { BillingError } from "@/lib/billing/errors";
import type { VerifiedProviderEvent } from "./provider";

const INTEGER_FIELDS = [
  "trx_id",
  "status_code",
  "transaction_status_code",
  "paid_off",
] as const;

function invalidProviderData(): BillingError {
  return new BillingError("PROVIDER_RESPONSE_INVALID", "Payment provider data is invalid");
}

function asObject(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw invalidProviderData();
  }

  return value as Record<string, unknown>;
}

function asInteger(value: unknown): number {
  if (typeof value === "number" && Number.isSafeInteger(value)) return value;
  if (typeof value !== "string" || !/^-?(0|[1-9]\d*)$/.test(value)) {
    throw invalidProviderData();
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw invalidProviderData();
  return parsed;
}

function asBoolean(value: unknown): boolean {
  if (value === true || value === 1 || value === "1" || value === "true") return true;
  if (value === false || value === 0 || value === "0" || value === "false") return false;
  throw invalidProviderData();
}

function asIdrString(value: unknown): string {
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) throw invalidProviderData();
    return String(value);
  }
  if (typeof value !== "string" || !/^(0|[1-9]\d*)$/.test(value)) {
    throw invalidProviderData();
  }
  if (!Number.isSafeInteger(Number(value))) throw invalidProviderData();
  return value;
}

function normalizeCallbackPayload(value: unknown): Record<string, unknown> {
  const payload = { ...asObject(value) };
  delete payload.signature;

  if (!("additional_info" in payload)) payload.additional_info = [];
  for (const field of INTEGER_FIELDS) {
    if (field in payload) payload[field] = asInteger(payload[field]);
  }
  if ("is_escrow" in payload) payload.is_escrow = asBoolean(payload.is_escrow);
  payload.amount = asIdrString(payload.amount);
  payload.fee = asIdrString(payload.fee);

  return Object.fromEntries(
    Object.entries(payload).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0),
  );
}

function stringifyCanonicalPayload(payload: Record<string, unknown>): string {
  return JSON.stringify(payload).replaceAll("/", "\\/");
}

function isValidRequestTimestamp(timestamp: string): boolean {
  const match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(timestamp);
  if (!match) return false;

  const [, year, month, day, hour, minute, second] = match.map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day
    && parsed.getUTCHours() === hour
    && parsed.getUTCMinutes() === minute
    && parsed.getUTCSeconds() === second;
}

export function formatIpaymuTimestamp(date: Date): string {
  if (!Number.isFinite(date.getTime())) throw invalidProviderData();
  const parts = [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  ];
  return parts.map((part, index) => index === 0 ? String(part) : String(part).padStart(2, "0")).join("");
}

export function createIpaymuRequestHeaders(input: {
  method: string;
  va: string;
  apiKey: string;
  timestamp: string;
  rawBody: string;
}): { va: string; signature: string; timestamp: string } {
  if (!isValidRequestTimestamp(input.timestamp)) throw invalidProviderData();

  const bodyHash = createHash("sha256").update(input.rawBody).digest("hex");
  const stringToSign = `${input.method.toUpperCase()}:${input.va}:${bodyHash}:${input.apiKey}`;
  const signature = createHmac("sha256", input.apiKey).update(stringToSign).digest("hex");
  return { va: input.va, signature, timestamp: input.timestamp };
}

export function canonicalizeIpaymuCallback(payload: Record<string, unknown>): string {
  return stringifyCanonicalPayload(normalizeCallbackPayload(payload));
}

export function createIpaymuCallbackSignature(
  payload: Record<string, unknown>,
  va: string,
): string {
  return createHmac("sha256", va)
    .update(canonicalizeIpaymuCallback(payload))
    .digest("hex");
}

function readRequiredHeader(headers: Headers, name: string): string {
  const value = headers.get(name)?.trim();
  if (!value) throw invalidProviderData();
  return value;
}

function callbackState(payload: Record<string, unknown>): VerifiedProviderEvent["state"] {
  const status = payload.status;
  const statusCode = payload.status_code;

  if (status === "berhasil" && statusCode === 1) return "paid";
  if (status === "pending" && statusCode === 0) return "pending";
  if (status === "expired" && statusCode === -2) return "expired";
  throw invalidProviderData();
}

export function verifyIpaymuCallback(input: {
  rawBody: string;
  headers: Headers;
  va: string;
}): VerifiedProviderEvent {
  try {
    const suppliedSignature = readRequiredHeader(input.headers, "X-Signature");
    const eventReference = readRequiredHeader(input.headers, "X-External-ID");
    const timestamp = readRequiredHeader(input.headers, "X-Timestamp");
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(timestamp)) {
      throw invalidProviderData();
    }
    const timestampValue = Date.parse(timestamp);
    if (!Number.isFinite(timestampValue)) throw invalidProviderData();

    const parsed = asObject(JSON.parse(input.rawBody));
    const payload = normalizeCallbackPayload(parsed);
    const expectedSignature = createHmac("sha256", input.va)
      .update(stringifyCanonicalPayload(payload))
      .digest("hex");

    if (!/^[a-fA-F0-9]+$/.test(suppliedSignature)) throw invalidProviderData();
    const expectedBytes = Buffer.from(expectedSignature, "hex");
    const suppliedBytes = Buffer.from(suppliedSignature, "hex");
    if (expectedBytes.length !== suppliedBytes.length) throw invalidProviderData();
    if (!timingSafeEqual(expectedBytes, suppliedBytes)) throw invalidProviderData();

    const providerReference = payload.trx_id;
    if (!Number.isSafeInteger(providerReference) || Number(providerReference) < 0) {
      throw invalidProviderData();
    }

    return {
      eventReference,
      providerReference: String(providerReference),
      state: callbackState(payload),
      amount: Number(payload.amount),
      channelFee: Number(payload.fee),
      occurredAt: new Date(timestampValue).toISOString(),
      raw: payload,
    };
  } catch (error) {
    if (error instanceof BillingError) throw error;
    throw invalidProviderData();
  }
}
