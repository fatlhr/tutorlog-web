import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const signatureUrl = new URL(
  "../lib/billing/providers/lynk-signature.ts",
  import.meta.url,
);
const fixtureUrl = new URL(
  "./fixtures/lynk-payment-received.redacted.json",
  import.meta.url,
);
const routeUrl = new URL("../app/api/webhooks/lynk/route.ts", import.meta.url);

const [signatureSource, fixtureSource, routeSource] = await Promise.all([
  readFile(signatureUrl, "utf8"),
  readFile(fixtureUrl, "utf8"),
  readFile(routeUrl, "utf8"),
]);

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

const signature = await import(
  toDataUrl(transpile(signatureSource, "lynk-signature.ts"))
);
const fixture = JSON.parse(fixtureSource);

const vectorFields = {
  grandTotalText: "19000",
  refId: "ref-test-001",
  messageId: "message-test-001",
};
const vectorSignature =
  "a2fd51e6d5b5790c271dbfed496e7a07eebd81efe2be5164f1a2e77e974c32b8";

assert.equal(
  signature.calculateLynkSignature(vectorFields, "merchant-test-key"),
  vectorSignature,
);
assert.equal(
  signature.verifyLynkSignature(
    vectorFields,
    vectorSignature,
    "merchant-test-key",
  ),
  true,
);
assert.equal(
  signature.verifyLynkSignature(
    vectorFields,
    "b".repeat(64),
    "merchant-test-key",
  ),
  false,
);

for (const malformedSignature of [
  "",
  "A".repeat(64),
  "a".repeat(63),
  "a".repeat(65),
  "z".repeat(64),
]) {
  assert.equal(
    signature.verifyLynkSignature(
      vectorFields,
      malformedSignature,
      "merchant-test-key",
    ),
    false,
  );
}

assert.deepEqual(signature.extractLynkSignedFields(fixture), {
  grandTotalText: "19000",
  refId: "ref-redacted-001",
  messageId: "message-redacted-001",
});

for (const value of [19000, "19000", 0, "0"]) {
  assert.equal(
    signature.normalizeLynkGrandTotal(value),
    String(value),
  );
}

for (const value of [
  -1,
  1.5,
  Number.NaN,
  Number.POSITIVE_INFINITY,
  "",
  "00",
  "019000",
  "+19000",
  "-19000",
  "19000.0",
  "1e4",
  " 19000",
]) {
  assert.throws(
    () => signature.normalizeLynkGrandTotal(value),
    /grandtotal/i,
  );
}

for (const mutate of [
  (payload) => delete payload.data,
  (payload) => delete payload.data.message_id,
  (payload) => delete payload.data.message_data,
  (payload) => delete payload.data.message_data.refId,
  (payload) => delete payload.data.message_data.totals,
  (payload) => delete payload.data.message_data.totals.grandTotal,
]) {
  const payload = structuredClone(fixture);
  mutate(payload);
  assert.throws(
    () => signature.extractLynkSignedFields(payload),
    /signed fields|grandtotal/i,
  );
}

assert.match(signatureSource, /createHash/);
assert.match(signatureSource, /timingSafeEqual/);
assert.match(routeSource, /x-lynk-signature/i);
assert.match(routeSource, /verifyLynkSignature/);
assert.match(routeSource, /status: 401/);

console.log("Lynk signature contract passed");
