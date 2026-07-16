import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const providerUrl = new URL("../lib/billing/providers/provider.ts", import.meta.url);
const signatureUrl = new URL("../lib/billing/providers/ipaymu-signature.ts", import.meta.url);
const ipaymuUrl = new URL("../lib/billing/providers/ipaymu.ts", import.meta.url);
const indexUrl = new URL("../lib/billing/providers/index.ts", import.meta.url);
const errorsUrl = new URL("../lib/billing/errors.ts", import.meta.url);

const [providerSource, signatureSource, ipaymuSource, indexSource, errorsSource] =
  await Promise.all([
    readFile(providerUrl, "utf8"),
    readFile(signatureUrl, "utf8"),
    readFile(ipaymuUrl, "utf8"),
    readFile(indexUrl, "utf8"),
    readFile(errorsUrl, "utf8"),
  ]);

for (const source of [providerSource, signatureSource, ipaymuSource, indexSource]) {
  assert.match(source, /^import "server-only";/);
}
assert.match(providerSource, /export interface PaymentProvider/);
assert.match(signatureSource, /from "node:crypto"/);
assert.match(signatureSource, /timingSafeEqual/);
assert.match(ipaymuSource, /AbortSignal\.timeout\(10_?000\)/);
assert.match(ipaymuSource, /\/api\/v2\/payment/);
assert.match(ipaymuSource, /const rawBody = JSON\.stringify\(requestPayload\)/);
assert.doesNotMatch(ipaymuSource, /paymentMethod\s*:/);
assert.doesNotMatch(ipaymuSource, /paymentChannel\s*:/);
for (const envName of [
  "BILLING_PAYMENT_PROVIDER_ENABLED",
  "IPAYMU_BASE_URL",
  "IPAYMU_VA",
  "IPAYMU_API_KEY",
  "IPAYMU_CALLBACK_URL",
  "IPAYMU_RETURN_URL",
]) {
  assert.ok(indexSource.includes(envName), `missing readiness input ${envName}`);
}
assert.match(indexSource, /BILLING_PAYMENT_PROVIDER_ENABLED\s*===\s*"true"/);

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

function withoutServerOnly(source) {
  return source.replace(/^import "server-only";\s*/, "");
}

const compiledErrorsUrl = toDataUrl(transpile(errorsSource, "errors.ts"));
const compiledSignatureUrl = toDataUrl(
  transpile(withoutServerOnly(signatureSource), "ipaymu-signature.ts")
    .replaceAll('"@/lib/billing/errors"', `"${compiledErrorsUrl}"`),
);
const compiledIpaymu = transpile(withoutServerOnly(ipaymuSource), "ipaymu.ts")
  .replaceAll('"@/lib/billing/errors"', `"${compiledErrorsUrl}"`)
  .replaceAll('"./ipaymu-signature"', `"${compiledSignatureUrl}"`);
const compiledIpaymuUrl = toDataUrl(compiledIpaymu);
const compiledIndex = transpile(withoutServerOnly(indexSource), "index.ts")
  .replaceAll('"@/lib/billing/errors"', `"${compiledErrorsUrl}"`)
  .replaceAll('"./ipaymu"', `"${compiledIpaymuUrl}"`);

const signature = await import(compiledSignatureUrl);
const ipaymu = await import(compiledIpaymuUrl);
const providers = await import(toDataUrl(compiledIndex));
const { BillingError } = await import(compiledErrorsUrl);

const va = "0000001171111111";
const apiKey = "test-api-key-do-not-use";
const timestamp = "20260716123045";
const requestBody = JSON.stringify({
  product: ["TutorLog Plus"],
  qty: [1],
  price: [19000],
  returnUrl: "https://example.test/billing/return",
  notifyUrl: "https://example.test/api/callback",
  referenceId: "purchase_test_001",
});
const expectedRequestSignature =
  "ceb1220dd66981367a727c40a306d524cdd90a92cd3eec6755004486ff1c9278";

assert.deepEqual(
  signature.createIpaymuRequestHeaders({
    method: "post",
    va,
    apiKey,
    timestamp,
    rawBody: requestBody,
  }),
  { va, signature: expectedRequestSignature, timestamp },
);
const reorderedBody = JSON.stringify({
  qty: [1],
  product: ["TutorLog Plus"],
  price: [19000],
  returnUrl: "https://example.test/billing/return",
  notifyUrl: "https://example.test/api/callback",
  referenceId: "purchase_test_001",
});
assert.notEqual(
  signature.createIpaymuRequestHeaders({
    method: "POST",
    va,
    apiKey,
    timestamp,
    rawBody: reorderedBody,
  }).signature,
  expectedRequestSignature,
);
assert.equal(
  signature.formatIpaymuTimestamp(new Date("2026-07-16T05:30:45.000Z")),
  "20260716053045",
);
assert.throws(() => signature.createIpaymuRequestHeaders({
  method: "POST",
  va,
  apiKey,
  timestamp: "20260230010101",
  rawBody: requestBody,
}), (error) => error instanceof BillingError && error.code === "PROVIDER_RESPONSE_INVALID");

const callbackPayload = {
  fee: "0",
  status_code: "1",
  buyer_note: "https://example.test/receipt",
  amount: "19000",
  is_escrow: "0",
  reference_id: "purchase_test_001",
  paid_off: "19000",
  payment_method: "qris",
  status: "berhasil",
  trx_id: "123456789",
  transaction_status_code: "1",
  signature: "body-signature-must-be-removed",
};
const expectedCanonicalCallback =
  '{"additional_info":[],"amount":"19000","buyer_note":"https:\\/\\/example.test\\/receipt","fee":"0","is_escrow":false,"paid_off":19000,"payment_method":"qris","reference_id":"purchase_test_001","status":"berhasil","status_code":1,"transaction_status_code":1,"trx_id":123456789}';
const expectedCallbackSignature =
  "fd537a430a503de64b98753de4dced8d3fd6324c269831dd9071014bcf0f4d0f";

assert.equal(
  signature.canonicalizeIpaymuCallback(callbackPayload),
  expectedCanonicalCallback,
);
assert.equal(
  signature.createIpaymuCallbackSignature(callbackPayload, va),
  expectedCallbackSignature,
);

function headersFor(payload, overrides = {}) {
  const headers = new Headers({
    "x-signature": signature.createIpaymuCallbackSignature(payload, va),
    "X-External-ID": "event_test_001",
    "x-TIMESTAMP": "2026-07-16T05:31:00.000Z",
  });
  for (const [name, value] of Object.entries(overrides)) headers.set(name, value);
  return headers;
}

const verified = signature.verifyIpaymuCallback({
  rawBody: JSON.stringify(callbackPayload),
  headers: headersFor(callbackPayload, { "X-Signature": expectedCallbackSignature }),
  va,
});
assert.deepEqual(verified, {
  eventReference: "event_test_001",
  providerReference: "123456789",
  state: "paid",
  amount: 19000,
  channelFee: 0,
  occurredAt: "2026-07-16T05:31:00.000Z",
  raw: JSON.parse(expectedCanonicalCallback.replaceAll("\\/", "/")),
});

for (const [status, statusCode, expectedState] of [
  ["pending", "0", "pending"],
  ["expired", "-2", "expired"],
]) {
  const payload = { ...callbackPayload, status, status_code: statusCode };
  assert.equal(signature.verifyIpaymuCallback({
    rawBody: JSON.stringify(payload),
    headers: headersFor(payload),
    va,
  }).state, expectedState);
}

function assertInvalidCallback(payload, headers = headersFor(payload)) {
  assert.throws(
    () => signature.verifyIpaymuCallback({ rawBody: JSON.stringify(payload), headers, va }),
    (error) => error instanceof BillingError && error.code === "PROVIDER_RESPONSE_INVALID",
  );
}

assertInvalidCallback(callbackPayload, headersFor(callbackPayload, { "X-Signature": "0".repeat(64) }));
assertInvalidCallback(callbackPayload, headersFor(callbackPayload, { "X-Signature": "aa" }));
assertInvalidCallback({ ...callbackPayload, status: "pending", status_code: "1" });
assertInvalidCallback({ ...callbackPayload, status: "unknown", status_code: "9" });
const missingReferencePayload = { ...callbackPayload };
delete missingReferencePayload.trx_id;
assertInvalidCallback(missingReferencePayload);
assertInvalidCallback(
  { ...callbackPayload, amount: "19000.50" },
  headersFor(callbackPayload),
);
assertInvalidCallback({ ...callbackPayload, fee: "-1" }, headersFor(callbackPayload));
assertInvalidCallback(callbackPayload, headersFor(callbackPayload, { "X-Timestamp": "not-a-date" }));
assertInvalidCallback(callbackPayload, headersFor(callbackPayload, { "X-Timestamp": "123" }));
assertInvalidCallback(callbackPayload, new Headers({
  "X-Signature": expectedCallbackSignature,
  "X-Timestamp": "2026-07-16T05:31:00.000Z",
}));
assert.throws(
  () => signature.verifyIpaymuCallback({
    rawBody: "{malformed",
    headers: headersFor(callbackPayload),
    va,
  }),
  (error) => error instanceof BillingError && error.code === "PROVIDER_RESPONSE_INVALID",
);

const envNames = [
  "BILLING_PAYMENT_PROVIDER_ENABLED",
  "IPAYMU_BASE_URL",
  "IPAYMU_VA",
  "IPAYMU_API_KEY",
  "IPAYMU_CALLBACK_URL",
  "IPAYMU_RETURN_URL",
];
const originalEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
let fetchCalls = 0;
const originalFetch = globalThis.fetch;
try {
  const adapter = new ipaymu.IpaymuProvider({
    baseUrl: "https://sandbox.example.test",
    va,
    apiKey,
    callbackUrl: "https://example.test/api/callback",
    returnUrl: "https://example.test/billing/return",
  });
  await assert.rejects(
    adapter.createPayment({
      purchaseId: "purchase_test_001",
      amount: 19000,
      method: "qris",
      customer: { name: "Test Buyer", email: "buyer@example.test" },
      callbackUrl: "https://untrusted.example.test/callback",
      returnUrl: "https://example.test/billing/return",
    }),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
  await assert.rejects(
    adapter.getPaymentStatus("provider_test_001"),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
  await assert.rejects(
    adapter.cancelPayment("provider_test_001"),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );

  Object.assign(process.env, {
    BILLING_PAYMENT_PROVIDER_ENABLED: "false",
    IPAYMU_BASE_URL: "https://sandbox.example.test",
    IPAYMU_VA: va,
    IPAYMU_API_KEY: apiKey,
    IPAYMU_CALLBACK_URL: "https://example.test/api/callback",
    IPAYMU_RETURN_URL: "https://example.test/billing/return",
  });
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error("fetch must remain unreachable");
  };
  assert.throws(
    () => providers.createPaymentProvider(),
    (error) => error instanceof BillingError
      && error.code === "PAYMENT_PROVIDER_NOT_READY"
      && !error.message.includes(apiKey)
      && !error.message.includes(va),
  );
  assert.equal(fetchCalls, 0);

  process.env.BILLING_PAYMENT_PROVIDER_ENABLED = "true";
  delete process.env.IPAYMU_RETURN_URL;
  assert.throws(
    () => providers.createPaymentProvider(),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
  assert.equal(fetchCalls, 0);
} finally {
  globalThis.fetch = originalFetch;
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
}

console.log("ipaymu signature contract valid");
