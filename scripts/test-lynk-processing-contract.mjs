import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const routeUrl = new URL("../app/api/webhooks/lynk/route.ts", import.meta.url);
const serviceUrl = new URL(
  "../lib/billing/server/lynk-webhook.ts",
  import.meta.url,
);
const webhookHelperUrl = new URL(
  "../lib/billing/providers/lynk-webhook.ts",
  import.meta.url,
);
const signatureUrl = new URL(
  "../lib/billing/providers/lynk-signature.ts",
  import.meta.url,
);
const productsUrl = new URL(
  "../lib/billing/providers/lynk-products.ts",
  import.meta.url,
);
const retryMigrationUrl = new URL(
  "../supabase/migrations/202608260001_lynk_processing_retry.sql",
  import.meta.url,
);

const [
  routeSource,
  serviceSource,
  webhookHelperSource,
  signatureSource,
  productsSource,
  retryMigrationSource,
] = await Promise.all([
  readFile(routeUrl, "utf8"),
  readFile(serviceUrl, "utf8").catch(() => ""),
  readFile(webhookHelperUrl, "utf8"),
  readFile(signatureUrl, "utf8"),
  readFile(productsUrl, "utf8"),
  readFile(retryMigrationUrl, "utf8").catch(() => ""),
]);

assert.match(serviceSource, /^import "server-only";/);
assert.match(serviceSource, /createAdminClient/);
assert.match(
  serviceSource,
  /admin\.rpc\("process_lynk_payment_received"/,
);
assert.match(serviceSource, /p_event_key: payment\.eventKey/);
assert.match(serviceSource, /p_provider_reference: payment\.providerReference/);
assert.match(serviceSource, /p_customer_email: payment\.customerEmail/);
assert.match(serviceSource, /p_product_code: payment\.productCode/);
assert.match(serviceSource, /p_product_amount: payment\.productAmount/);
assert.match(serviceSource, /p_grand_total: payment\.grandTotal/);
assert.match(serviceSource, /p_occurred_at: payment\.occurredAt/);
assert.match(serviceSource, /p_payload: payload/);
assert.match(serviceSource, /p_review_reason: payment\.reviewReason/);
assert.doesNotMatch(serviceSource, /console\./);

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

const adminStub = toDataUrl(`
  export function createAdminClient() {
    return {
      rpc: async (name, args) => {
        globalThis.__lynkRpcCalls.push({ name, args });
        return globalThis.__lynkRpcResponse;
      },
    };
  }
`);
const testableServiceSource = serviceSource
  .replace(/^import "server-only";\s*/, "")
  .replace(
    'from "@/lib/supabase/admin";',
    `from "${adminStub}";`,
  );
const service = await import(
  toDataUrl(transpile(testableServiceSource, "lynk-webhook.ts")),
);

const payment = {
  eventKey: "message-test-001",
  providerReference: "reference-test-001",
  customerEmail: "qa@example.invalid",
  productCode: "plus_30d",
  productAmount: 19000,
  grandTotal: 18500,
  occurredAt: "2026-08-26T10:00:00.000Z",
  reviewReason: null,
};
const payload = { event: "payment.received", qa: true };

globalThis.__lynkRpcCalls = [];
globalThis.__lynkRpcResponse = {
  data: { status: "processed" },
  error: null,
};
assert.deepEqual(
  await service.processLynkPaymentReceived(payment, payload),
  { status: "processed", reviewReason: null },
);
assert.deepEqual(globalThis.__lynkRpcCalls, [{
  name: "process_lynk_payment_received",
  args: {
    p_event_key: payment.eventKey,
    p_provider_reference: payment.providerReference,
    p_customer_email: payment.customerEmail,
    p_product_code: payment.productCode,
    p_product_amount: payment.productAmount,
    p_grand_total: payment.grandTotal,
    p_occurred_at: payment.occurredAt,
    p_payload: payload,
    p_review_reason: payment.reviewReason,
  },
}]);

for (const status of ["duplicate", "needs_review"]) {
  globalThis.__lynkRpcResponse = {
    data: {
      status,
      review_reason: status === "needs_review" ? "user_not_found" : undefined,
    },
    error: null,
  };
  assert.deepEqual(
    await service.processLynkPaymentReceived(payment, payload),
    {
      status,
      reviewReason: status === "needs_review" ? "user_not_found" : null,
    },
  );
}

globalThis.__lynkRpcResponse = {
  data: null,
  error: { message: "private database error" },
};
await assert.rejects(
  service.processLynkPaymentReceived(payment, payload),
  (error) => {
    assert.equal(error.name, "LynkWebhookProcessingError");
    assert.doesNotMatch(error.message, /private database error/);
    return true;
  },
);

globalThis.__lynkRpcResponse = {
  data: { status: "unexpected" },
  error: null,
};
await assert.rejects(
  service.processLynkPaymentReceived(payment, payload),
  { name: "LynkWebhookProcessingError" },
);

globalThis.__lynkRpcResponse = {
  data: { status: "needs_review", review_reason: "processing_error" },
  error: null,
};
await assert.rejects(
  service.processLynkPaymentReceived(payment, payload),
  { name: "LynkWebhookProcessingError" },
);

assert.match(
  retryMigrationSource,
  /alter function public\.process_lynk_payment_received[\s\S]*rename to process_lynk_payment_received_once/i,
);
assert.match(
  retryMigrationSource,
  /create function public\.process_lynk_payment_received\(/i,
);
assert.match(retryMigrationSource, /pg_advisory_xact_lock/i);
assert.match(
  retryMigrationSource,
  /review_reason = 'processing_error'[\s\S]*purchase_id is not null[\s\S]*payment_id is not null[\s\S]*entitlement_grant_id is not null/i,
);
assert.match(
  retryMigrationSource,
  /delete from public\.billing_lynk_webhook_inbox/i,
);
for (const binding of [
  "event_key",
  "provider_reference",
  "customer_email",
  "product_code",
  "product_amount",
  "grand_total",
  "occurred_at",
  "payload",
]) {
  assert.match(
    retryMigrationSource,
    new RegExp(`${binding} is distinct from`, "i"),
    `processing retry must bind ${binding}`,
  );
}
assert.match(
  retryMigrationSource,
  /public\.process_lynk_payment_received_once\(/i,
);
assert.match(
  retryMigrationSource,
  /revoke all on function public\.process_lynk_payment_received_once[\s\S]*from public, anon, authenticated, service_role/i,
);

assert.doesNotMatch(routeSource, /WEBHOOK_NOT_READY/);
assert.match(routeSource, /if \(!runtimeEnv\.LYNK_MERCHANT_KEY\)/);
assert.match(routeSource, /request\.headers\.get\("x-lynk-signature"\)/);
assert.match(routeSource, /extractLynkSignedFields\(payload\)/);
assert.match(routeSource, /verifyLynkSignature/);
assert.match(routeSource, /parseLynkPaymentReceived\(payload\)/);
assert.match(
  routeSource,
  /import\(\s*"@\/lib\/billing\/server\/lynk-webhook"\s*\)/,
);
assert.match(routeSource, /processLynkPaymentReceived\(payment, payload\)/);
assert.match(
  routeSource,
  /status: result\.status === "needs_review" \? "review" : "ok"/,
);
assert.match(routeSource, /status: "captured"/);
assert.match(routeSource, /status: 200/);
assert.match(routeSource, /status: 400/);
assert.match(routeSource, /status: 401/);
assert.match(routeSource, /status: 503/);
assert.doesNotMatch(routeSource, /console\.(?:log|info|warn|error)\([^\n]*(?:rawBody|payload|email|phone|refId|signature)/i);
assert.doesNotMatch(
  routeSource,
  /NextResponse\.json\(\s*(?:rawBody|payload|payment|signedFields|receivedSignature)/,
);

const parseIndex = routeSource.indexOf("parseLynkWebhookJson(rawBody)");
const signedFieldsIndex = routeSource.indexOf("extractLynkSignedFields(payload)");
const verifyIndex = routeSource.indexOf("verifyLynkSignature(");
const paymentParseIndex = routeSource.indexOf("parseLynkPaymentReceived(payload)");
const rpcIndex = routeSource.indexOf("processLynkPaymentReceived(payment, payload)");
assert.ok(parseIndex >= 0 && parseIndex < signedFieldsIndex);
assert.ok(signedFieldsIndex < verifyIndex);
assert.ok(verifyIndex < paymentParseIndex);
assert.ok(paymentParseIndex < rpcIndex);

const productsDataUrl = toDataUrl(transpile(productsSource, "lynk-products.ts"));
const webhookHelperDataUrl = toDataUrl(transpile(
  webhookHelperSource.replace(
    'from "./lynk-products";',
    `from "${productsDataUrl}";`,
  ),
  "lynk-webhook.ts",
));
const signatureDataUrl = toDataUrl(transpile(signatureSource, "lynk-signature.ts"));
const cloudflareStubUrl = toDataUrl(`
  export function getCloudflareContext() {
    if (!globalThis.__lynkRouteEnv) throw new Error("Cloudflare context unavailable");
    return { env: globalThis.__lynkRouteEnv };
  }
`);
const nextResponseStubUrl = toDataUrl(`
  export const NextResponse = {
    json(body, init = {}) {
      return new Response(JSON.stringify(body), {
        status: init.status ?? 200,
        headers: { "content-type": "application/json" },
      });
    },
  };
`);
const routeServiceStubUrl = toDataUrl(`
  globalThis.__lynkRouteServiceModuleLoads += 1;
  export async function processLynkPaymentReceived(payment, payload) {
    globalThis.__lynkRouteServiceCalls.push({ payment, payload });
    if (globalThis.__lynkRouteServiceResponse instanceof Error) {
      throw globalThis.__lynkRouteServiceResponse;
    }
    return globalThis.__lynkRouteServiceResponse;
  }
`);

const testableRouteSource = routeSource
  .replace(
    'from "@opennextjs/cloudflare";',
    `from "${cloudflareStubUrl}";`,
  )
  .replace(
    'from "next/server";',
    `from "${nextResponseStubUrl}";`,
  )
  .replace(
    'from "@/lib/billing/providers/lynk-signature";',
    `from "${signatureDataUrl}";`,
  )
  .replace(
    'from "@/lib/billing/providers/lynk-webhook";',
    `from "${webhookHelperDataUrl}";`,
  )
  .replace(
    '"@/lib/billing/server/lynk-webhook"',
    `"${routeServiceStubUrl}"`,
  );
globalThis.__lynkRouteServiceModuleLoads = 0;
const route = await import(
  toDataUrl(transpile(testableRouteSource, "route.ts")),
);

const merchantKey = "merchant-test-key";
const routePayload = {
  event: "payment.received",
  data: {
    message_action: "SUCCESS",
    message_code: "0",
    message_data: {
      createdAt: "2026-08-26T10:00:00Z",
      customer: {
        email: "route-qa@example.invalid",
        name: "Private Customer",
        phone: "+628000000000",
      },
      items: [{
        addons: [],
        customer: { id: "private-customer-id" },
        price: 19000,
        qty: 1,
        title: "TutorLog Plus — 30 Hari",
        uuid: "product-public-001",
      }],
      refId: "private-reference-001",
      totals: {
        affiliate: 0,
        convenienceFee: 0,
        discount: 0,
        grandTotal: 19000,
        totalAddon: 0,
        totalItem: 1,
        totalPrice: 19000,
        totalShipping: 0,
      },
    },
    message_id: "private-message-001",
  },
};
const validSignature = createHash("sha256")
  .update(`19000private-reference-001private-message-001${merchantKey}`)
  .digest("hex");

function routeRequest(body, signature = validSignature) {
  const headers = new Headers({ "content-type": "application/json" });
  if (signature !== null) headers.set("x-lynk-signature", signature);
  return new Request("https://example.com/api/webhooks/lynk", {
    method: "POST",
    headers,
    body,
  });
}

async function responseBody(response) {
  return { status: response.status, body: await response.json() };
}

const originalConsoleInfo = console.info;
const routeLogs = [];
console.info = (...args) => routeLogs.push(args);
try {
  globalThis.__lynkRouteServiceCalls = [];
  globalThis.__lynkRouteEnv = {
    LYNK_MERCHANT_KEY: merchantKey,
    LYNK_WEBHOOK_ENABLED: "false",
    LYNK_WEBHOOK_CAPTURE_ONLY: "true",
  };
  assert.deepEqual(
    await responseBody(await route.POST(routeRequest(JSON.stringify(routePayload)))),
    {
      status: 503,
      body: {
        error: { code: "WEBHOOK_DISABLED", message: "Webhook belum aktif" },
      },
    },
  );

  globalThis.__lynkRouteEnv = {
    LYNK_WEBHOOK_ENABLED: "true",
    LYNK_WEBHOOK_CAPTURE_ONLY: "true",
  };
  assert.equal(
    (await route.POST(routeRequest(JSON.stringify(routePayload)))).status,
    503,
  );

  globalThis.__lynkRouteEnv = {
    LYNK_MERCHANT_KEY: merchantKey,
    LYNK_WEBHOOK_ENABLED: "true",
    LYNK_WEBHOOK_CAPTURE_ONLY: "true",
  };
  assert.equal((await route.POST(routeRequest("not-json"))).status, 400);
  assert.equal(
    (await route.POST(routeRequest(JSON.stringify(routePayload), null))).status,
    401,
  );
  assert.equal(
    (await route.POST(routeRequest(JSON.stringify(routePayload), "0".repeat(64)))).status,
    401,
  );
  assert.equal(
    (await route.POST(routeRequest("x".repeat(64 * 1024 + 1)))).status,
    400,
  );
  assert.deepEqual(
    await responseBody(await route.POST(routeRequest(JSON.stringify(routePayload)))),
    { status: 200, body: { status: "captured" } },
  );
  assert.equal(globalThis.__lynkRouteServiceCalls.length, 0);
  assert.equal(globalThis.__lynkRouteServiceModuleLoads, 0);

  globalThis.__lynkRouteEnv.LYNK_WEBHOOK_CAPTURE_ONLY = "false";
  for (const [serviceResult, expectedBody] of [
    [{ status: "processed", reviewReason: null }, { status: "ok" }],
    [{ status: "duplicate", reviewReason: null }, { status: "ok" }],
    [{ status: "needs_review", reviewReason: "user_not_found" }, { status: "review" }],
  ]) {
    globalThis.__lynkRouteServiceResponse = serviceResult;
    assert.deepEqual(
      await responseBody(await route.POST(routeRequest(JSON.stringify(routePayload)))),
      { status: 200, body: expectedBody },
    );
  }
  assert.equal(globalThis.__lynkRouteServiceModuleLoads, 1);

  globalThis.__lynkRouteServiceResponse = new Error("private database error");
  assert.equal(
    (await route.POST(routeRequest(JSON.stringify(routePayload)))).status,
    503,
  );
} finally {
  console.info = originalConsoleInfo;
}

const renderedRouteLogs = JSON.stringify(routeLogs);
for (const sensitiveValue of [
  merchantKey,
  "route-qa@example.invalid",
  "Private Customer",
  "+628000000000",
  "private-customer-id",
  "private-reference-001",
  "private-message-001",
  validSignature,
  "private database error",
]) {
  assert.equal(
    renderedRouteLogs.includes(sensitiveValue),
    false,
    `route logs exposed ${sensitiveValue}`,
  );
}

console.log("Lynk processing contract passed");
