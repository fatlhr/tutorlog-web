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
assert.match(purchasesSource, /state: "failed"[\s\S]*provider_error_code/);
assert.match(
  purchasesSource,
  /const \{ error: failureUpdateError \} = await admin[\s\S]*provider_error_code[\s\S]*if \(failureUpdateError\)/,
  "provider creation failure recording must be checked",
);
assert.match(purchasesSource, /\.eq\("user_id", userId\)/);
assert.doesNotMatch(purchasesSource, /raw|payload|responseBody|providerError/i);

assert.match(paymentsSource, /rpc\("claim_billing_payment_inquiry"/);
assert.match(paymentsSource, /rpc\("supersede_billing_payment"/);
assert.match(paymentsSource, /BILLING_PAYMENT_PROVIDER_ENABLED !== "true"[\s\S]*return purchase/);
const cancelGuard = paymentsSource.indexOf("assertPaymentProviderEnabled();");
const supersedeCall = paymentsSource.indexOf('rpc("supersede_billing_payment"');
assert.ok(cancelGuard !== -1 && cancelGuard < supersedeCall, "disabled cancellation must not supersede");
assert.match(paymentsSource, /cancellation_error_code/);
assert.match(
  paymentsSource,
  /const \{ error: cancellationUpdateError \} = await admin[\s\S]*cancellation_error_code[\s\S]*if \(cancellationUpdateError\)/,
  "provider cancellation failure recording must be checked",
);
assert.match(paymentsSource, /\.eq\("user_id", userId\)/);
assert.match(paymentsSource, /\.eq\("purchase_id", purchaseId\)/);
assert.doesNotMatch(paymentsSource, /raw|payload|responseBody|providerError/i);

console.log("billing route contract valid");
