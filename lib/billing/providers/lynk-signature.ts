import { createHash, timingSafeEqual } from "node:crypto";

export type LynkSignedFields = {
  grandTotalText: string;
  refId: string;
  messageId: string;
};

export class LynkSignatureInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LynkSignatureInputError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function signedText(value: unknown): string {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw new LynkSignatureInputError("Lynk webhook signed fields are invalid");
  }
  return value;
}

export function normalizeLynkGrandTotal(value: unknown): string {
  if (
    typeof value === "number"
    && Number.isSafeInteger(value)
    && value >= 0
  ) {
    return String(value);
  }

  if (typeof value === "string" && /^(?:0|[1-9]\d*)$/.test(value)) {
    return value;
  }

  throw new LynkSignatureInputError("Lynk webhook grandTotal is invalid");
}

export function extractLynkSignedFields(payload: unknown): LynkSignedFields {
  if (!isRecord(payload) || !isRecord(payload.data)) {
    throw new LynkSignatureInputError("Lynk webhook signed fields are missing");
  }

  const data = payload.data;
  if (!isRecord(data.message_data)) {
    throw new LynkSignatureInputError("Lynk webhook signed fields are missing");
  }

  const messageData = data.message_data;
  if (!isRecord(messageData.totals)) {
    throw new LynkSignatureInputError("Lynk webhook signed fields are missing");
  }

  try {
    return {
      grandTotalText: normalizeLynkGrandTotal(messageData.totals.grandTotal),
      refId: signedText(messageData.refId),
      messageId: signedText(data.message_id),
    };
  } catch (error) {
    if (error instanceof LynkSignatureInputError) throw error;
    throw new LynkSignatureInputError("Lynk webhook signed fields are invalid");
  }
}

export function calculateLynkSignature(
  fields: LynkSignedFields,
  merchantKey: string,
): string {
  if (merchantKey.length === 0) {
    throw new LynkSignatureInputError("Lynk merchant key is missing");
  }

  const signedInput = fields.grandTotalText
    + fields.refId
    + fields.messageId
    + merchantKey;

  return createHash("sha256").update(signedInput, "utf8").digest("hex");
}

export function verifyLynkSignature(
  fields: LynkSignedFields,
  receivedSignature: string,
  merchantKey: string,
): boolean {
  if (!/^[a-f0-9]{64}$/.test(receivedSignature)) return false;

  const expected = Buffer.from(calculateLynkSignature(fields, merchantKey), "hex");
  const received = Buffer.from(receivedSignature, "hex");
  return timingSafeEqual(expected, received);
}
