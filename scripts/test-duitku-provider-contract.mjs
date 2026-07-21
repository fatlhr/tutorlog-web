import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const providerUrl = new URL("../lib/billing/providers/duitku.ts", import.meta.url);
const providerSource = await readFile(providerUrl, "utf8");

// Source-level assertions
assert.match(providerSource, /^import "server-only";/);
assert.match(providerSource, /from "@\/lib\/billing\/errors"/);
assert.match(providerSource, /from "\.\/duitku-signature"/);
assert.match(providerSource, /from "\.\/provider"/);

// Class structure
assert.match(providerSource, /class DuitkuProvider implements PaymentProvider/);
assert.match(providerSource, /async createPayment\(/);
assert.match(providerSource, /async getPaymentStatus\(/);
assert.match(providerSource, /async cancelPayment\(/);
assert.match(providerSource, /verifyCallback\(/);

// Config
assert.match(providerSource, /DUITKU_MERCHANT_CODE/);
assert.match(providerSource, /DUITKU_API_KEY/);
assert.match(providerSource, /DUITKU_BASE_URL/);
assert.match(providerSource, /DUITKU_CALLBACK_URL/);
assert.match(providerSource, /DUITKU_RETURN_URL/);

// API endpoints
assert.match(providerSource, /\/webapi\/api\/merchant\/v2\/inquiry/);
assert.match(providerSource, /\/webapi\/api\/merchant\/transactionStatus/);

// Signature usage
assert.match(providerSource, /createDuitkuInquirySignature/);
assert.match(providerSource, /createDuitkuStatusSignature/);
assert.match(providerSource, /verifyDuitkuCallback/);

// Method mapping
assert.match(providerSource, /qris.*SP|SP.*qris/);
assert.match(providerSource, /va.*BC|BC.*va/);

// MerchantOrderId prefix
assert.match(providerSource, /TL-/);

// Export
assert.match(providerSource, /export function createPaymentProvider/);

// Contracts check
const contractsUrl = new URL("../lib/billing/contracts.ts", import.meta.url);
const contractsSource = await readFile(contractsUrl, "utf8");
assert.match(contractsSource, /provider: "ipaymu" \| "duitku"/);

console.log("duitku provider contract valid");
