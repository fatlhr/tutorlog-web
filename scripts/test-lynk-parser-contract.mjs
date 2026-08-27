import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const webhookUrl = new URL("../lib/billing/providers/lynk-webhook.ts", import.meta.url);
const productsUrl = new URL("../lib/billing/providers/lynk-products.ts", import.meta.url);
const fixtureUrl = new URL(
  "./fixtures/lynk-payment-received.redacted.json",
  import.meta.url,
);

const [webhookSource, productsSource, fixtureSource] = await Promise.all([
  readFile(webhookUrl, "utf8"),
  readFile(productsUrl, "utf8"),
  readFile(fixtureUrl, "utf8"),
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

const productsDataUrl = toDataUrl(transpile(productsSource, "lynk-products.ts"));
const testableWebhookSource = webhookSource.replace(
  'from "./lynk-products";',
  `from "${productsDataUrl}";`,
);
const webhook = await import(
  toDataUrl(transpile(testableWebhookSource, "lynk-webhook.ts"))
);
const products = await import(productsDataUrl);
const fixture = JSON.parse(fixtureSource);

const parsed = webhook.parseLynkPaymentReceived(fixture);
assert.deepEqual(parsed, {
  eventKey: "message-redacted-001",
  providerReference: "ref-redacted-001",
  customerEmail: "buyer@example.invalid",
  productCode: "plus_30d",
  productAmount: 19000,
  grandTotal: 19000,
  occurredAt: "2026-01-01T00:00:00.000Z",
  reviewReason: null,
});

const emailNormalized = structuredClone(fixture);
emailNormalized.data.message_data.customer.email = "  BUYER@EXAMPLE.INVALID ";
assert.equal(
  webhook.parseLynkPaymentReceived(emailNormalized).customerEmail,
  "buyer@example.invalid",
);

const feeAdjusted = structuredClone(fixture);
feeAdjusted.data.message_data.totals.convenienceFee = -1000;
feeAdjusted.data.message_data.totals.grandTotal = 18000;
assert.deepEqual(
  webhook.parseLynkPaymentReceived(feeAdjusted),
  {
    ...parsed,
    grandTotal: 18000,
  },
);

const wrongEvent = structuredClone(fixture);
wrongEvent.event = "order.created";
assert.throws(
  () => webhook.parseLynkPaymentReceived(wrongEvent),
  /payment\.received/i,
);

const unsuccessful = structuredClone(fixture);
unsuccessful.data.message_action = "FAILED";
assert.throws(
  () => webhook.parseLynkPaymentReceived(unsuccessful),
  /successful/i,
);

const missingEmail = structuredClone(fixture);
missingEmail.data.message_data.customer.email = "   ";
assert.equal(
  webhook.parseLynkPaymentReceived(missingEmail).reviewReason,
  "customer_email_missing",
);

const multiItem = structuredClone(fixture);
multiItem.data.message_data.items.push(structuredClone(multiItem.data.message_data.items[0]));
assert.equal(
  webhook.parseLynkPaymentReceived(multiItem).reviewReason,
  "unsupported_order",
);

const unknownProduct = structuredClone(fixture);
unknownProduct.data.message_data.items[0].title = "Unknown Product";
assert.equal(
  webhook.parseLynkPaymentReceived(unknownProduct).reviewReason,
  "unknown_product",
);

const amountMismatch = structuredClone(fixture);
amountMismatch.data.message_data.items[0].price = 18000;
amountMismatch.data.message_data.totals.totalPrice = 18000;
assert.equal(
  webhook.parseLynkPaymentReceived(amountMismatch).reviewReason,
  "amount_mismatch",
);

const addon = structuredClone(fixture);
addon.data.message_data.items[0].addons.push({
  id: "addon-redacted-001",
  name: "Addon Redacted",
  price: "1,000",
});
addon.data.message_data.totals.totalAddon = 1000;
assert.equal(
  webhook.parseLynkPaymentReceived(addon).reviewReason,
  "unsupported_order",
);

const discounted = structuredClone(fixture);
discounted.data.message_data.totals.discount = 1000;
assert.equal(
  webhook.parseLynkPaymentReceived(discounted).reviewReason,
  "unsupported_order",
);

const invalidTimestamp = structuredClone(fixture);
invalidTimestamp.data.message_data.createdAt = "not-a-date";
assert.throws(
  () => webhook.parseLynkPaymentReceived(invalidTimestamp),
  /timestamp/i,
);

assert.deepEqual(
  products.LYNK_PRODUCTS.map(({ code, amount, checkoutUrl }) => ({
    code,
    amount,
    checkoutUrl,
  })),
  [
    {
      code: "plus_30d",
      amount: 19000,
      checkoutUrl: "https://lynk.id/tutorlog/q51pn0rykvq9",
    },
    {
      code: "plus_12m",
      amount: 149000,
      checkoutUrl: "https://lynk.id/tutorlog/gjvmgkznjqd6",
    },
    {
      code: "plus_lifetime",
      amount: 249000,
      checkoutUrl: "https://lynk.id/tutorlog/65p8z7ewqj8r",
    },
  ],
);
assert.equal(
  products.findLynkProductByCode("plus_12m")?.checkoutUrl,
  "https://lynk.id/tutorlog/gjvmgkznjqd6",
);
assert.equal(products.findLynkProductByCode("free"), undefined);

console.log("Lynk parser contract passed");
