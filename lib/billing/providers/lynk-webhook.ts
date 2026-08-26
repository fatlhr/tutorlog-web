import {
  findLynkProductByTitle,
  findLynkProductByUuid,
  type LynkPackageCode,
} from "./lynk-products";

export const MAX_LYNK_WEBHOOK_BODY_BYTES = 64 * 1024;
export const MAX_LYNK_WEBHOOK_DEPTH = 12;

export type LynkWebhookMode = "disabled" | "capture" | "process";
export type LynkWebhookEnv = {
  LYNK_MERCHANT_KEY?: string;
  LYNK_WEBHOOK_ENABLED?: string;
  LYNK_WEBHOOK_CAPTURE_ONLY?: string;
};

export class LynkWebhookInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LynkWebhookInputError";
  }
}

export function resolveLynkWebhookEnv(
  cloudflareEnv: LynkWebhookEnv | undefined,
  fallbackEnv: LynkWebhookEnv,
): LynkWebhookEnv {
  return {
    LYNK_MERCHANT_KEY:
      cloudflareEnv?.LYNK_MERCHANT_KEY ?? fallbackEnv.LYNK_MERCHANT_KEY,
    LYNK_WEBHOOK_ENABLED:
      cloudflareEnv?.LYNK_WEBHOOK_ENABLED ?? fallbackEnv.LYNK_WEBHOOK_ENABLED,
    LYNK_WEBHOOK_CAPTURE_ONLY:
      cloudflareEnv?.LYNK_WEBHOOK_CAPTURE_ONLY ?? fallbackEnv.LYNK_WEBHOOK_CAPTURE_ONLY,
  };
}

function describeFlag(value: string | undefined): "true" | "missing" | "other" {
  if (value === undefined) return "missing";
  return value === "true" ? "true" : "other";
}

export function describeLynkWebhookConfig(
  cloudflareContextAvailable: boolean,
  env: LynkWebhookEnv,
) {
  return {
    cloudflareContext: cloudflareContextAvailable ? "available" : "unavailable",
    merchantKey: env.LYNK_MERCHANT_KEY ? "available" : "missing",
    enabled: describeFlag(env.LYNK_WEBHOOK_ENABLED),
    captureOnly: describeFlag(env.LYNK_WEBHOOK_CAPTURE_ONLY),
  };
}

export function getLynkWebhookMode(env: LynkWebhookEnv): LynkWebhookMode {
  if (env.LYNK_WEBHOOK_ENABLED !== "true") return "disabled";
  return env.LYNK_WEBHOOK_CAPTURE_ONLY === "true" ? "capture" : "process";
}

function bodyTooLarge(): LynkWebhookInputError {
  return new LynkWebhookInputError("Lynk webhook body too large");
}

export async function readLynkWebhookBody(request: Request): Promise<string> {
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength)) {
    const byteLength = Number(declaredLength);
    if (!Number.isSafeInteger(byteLength) || byteLength > MAX_LYNK_WEBHOOK_BODY_BYTES) {
      throw bodyTooLarge();
    }
  }

  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    totalBytes += value.byteLength;
    if (totalBytes > MAX_LYNK_WEBHOOK_BODY_BYTES) {
      await reader.cancel();
      throw bodyTooLarge();
    }
    chunks.push(value);
  }

  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(body);
  } catch {
    throw new LynkWebhookInputError("Lynk webhook body contains invalid UTF-8");
  }
}

function assertJsonDepth(value: unknown, depth: number): void {
  if (depth > MAX_LYNK_WEBHOOK_DEPTH) {
    throw new LynkWebhookInputError("Lynk webhook JSON is too deep");
  }

  if (Array.isArray(value)) {
    for (const item of value) assertJsonDepth(item, depth + 1);
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value)) assertJsonDepth(child, depth + 1);
  }
}

export function parseLynkWebhookJson(rawBody: string): Record<string, unknown> {
  if (Buffer.byteLength(rawBody, "utf8") > MAX_LYNK_WEBHOOK_BODY_BYTES) {
    throw bodyTooLarge();
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    throw new LynkWebhookInputError("Lynk webhook contains invalid JSON");
  }

  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new LynkWebhookInputError("Lynk webhook JSON must be an object");
  }

  assertJsonDepth(payload, 0);
  return payload as Record<string, unknown>;
}

const PUBLIC_PRODUCT_TITLES = new Set([
  "TutorLog Plus — 30 Hari",
  "TutorLog Plus — 12 Bulan",
  "TutorLog Plus — Selamanya",
  "TutorLog Plus — Selamanya, bayar sekali di awal",
]);

const SAFE_NUMBER_KEYS = new Set([
  "amount",
  "affiliate",
  "conveniencefee",
  "discount",
  "grandtotal",
  "price",
  "qty",
  "quantity",
  "totaladdon",
  "totalitem",
  "totalprice",
  "totalshipping",
  "unitprice",
]);

function normalizedKey(key: string): string {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSensitiveKey(key: string): boolean {
  return [
    "email",
    "key",
    "messageid",
    "name",
    "phone",
    "refid",
    "secret",
    "signature",
    "token",
  ].some((part) => key.includes(part));
}

function isSafeProductIdentifier(path: readonly string[], key: string): boolean {
  if (key === "productid" || key === "productuuid" || key === "itemid" || key === "itemuuid") {
    return true;
  }

  const parentPath = path.slice(0, -1).map(normalizedKey);
  return (key === "id" || key === "uuid")
    && parentPath.some((part) => part === "item" || part === "items" || part === "product");
}

function describeValue(value: unknown, path: readonly string[]): unknown {
  if (value === null) return { type: "null" };

  if (Array.isArray(value)) {
    return {
      type: "array",
      length: value.length,
      items: value.map((item, index) => describeValue(item, [...path, String(index)])),
    };
  }

  if (typeof value === "object") {
    return {
      type: "object",
      fields: Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          describeValue(child, [...path, key]),
        ]),
      ),
    };
  }

  const key = normalizedKey(path.at(-1) ?? "");
  if (typeof value === "string") {
    if (isSensitiveKey(key)) return { type: "string", redacted: true };
    if (
      value === "payment.received"
      || PUBLIC_PRODUCT_TITLES.has(value)
      || isSafeProductIdentifier(path, key)
    ) {
      return { type: "string", value };
    }
    return { type: "string", length: value.length, redacted: true };
  }

  if (typeof value === "number") {
    return SAFE_NUMBER_KEYS.has(key)
      ? { type: "number", value }
      : { type: "number" };
  }

  if (typeof value === "boolean") return { type: "boolean", value };
  return { type: typeof value };
}

export function describeRedactedLynkPayload(payload: unknown): unknown {
  return describeValue(payload, []);
}

export type LynkParserReviewReason =
  | "customer_email_missing"
  | "unknown_product"
  | "amount_mismatch"
  | "unsupported_order";

export type ParsedLynkPaymentReceived = {
  eventKey: string;
  providerReference: string;
  customerEmail: string | null;
  productCode: LynkPackageCode | null;
  productAmount: number | null;
  grandTotal: number;
  occurredAt: string;
  reviewReason: LynkParserReviewReason | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function webhookRecord(value: unknown, field: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new LynkWebhookInputError(`Lynk webhook ${field} is invalid`);
  }
  return value;
}

function webhookText(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0 || value !== value.trim()) {
    throw new LynkWebhookInputError(`Lynk webhook ${field} is invalid`);
  }
  return value;
}

function webhookInteger(value: unknown, field: string): number {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string" && /^(?:0|[1-9]\d*)$/.test(value)) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) return parsed;
  }

  throw new LynkWebhookInputError(`Lynk webhook ${field} is invalid`);
}

function webhookTimestamp(value: unknown): string {
  if (
    typeof value !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
  ) {
    throw new LynkWebhookInputError("Lynk webhook timestamp is invalid");
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  const parsed = new Date(hasTimezone ? value : `${value}Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new LynkWebhookInputError("Lynk webhook timestamp is invalid");
  }
  return parsed.toISOString();
}

function customerEmail(messageData: Record<string, unknown>): string | null {
  if (!isRecord(messageData.customer)) return null;
  const email = messageData.customer.email;
  if (typeof email !== "string" || email.trim().length === 0) return null;
  return email.trim().toLowerCase();
}

function reviewResult(
  base: Omit<ParsedLynkPaymentReceived, "productCode" | "productAmount" | "reviewReason">,
  reviewReason: LynkParserReviewReason,
  productCode: LynkPackageCode | null = null,
  productAmount: number | null = null,
): ParsedLynkPaymentReceived {
  return {
    ...base,
    productCode,
    productAmount,
    reviewReason,
  };
}

export function parseLynkPaymentReceived(
  payload: Record<string, unknown>,
): ParsedLynkPaymentReceived {
  if (payload.event !== "payment.received") {
    throw new LynkWebhookInputError("Lynk webhook must be payment.received");
  }

  const data = webhookRecord(payload.data, "data");
  if (data.message_action !== "SUCCESS" || data.message_code !== "0") {
    throw new LynkWebhookInputError("Lynk webhook payment is not successful");
  }

  const messageData = webhookRecord(data.message_data, "message_data");
  const totals = webhookRecord(messageData.totals, "totals");
  const email = customerEmail(messageData);
  const base = {
    eventKey: webhookText(data.message_id, "message_id"),
    providerReference: webhookText(messageData.refId, "refId"),
    customerEmail: email,
    grandTotal: webhookInteger(totals.grandTotal, "grandTotal"),
    occurredAt: webhookTimestamp(messageData.createdAt),
  };

  if (!Array.isArray(messageData.items) || messageData.items.length !== 1) {
    return reviewResult(base, "unsupported_order");
  }

  const item = messageData.items[0];
  if (!isRecord(item)) return reviewResult(base, "unsupported_order");

  let quantity: number;
  let totalItem: number;
  let totalAddon: number;
  let discount: number;
  let totalShipping: number;
  try {
    quantity = webhookInteger(item.qty, "item qty");
    totalItem = webhookInteger(totals.totalItem, "totalItem");
    totalAddon = webhookInteger(totals.totalAddon, "totalAddon");
    discount = webhookInteger(totals.discount, "discount");
    totalShipping = webhookInteger(totals.totalShipping, "totalShipping");
  } catch {
    return reviewResult(base, "unsupported_order");
  }

  if (
    quantity !== 1
    || totalItem !== 1
    || !Array.isArray(item.addons)
    || item.addons.length !== 0
    || totalAddon !== 0
    || discount !== 0
    || totalShipping !== 0
  ) {
    return reviewResult(base, "unsupported_order");
  }

  let itemAmount: number;
  let totalPrice: number;
  try {
    itemAmount = webhookInteger(item.price, "item price");
    totalPrice = webhookInteger(totals.totalPrice, "totalPrice");
  } catch {
    return reviewResult(base, "amount_mismatch");
  }

  const itemUuid = typeof item.uuid === "string" ? item.uuid : "";
  const title = typeof item.title === "string" ? item.title : "";
  const product = findLynkProductByUuid(itemUuid) ?? findLynkProductByTitle(title);
  if (!product) {
    return reviewResult(base, "unknown_product", null, itemAmount);
  }

  if (itemAmount !== product.amount || totalPrice !== product.amount) {
    return reviewResult(base, "amount_mismatch", product.code, itemAmount);
  }

  if (!email) {
    return reviewResult(
      base,
      "customer_email_missing",
      product.code,
      itemAmount,
    );
  }

  return {
    ...base,
    productCode: product.code,
    productAmount: itemAmount,
    reviewReason: null,
  };
}
