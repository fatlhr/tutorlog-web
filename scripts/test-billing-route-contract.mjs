import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const authSource = read("lib/billing/server/auth.ts");
const catalogSource = read("lib/billing/server/catalog.ts");
const purchasesSource = read("lib/billing/server/purchases.ts");
const paymentsSource = read("lib/billing/server/payments.ts");
const productRoute = read("app/api/products/route.ts");
const quoteRoute = read("app/api/quotes/route.ts");
const purchaseRoute = read("app/api/purchases/route.ts");
const statusRoute = read("app/api/purchases/[purchaseId]/route.ts");
const cancelRoute = read("app/api/payments/[paymentId]/cancel/route.ts");
const webhookRoute = read("app/api/webhooks/ipaymu/route.ts");
const signatureSource = read("lib/billing/providers/ipaymu-signature.ts");

assert.match(authSource, /^import "server-only";/);
assert.match(authSource, /auth\.getUser\(\)/);
assert.match(authSource, /new BillingError\("AUTH_REQUIRED"/);
for (const status of [400, 401, 404, 409, 502, 503, 500]) {
  assert.match(authSource, new RegExp(`status: ${status}`), `missing stable HTTP mapping: ${status}`);
}
assert.match(authSource, /INTERNAL_ERROR/);
assert.doesNotMatch(authSource, /error\.message/);

assert.match(catalogSource, /^import "server-only";/);
assert.match(catalogSource, /createAdminClient\(\)/);
assert.match(catalogSource, /\.eq\("active", true\)/);
assert.match(catalogSource, /free[\s\S]*plus_30d[\s\S]*plus_12m[\s\S]*plus_lifetime/);
assert.match(catalogSource, /code:[\s\S]*name:[\s\S]*description:[\s\S]*priceId:[\s\S]*amount:[\s\S]*currency:[\s\S]*durationKind:[\s\S]*durationValue:[\s\S]*featured:[\s\S]*available:/);
assert.match(catalogSource, /BILLING_PAYMENT_PROVIDER_ENABLED === "true"/);
assert.match(catalogSource, /isPackageCode\(row\.code\)/);
assert.match(catalogSource, /packageCode === "free"/);
assert.match(catalogSource, /method === "va"[\s\S]*PAYMENT_PROVIDER_NOT_READY/);
assert.match(catalogSource, /method === "qris"[\s\S]*channelFee = 0/);

for (const source of [quoteRoute, purchaseRoute, statusRoute, cancelRoute]) {
  assert.match(source, /requireUser\(\)/, "authenticated billing route must call requireUser");
  assert.doesNotMatch(source, /providerReference|provider_reference|provider_reported|raw/i);
}
assert.doesNotMatch(productRoute, /requireUser\(\)/, "public catalog must remain unauthenticated");
assert.match(productRoute, /getCatalog\(\)/);
assert.match(quoteRoute, /isPackageCode\(packageCode\)/);
assert.match(quoteRoute, /isPaymentMethod\(method\)/);
assert.match(purchaseRoute, /isPackageCode\(packageCode\)/);
assert.match(purchaseRoute, /isPaymentMethod\(method\)/);
assert.match(statusRoute, /isUuid\(purchaseId\)/);
assert.match(cancelRoute, /isUuid\(paymentId\)/);

assert.match(purchasesSource, /^import "server-only";/);
assert.match(paymentsSource, /^import "server-only";/);
assert.doesNotMatch(purchasesSource + paymentsSource, /Mutex|Map<|Set<|processLocal|inFlight/i);

const guardIndex = purchasesSource.indexOf("assertPaymentProviderEnabled();");
const reserveIndex = purchasesSource.indexOf('rpc("reserve_billing_purchase"');
const createProviderIndex = purchasesSource.indexOf("createPaymentProvider()");
assert.ok(guardIndex !== -1 && guardIndex < reserveIndex, "disabled purchase must fail before reservation");
assert.ok(reserveIndex < createProviderIndex, "provider factory is only reached by the reservation owner");
assert.match(purchasesSource, /should_create_provider/);
assert.match(purchasesSource, /isLifetime[\s\S]*LIFETIME_ALREADY_ACTIVE/);
for (const snapshot of ["priceId", "baseAmount", "channelFee", "totalAmount", "currency"]) {
  assert.match(purchasesSource, new RegExp(snapshot), `missing reservation snapshot: ${snapshot}`);
}
assert.match(purchasesSource, /amount: reservation\.baseAmount/);
assert.doesNotMatch(purchasesSource, /amount: quote\.baseAmount/);
const quoteMismatch = purchasesSource.indexOf("quoteDoesNotMatchReservation");
const mismatchFailure = purchasesSource.indexOf(
  'await recordProviderFailure(user.id, reservation.paymentId, "PRICE_CHANGED")',
);
const providerCreation = purchasesSource.indexOf("createPaymentProvider()");
assert.ok(
  quoteMismatch !== -1 && mismatchFailure > quoteMismatch && mismatchFailure < providerCreation,
  "quote mismatch must be recorded and rejected before provider creation",
);
assert.match(purchasesSource, /rpc\(\s*"finalize_billing_provider_payment"/);
assert.match(purchasesSource, /requires_cancellation/);
assert.match(
  purchasesSource,
  /value\.requires_cancellation === true[\s\S]*value\.state !== "superseded"/,
  "requires_cancellation finalization must verify the preserved superseded state",
);
assert.match(
  purchasesSource,
  /value\.requires_cancellation === false[\s\S]*value\.state !== expectedState/,
  "ordinary finalization must verify the provider-normalized state",
);
assert.doesNotMatch(
  purchasesSource,
  /\.update\([\s\S]*provider_reference[\s\S]*\.eq\("state", "created"\)/,
  "provider finalization must not use a fragile direct created-only update",
);
assert.match(
  purchasesSource,
  /rpc\("record_billing_provider_failure"[\s\S]*recorded !== true/,
  "provider creation failure recording must verify the returned result",
);
assert.match(purchasesSource, /p_user_id: user\.id/);
assert.doesNotMatch(purchasesSource, /raw|payload|responseBody|providerError/i);
assert.match(
  purchasesSource,
  /error\.message === "PACKAGE_UNAVAILABLE"[\s\S]*error\.message === "PRICE_CHANGED"/,
  "reservation may map only exact stable SQL billing codes",
);

assert.match(paymentsSource, /rpc\("claim_billing_payment_inquiry"/);
assert.match(paymentsSource, /rpc\("supersede_billing_payment"/);
assert.match(paymentsSource, /BILLING_PAYMENT_PROVIDER_ENABLED !== "true"[\s\S]*return purchase/);
const cancelGuard = paymentsSource.indexOf("assertPaymentProviderEnabled();");
const supersedeCall = paymentsSource.indexOf('rpc("supersede_billing_payment"');
assert.ok(cancelGuard !== -1 && cancelGuard < supersedeCall, "disabled cancellation must not supersede");
assert.match(
  paymentsSource,
  /rpc\("record_billing_cancellation_failure"[\s\S]*recorded !== true/,
  "provider cancellation failure recording must verify the returned result",
);
assert.match(paymentsSource, /\.eq\("user_id", userId\)/);
assert.match(paymentsSource, /\.eq\("purchase_id", purchaseId\)/);
assert.doesNotMatch(
  paymentsSource.slice(0, paymentsSource.indexOf("export async function processIpaymuCallback")),
  /raw|payload|responseBody|providerError/i,
);

assert.match(webhookRoute, /export async function POST\(request: Request\)/);
assert.equal(
  (webhookRoute.match(/request\.text\(\)/g) ?? []).length,
  1,
  "the webhook route must read the raw body exactly once",
);
assert.doesNotMatch(webhookRoute, /request\.json\(\)|JSON\.parse/);
assert.match(webhookRoute, /processIpaymuCallback\(rawBody, request\.headers\)/);
assert.match(webhookRoute, /\{ status: "ok" \}[\s\S]*status: 200/);
assert.match(webhookRoute, /PROVIDER_RESPONSE_INVALID[\s\S]*status: 400/);
assert.match(
  webhookRoute,
  /PAYMENT_PROVIDER_NOT_READY[\s\S]*PROVIDER_UNAVAILABLE[\s\S]*status: 503/,
);
assert.doesNotMatch(webhookRoute, /console\.|providerReference|eventReference|verified\.raw/);

const callbackService = paymentsSource.match(
  /export async function processIpaymuCallback[\s\S]*?\n}/,
)?.[0] ?? "";
assert.ok(callbackService, "missing verified callback service");
const enabledGuard = callbackService.indexOf('BILLING_PAYMENT_PROVIDER_ENABLED !== "true"');
const adminCreation = callbackService.indexOf("createAdminClient()");
const processingRpc = callbackService.indexOf('rpc("process_billing_provider_event"');
assert.ok(enabledGuard !== -1, "disabled callback must fail closed");
assert.ok(
  adminCreation !== -1 && enabledGuard < adminCreation,
  "disabled callback must return before creating a database client",
);
assert.ok(
  processingRpc !== -1 && enabledGuard < processingRpc,
  "disabled callback must return before database mutation",
);
assert.match(callbackService, /verifyCallback\(\{ rawBody, headers \}\)/);
assert.match(callbackService, /10 \* 60 \* 1000/);
assert.match(callbackService, /2 \* 60 \* 1000/);
assert.match(callbackService, /p_provider: "ipaymu"/);
assert.match(callbackService, /p_event_key: verified\.eventReference/);
assert.match(callbackService, /p_provider_reference: verified\.providerReference/);
assert.match(callbackService, /p_event_type: verified\.state/);
assert.match(callbackService, /p_amount: verified\.amount/);
assert.match(callbackService, /p_channel_fee: verified\.channelFee/);
assert.match(callbackService, /p_occurred_at: verified\.occurredAt/);
assert.match(callbackService, /p_payload: verified\.raw/);
assert.match(callbackService, /unknown_reference[\s\S]*PROVIDER_UNAVAILABLE/);
for (const acknowledged of ["processed", "duplicate", "amount_mismatch", "ignored"]) {
  assert.ok(callbackService.includes(`"${acknowledged}"`), `missing callback outcome: ${acknowledged}`);
}
assert.doesNotMatch(callbackService, /console\.|JSON\.parse|error\.message/);

assert.match(signatureSource, /readRequiredHeader\(input\.headers, "X-Signature"\)/);
assert.match(signatureSource, /readRequiredHeader\(input\.headers, "X-External-ID"\)/);
assert.match(signatureSource, /readRequiredHeader\(input\.headers, "X-Timestamp"\)/);
assert.match(signatureSource, /JSON\.parse\(input\.rawBody\)/);
assert.match(signatureSource, /timingSafeEqual/);

console.log("billing route contract valid");
