import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const helperUrl = new URL("../lib/billing/providers/lynk-webhook.ts", import.meta.url);
const routeUrl = new URL("../app/api/webhooks/lynk/route.ts", import.meta.url);

const [helperSource, routeSource] = await Promise.all([
  readFile(helperUrl, "utf8"),
  readFile(routeUrl, "utf8"),
]);

assert.match(helperSource, /export const MAX_LYNK_WEBHOOK_BODY_BYTES = 64 \* 1024/);
assert.match(helperSource, /export const MAX_LYNK_WEBHOOK_DEPTH = 12/);
assert.match(helperSource, /export function getLynkWebhookMode/);
assert.match(helperSource, /export function resolveLynkWebhookEnv/);
assert.match(helperSource, /export function describeLynkWebhookConfig/);
assert.match(helperSource, /export async function readLynkWebhookBody/);
assert.match(helperSource, /export function parseLynkWebhookJson/);
assert.match(helperSource, /export function describeRedactedLynkPayload/);

function transpile(source, fileName) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName,
  }).outputText;
}

function toDataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

const helper = await import(toDataUrl(transpile(helperSource, "lynk-webhook.ts")));

assert.deepEqual(
  helper.resolveLynkWebhookEnv(
    {
      LYNK_MERCHANT_KEY: "cloudflare-secret",
      LYNK_WEBHOOK_ENABLED: "true",
      LYNK_WEBHOOK_CAPTURE_ONLY: "true",
    },
    {
      LYNK_MERCHANT_KEY: "fallback-secret",
      LYNK_WEBHOOK_ENABLED: "false",
      LYNK_WEBHOOK_CAPTURE_ONLY: "false",
    },
  ),
  {
    LYNK_MERCHANT_KEY: "cloudflare-secret",
    LYNK_WEBHOOK_ENABLED: "true",
    LYNK_WEBHOOK_CAPTURE_ONLY: "true",
  },
);
assert.deepEqual(
  helper.resolveLynkWebhookEnv(undefined, {
    LYNK_MERCHANT_KEY: "fallback-secret",
    LYNK_WEBHOOK_ENABLED: "true",
    LYNK_WEBHOOK_CAPTURE_ONLY: "false",
  }),
  {
    LYNK_MERCHANT_KEY: "fallback-secret",
    LYNK_WEBHOOK_ENABLED: "true",
    LYNK_WEBHOOK_CAPTURE_ONLY: "false",
  },
);
assert.deepEqual(
  helper.describeLynkWebhookConfig(false, {
    LYNK_MERCHANT_KEY: undefined,
    LYNK_WEBHOOK_ENABLED: "unexpected-value",
    LYNK_WEBHOOK_CAPTURE_ONLY: undefined,
  }),
  {
    cloudflareContext: "unavailable",
    merchantKey: "missing",
    enabled: "other",
    captureOnly: "missing",
  },
);
assert.doesNotMatch(
  JSON.stringify(helper.describeLynkWebhookConfig(true, {
    LYNK_MERCHANT_KEY: "merchant-secret-that-must-not-appear",
    LYNK_WEBHOOK_ENABLED: "unexpected-value",
    LYNK_WEBHOOK_CAPTURE_ONLY: "true",
  })),
  /unexpected-value/,
);
assert.doesNotMatch(
  JSON.stringify(helper.describeLynkWebhookConfig(true, {
    LYNK_MERCHANT_KEY: "merchant-secret-that-must-not-appear",
  })),
  /merchant-secret-that-must-not-appear/,
);

assert.equal(helper.getLynkWebhookMode({}), "disabled");
assert.equal(
  helper.getLynkWebhookMode({
    LYNK_WEBHOOK_ENABLED: "false",
    LYNK_WEBHOOK_CAPTURE_ONLY: "true",
  }),
  "disabled",
);
assert.equal(
  helper.getLynkWebhookMode({
    LYNK_WEBHOOK_ENABLED: "true",
    LYNK_WEBHOOK_CAPTURE_ONLY: "true",
  }),
  "capture",
);
assert.equal(
  helper.getLynkWebhookMode({
    LYNK_WEBHOOK_ENABLED: "true",
    LYNK_WEBHOOK_CAPTURE_ONLY: "false",
  }),
  "process",
);

assert.equal(
  await helper.readLynkWebhookBody(new Request("https://example.com", {
    method: "POST",
    body: "{\"ok\":true}",
  })),
  "{\"ok\":true}",
);
await assert.rejects(
  helper.readLynkWebhookBody(new Request("https://example.com", {
    method: "POST",
    body: "x".repeat(64 * 1024 + 1),
  })),
  /body too large/i,
);
await assert.rejects(
  helper.readLynkWebhookBody(new Request("https://example.com", {
    method: "POST",
    body: new Uint8Array([0xc3, 0x28]),
  })),
  /invalid utf-8/i,
);

const payload = {
  event: "payment.received",
  data: {
    message_action: "SUCCESS",
    message_code: "0",
    message_data: {
      createdAt: "2026-08-26T10:00:00",
      customer: {
        name: "Fatih Example",
        email: "fatih@example.com",
        phone: "+628123456789",
      },
      items: [{
        uuid: "product-public-001",
        title: "TutorLog Plus — 30 Hari",
        price: 19000,
        qty: 1,
      }],
      refId: "ref-real-001",
      totals: {
        grandTotal: 19000,
        totalItem: 1,
        totalPrice: 19000,
      },
    },
    message_id: "message-real-001",
    secretNote: "do-not-expose",
  },
};

assert.deepEqual(helper.parseLynkWebhookJson(JSON.stringify(payload)), payload);

assert.throws(
  () => helper.parseLynkWebhookJson("x".repeat(64 * 1024 + 1)),
  /body too large/i,
);
assert.throws(
  () => helper.parseLynkWebhookJson("not-json"),
  /invalid json/i,
);
assert.throws(
  () => helper.parseLynkWebhookJson(JSON.stringify(null)),
  /object/i,
);

let tooDeep = { value: true };
for (let index = 0; index < 13; index += 1) {
  tooDeep = { nested: tooDeep };
}
assert.throws(
  () => helper.parseLynkWebhookJson(JSON.stringify(tooDeep)),
  /too deep/i,
);

const summary = helper.describeRedactedLynkPayload(payload);
const renderedSummary = JSON.stringify(summary);

assert.match(renderedSummary, /payment\.received/);
assert.match(renderedSummary, /19000/);
assert.match(renderedSummary, /TutorLog Plus — 30 Hari/);
assert.match(renderedSummary, /product-public-001/);
for (const sensitiveValue of [
  "message-real-001",
  "ref-real-001",
  "Fatih Example",
  "fatih@example.com",
  "+628123456789",
  "do-not-expose",
]) {
  assert.doesNotMatch(renderedSummary, new RegExp(sensitiveValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
}

assert.match(routeSource, /export async function POST\(request: Request\)/);
assert.match(routeSource, /getCloudflareContext/);
assert.match(routeSource, /resolveLynkWebhookEnv/);
assert.match(routeSource, /describeLynkWebhookConfig/);
assert.match(routeSource, /console\.info\(\s*"lynk_webhook_config"/);
assert.match(routeSource, /getLynkWebhookMode\(runtimeEnv\)/);
assert.match(routeSource, /readLynkWebhookBody\(request\)/);
assert.match(routeSource, /describeRedactedLynkPayload\(payload\)/);
assert.match(routeSource, /status: "captured"/);
assert.match(routeSource, /status: 200/);
assert.match(routeSource, /status: 400/);
assert.match(routeSource, /status: 503/);
assert.doesNotMatch(routeSource, /createAdminClient|supabase|entitlement/i);
assert.doesNotMatch(routeSource, /console\.(?:log|info|warn|error)\([^\n]*rawBody/);
assert.doesNotMatch(routeSource, /NextResponse\.json\([^)]*(?:payload|summary)/);

console.log("Lynk webhook capture contract passed");
