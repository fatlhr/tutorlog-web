import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const signatureUrl = new URL("../lib/billing/providers/duitku-signature.ts", import.meta.url);
const errorsUrl = new URL("../lib/billing/errors.ts", import.meta.url);

const [signatureSource, errorsSource] = await Promise.all([
  readFile(signatureUrl, "utf8"),
  readFile(errorsUrl, "utf8"),
]);

assert.match(signatureSource, /^import "server-only";/);
assert.match(signatureSource, /from "node:crypto"/);
assert.match(signatureSource, /timingSafeEqual/);
assert.match(signatureSource, /export function createDuitkuInquirySignature/);
assert.match(signatureSource, /export function createDuitkuStatusSignature/);
assert.match(signatureSource, /export function createDuitkuCallbackSignature/);
assert.match(signatureSource, /export function verifyDuitkuCallback/);

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
  transpile(withoutServerOnly(signatureSource), "duitku-signature.ts")
    .replaceAll('"@/lib/billing/errors"', `"${compiledErrorsUrl}"`),
);

const signature = await import(compiledSignatureUrl);
const { BillingError } = await import(compiledErrorsUrl);

const merchantCode = "D1000";
const apiKey = "test-api-key-do-not-use";

// === Test inquiry signature ===
const merchantOrderId = "TL-purchase_test_001";
const paymentAmount = 19000;

// Cross-verified with: echo -n 'D1000TL-purchase_test_00119000' | openssl dgst -sha256 -hmac 'test-api-key-do-not-use'
const expectedInquirySig = "282630e4bbfcefb1ad815b8b76e7a843bd741d6c72592a2cafec43ad6742e364";
const inquirySig = signature.createDuitkuInquirySignature(merchantCode, merchantOrderId, paymentAmount, apiKey);
assert.equal(inquirySig, expectedInquirySig);
assert.equal(typeof inquirySig, "string");
assert.equal(inquirySig.length, 64);
assert.match(inquirySig, /^[a-f0-9]{64}$/);

// Verify the signature is deterministic
assert.equal(
  signature.createDuitkuInquirySignature(merchantCode, merchantOrderId, paymentAmount, apiKey),
  inquirySig,
);

// Verify different input produces different signature
assert.notEqual(
  signature.createDuitkuInquirySignature(merchantCode, merchantOrderId, 20000, apiKey),
  inquirySig,
);

// === Test status signature ===
// Cross-verified with: echo -n 'D1000TL-purchase_test_001' | openssl dgst -sha256 -hmac 'test-api-key-do-not-use'
const expectedStatusSig = "3ac85a963a3fdedf856b4cf2fc36b9d56a4775fb595836979befcb54b12c10a0";
const statusSig = signature.createDuitkuStatusSignature(merchantCode, merchantOrderId, apiKey);
assert.equal(statusSig, expectedStatusSig);
assert.equal(typeof statusSig, "string");
assert.equal(statusSig.length, 64);
assert.match(statusSig, /^[a-f0-9]{64}$/);

// Status signature is different from inquiry signature (different input)
assert.notEqual(statusSig, inquirySig);

// Deterministic
assert.equal(
  signature.createDuitkuStatusSignature(merchantCode, merchantOrderId, apiKey),
  statusSig,
);

// === Test callback signature ===
const amount = "19000";
// Cross-verified with: echo -n 'D100019000TL-purchase_test_001' | openssl dgst -sha256 -hmac 'test-api-key-do-not-use'
const expectedCallbackSig = "a36a90f47425291533c7edd8a324e95ea1f6dfbfbb8c4a5fe21375b568844e0a";
const callbackSig = signature.createDuitkuCallbackSignature(
  merchantCode,
  amount,
  merchantOrderId,
  apiKey,
);
assert.equal(callbackSig, expectedCallbackSig);
assert.equal(typeof callbackSig, "string");
assert.equal(callbackSig.length, 64);
assert.match(callbackSig, /^[a-f0-9]{64}$/);

// Deterministic
assert.equal(
  signature.createDuitkuCallbackSignature(merchantCode, amount, merchantOrderId, apiKey),
  callbackSig,
);

// Different amount produces different signature
assert.notEqual(
  signature.createDuitkuCallbackSignature(merchantCode, "20000", merchantOrderId, apiKey),
  callbackSig,
);

// === Test callback verification ===
const callbackBody = new URLSearchParams({
  merchantCode,
  merchantOrderId,
  resultCode: "00",
  reference: "DXXXXCX80TZJ85Q70QCI",
  amount,
  fee: "0",
  signature: callbackSig,
}).toString();

const verified = signature.verifyDuitkuCallback({
  rawBody: callbackBody,
  merchantCode,
  apiKey,
});

assert.deepEqual(verified, {
  eventReference: merchantOrderId,
  providerReference: "DXXXXCX80TZJ85Q70QCI",
  state: "paid",
  amount: 19000,
  channelFee: 0,
  occurredAt: verified.occurredAt,
  raw: {
    merchantCode,
    merchantOrderId,
    resultCode: "00",
    reference: "DXXXXCX80TZJ85Q70QCI",
    amount,
    fee: "0",
  },
});

// Verify occurredAt is recent (within last 5 seconds)
const occurredAtMs = Date.parse(verified.occurredAt);
assert.ok(Date.now() - occurredAtMs < 5000, "occurredAt should be recent");

// === Test callback state mapping ===
for (const [resultCode, expectedState] of [
  ["00", "paid"],
  ["01", "failed"],
  ["02", "canceled"],
]) {
  const body = new URLSearchParams({
    merchantCode,
    merchantOrderId,
    resultCode,
    reference: "DXXXXCX80TZJ85Q70QCI",
    amount,
    fee: "0",
    signature: signature.createDuitkuCallbackSignature(
      merchantCode,
      amount,
      merchantOrderId,
      apiKey,
    ),
  }).toString();

  const result = signature.verifyDuitkuCallback({
    rawBody: body,
    merchantCode,
    apiKey,
  });
  assert.equal(result.state, expectedState, `resultCode ${resultCode} should map to ${expectedState}`);
}

// === Test callback rejection ===
function assertInvalidCallback(rawBody) {
  assert.throws(
    () => signature.verifyDuitkuCallback({ rawBody, merchantCode, apiKey }),
    (error) => error instanceof BillingError && error.code === "PROVIDER_RESPONSE_INVALID",
  );
}

// Tampered signature
const tamperedBody = new URLSearchParams({
  merchantCode,
  merchantOrderId,
  resultCode: "00",
  reference: "DXXXXCX80TZJ85Q70QCI",
  amount,
  fee: "0",
  signature: `${callbackSig.slice(0, -1)}0`,
}).toString();
assertInvalidCallback(tamperedBody);

// Wrong merchant code
const wrongMerchantBody = new URLSearchParams({
  merchantCode,
  merchantOrderId,
  resultCode: "00",
  reference: "DXXXXCX80TZJ85Q70QCI",
  amount,
  fee: "0",
  signature: callbackSig,
}).toString();
assert.throws(
  () => signature.verifyDuitkuCallback({
    rawBody: wrongMerchantBody,
    merchantCode: "D9999",
    apiKey,
  }),
  (error) => error instanceof BillingError && error.code === "PROVIDER_RESPONSE_INVALID",
);

// Missing required fields
assertInvalidCallback(new URLSearchParams({ merchantOrderId, resultCode: "00" }).toString());
assertInvalidCallback(new URLSearchParams({ resultCode: "00", reference: "ref", amount, fee: "0" }).toString());
assertInvalidCallback(new URLSearchParams({ merchantOrderId, reference: "ref", amount, fee: "0" }).toString());
assertInvalidCallback(new URLSearchParams({ merchantOrderId, resultCode: "00", reference: "ref", fee: "0" }).toString());
assertInvalidCallback(new URLSearchParams({ merchantOrderId, resultCode: "00", reference: "ref", amount, fee: "0", signature: callbackSig }).toString());

// Invalid signature format (not hex)
assertInvalidCallback(new URLSearchParams({
  merchantOrderId,
  resultCode: "00",
  reference: "DXXXXCX80TZJ85Q70QCI",
  amount,
  fee: "0",
  signature: "not-a-hex-signature",
}).toString());

// Invalid resultCode
const invalidResultBody = new URLSearchParams({
  merchantCode,
  merchantOrderId,
  resultCode: "99",
  reference: "DXXXXCX80TZJ85Q70QCI",
  amount,
  fee: "0",
  signature: signature.createDuitkuCallbackSignature(
    merchantCode,
    amount,
    merchantOrderId,
    apiKey,
  ),
}).toString();
assertInvalidCallback(invalidResultBody);

const absorbedFeeBody = new URLSearchParams({
  merchantCode,
  merchantOrderId,
  resultCode: "00",
  reference: "DXXXXCX80TZJ85Q70QCI",
  amount,
  fee: "133",
  signature: callbackSig,
}).toString();
assert.equal(
  signature.verifyDuitkuCallback({ rawBody: absorbedFeeBody, merchantCode, apiKey }).channelFee,
  0,
  "Duitku gateway fee must not become a customer channel fee while QRIS is absorbed",
);

// Malformed body
assertInvalidCallback("{malformed");

console.log("duitku signature contract valid");
