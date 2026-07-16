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
assert.doesNotMatch(ipaymuSource, /cancelUrl\s*:/);
for (const envName of [
  "BILLING_PAYMENT_PROVIDER_ENABLED",
  "IPAYMU_BASE_URL",
  "IPAYMU_VA",
  "IPAYMU_API_KEY",
  "IPAYMU_CALLBACK_URL",
  "IPAYMU_RETURN_URL",
]) {
  assert.ok(`${indexSource}\n${ipaymuSource}`.includes(envName), `missing readiness input ${envName}`);
}
assert.match(`${indexSource}\n${ipaymuSource}`, /BILLING_PAYMENT_PROVIDER_ENABLED\s*===\s*"true"/);

const reviewFindings = [];
if (/export\s+(?:class|interface)\s+IpaymuProvider/.test(ipaymuSource)) {
  reviewFindings.push("the provider class or constructor contract remains publicly deep-importable");
}
if (!/cancelUrl[^\n]*intentionally omitted[^\n]*Task I9/i.test(ipaymuSource)) {
  reviewFindings.push("the cancelUrl omission lacks the required Task I9 controller gate");
}

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
const expectedRequestBody =
  '{"product":["TutorLog Plus"],"qty":[1],"price":[19000],"returnUrl":"https://example.test/billing/return","notifyUrl":"https://example.test/api/callback","referenceId":"purchase_test_001"}';
const expectedCanonicalRequest =
  "POST:0000001171111111:312a52654fc6db442983f11a40389ce863c5f942eda02e9f23c810ae824e0217:test-api-key-do-not-use";
const expectedRequestSignature =
  "ceb1220dd66981367a727c40a306d524cdd90a92cd3eec6755004486ff1c9278";

assert.equal(requestBody, expectedRequestBody);
assert.equal(
  expectedCanonicalRequest,
  `POST:${va}:312a52654fc6db442983f11a40389ce863c5f942eda02e9f23c810ae824e0217:${apiKey}`,
);

// Independent fixture derivation (documentation only; never executed by this test):
// printf '%s' '{"product":["TutorLog Plus"],"qty":[1],"price":[19000],"returnUrl":"https://example.test/billing/return","notifyUrl":"https://example.test/api/callback","referenceId":"purchase_test_001"}' | openssl dgst -sha256
// printf '%s' 'POST:0000001171111111:312a52654fc6db442983f11a40389ce863c5f942eda02e9f23c810ae824e0217:test-api-key-do-not-use' | openssl dgst -sha256 -hmac 'test-api-key-do-not-use'

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

// Independent fixture derivation (documentation only; never executed by this test):
// printf '%s' '{"additional_info":[],"amount":"19000","buyer_note":"https:\/\/example.test\/receipt","fee":"0","is_escrow":false,"paid_off":19000,"payment_method":"qris","reference_id":"purchase_test_001","status":"berhasil","status_code":1,"transaction_status_code":1,"trx_id":123456789}' | openssl dgst -sha256 -hmac '0000001171111111'

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

function callbackWasAccepted(headers) {
  try {
    signature.verifyIpaymuCallback({ rawBody: JSON.stringify(callbackPayload), headers, va });
    return true;
  } catch {
    return false;
  }
}

if (callbackWasAccepted(headersFor(callbackPayload, {
  "X-Signature": `${expectedCallbackSignature}f`,
}))) {
  reviewFindings.push("a valid callback signature plus one trailing hex nibble is accepted");
}
if (callbackWasAccepted(headersFor(callbackPayload, {
  "X-Timestamp": "2026-02-30T05:31:00.000Z",
}))) {
  reviewFindings.push("a syntactically shaped but impossible callback calendar date is accepted");
}
assert.equal(signature.verifyIpaymuCallback({
  rawBody: JSON.stringify(callbackPayload),
  headers: headersFor(callbackPayload, { "X-Timestamp": "2026-07-16T12:31:00+07:00" }),
  va,
}).occurredAt, "2026-07-16T05:31:00.000Z");

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
const completeFakeEnv = {
  BILLING_PAYMENT_PROVIDER_ENABLED: "true",
  IPAYMU_BASE_URL: "https://sandbox.example.test",
  IPAYMU_VA: va,
  IPAYMU_API_KEY: apiKey,
  IPAYMU_CALLBACK_URL: "https://example.test/api/callback",
  IPAYMU_RETURN_URL: "https://example.test/billing/return",
};
const paymentInput = {
  purchaseId: "purchase_test_001",
  amount: 19000,
  method: "qris",
  customer: { name: "Test Buyer", email: "buyer@example.test" },
  callbackUrl: completeFakeEnv.IPAYMU_CALLBACK_URL,
  returnUrl: completeFakeEnv.IPAYMU_RETURN_URL,
};
let fetchCalls = 0;
const originalFetch = globalThis.fetch;
try {
  Object.assign(process.env, completeFakeEnv, {
    BILLING_PAYMENT_PROVIDER_ENABLED: "false",
  });
  globalThis.fetch = async () => {
    fetchCalls += 1;
    return { ok: true, json: async () => ({}) };
  };

  if (typeof ipaymu.IpaymuProvider === "function") {
    const bypassableAdapter = new ipaymu.IpaymuProvider({
      baseUrl: completeFakeEnv.IPAYMU_BASE_URL,
      va,
      apiKey,
      callbackUrl: completeFakeEnv.IPAYMU_CALLBACK_URL,
      returnUrl: completeFakeEnv.IPAYMU_RETURN_URL,
    });
    await assert.rejects(bypassableAdapter.createPayment(paymentInput));
    if (fetchCalls > 0) {
      reviewFindings.push("direct construction can reach fetch while provider readiness is disabled");
    }
  }

  assert.deepEqual(reviewFindings, [], "Task I4 reviewer findings must remain fixed");

  assert.deepEqual(Object.keys(ipaymu), ["createPaymentProvider"]);
  assert.deepEqual(Object.keys(providers), ["createPaymentProvider"]);
  for (const publicModule of [ipaymu, providers]) {
    assert.throws(
      () => publicModule.createPaymentProvider(),
      (error) => error instanceof BillingError
        && error.code === "PAYMENT_PROVIDER_NOT_READY"
        && !error.message.includes(apiKey)
        && !error.message.includes(va),
    );
  }
  assert.equal(fetchCalls, 0);

  process.env.BILLING_PAYMENT_PROVIDER_ENABLED = "true";
  delete process.env.IPAYMU_RETURN_URL;
  for (const publicModule of [ipaymu, providers]) {
    assert.throws(
      () => publicModule.createPaymentProvider(),
      (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
    );
  }
  assert.equal(fetchCalls, 0);

  Object.assign(process.env, completeFakeEnv);
  const adapter = providers.createPaymentProvider();
  process.env.BILLING_PAYMENT_PROVIDER_ENABLED = "false";
  fetchCalls = 0;
  await assert.rejects(
    adapter.createPayment(paymentInput),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
  assert.equal(fetchCalls, 0);

  Object.assign(process.env, completeFakeEnv);
  delete process.env.IPAYMU_API_KEY;
  await assert.rejects(
    adapter.createPayment(paymentInput),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
  assert.equal(fetchCalls, 0);

  Object.assign(process.env, completeFakeEnv);
  let capturedRequest;
  globalThis.fetch = async (url, init) => {
    fetchCalls += 1;
    capturedRequest = { url, init };
    return { ok: true, json: async () => ({}) };
  };
  await assert.rejects(
    adapter.createPayment(paymentInput),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
  assert.equal(fetchCalls, 1);
  assert.equal(capturedRequest.url, "https://sandbox.example.test/api/v2/payment");
  assert.equal(capturedRequest.init.body, JSON.stringify({
    product: ["TutorLog Plus"],
    qty: [1],
    price: [19000],
    returnUrl: completeFakeEnv.IPAYMU_RETURN_URL,
    notifyUrl: completeFakeEnv.IPAYMU_CALLBACK_URL,
    referenceId: "purchase_test_001",
    buyerName: "Test Buyer",
    buyerEmail: "buyer@example.test",
  }));
  assert.equal(capturedRequest.init.signal instanceof AbortSignal, true);
  await assert.rejects(
    adapter.getPaymentStatus("provider_test_001"),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
  await assert.rejects(
    adapter.cancelPayment("provider_test_001"),
    (error) => error instanceof BillingError && error.code === "PAYMENT_PROVIDER_NOT_READY",
  );
} finally {
  globalThis.fetch = originalFetch;
  for (const name of envNames) {
    if (originalEnv[name] === undefined) delete process.env[name];
    else process.env[name] = originalEnv[name];
  }
}

console.log("ipaymu signature contract valid");
