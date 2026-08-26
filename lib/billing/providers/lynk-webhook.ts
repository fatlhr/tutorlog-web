export const MAX_LYNK_WEBHOOK_BODY_BYTES = 64 * 1024;
export const MAX_LYNK_WEBHOOK_DEPTH = 12;

export type LynkWebhookMode = "disabled" | "capture" | "process";
export type LynkWebhookEnv = {
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
    LYNK_WEBHOOK_ENABLED:
      cloudflareEnv?.LYNK_WEBHOOK_ENABLED ?? fallbackEnv.LYNK_WEBHOOK_ENABLED,
    LYNK_WEBHOOK_CAPTURE_ONLY:
      cloudflareEnv?.LYNK_WEBHOOK_CAPTURE_ONLY ?? fallbackEnv.LYNK_WEBHOOK_CAPTURE_ONLY,
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
  "discount",
  "grandtotal",
  "price",
  "qty",
  "quantity",
  "totalitem",
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
