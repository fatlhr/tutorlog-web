import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  accessLabel,
  annualSavings,
  formatIdr,
  paymentStatusCopy,
  productPeriodLabel,
} from "../lib/billing/ui-model.ts";
import { billingFixtures } from "../lib/billing/fixtures.ts";

const fallbackCatalogPath = fileURLToPath(
  new URL("../lib/billing/fallback-catalog.ts", import.meta.url),
);
assert.equal(
  existsSync(fallbackCatalogPath),
  true,
  "fallback billing catalog has not been implemented",
);
const { FALLBACK_BILLING_CATALOG } = await import("../lib/billing/fallback-catalog.ts");

const PAYMENT_STATES = [
  "created", "pending", "superseded", "paid", "expired", "failed", "canceled", "refunded",
];

assert.equal(formatIdr(149000), "Rp149.000");
assert.equal(productPeriodLabel(billingFixtures.products[1]), "30 hari");
assert.equal(productPeriodLabel(billingFixtures.products[2]), "12 bulan");
assert.equal(productPeriodLabel(billingFixtures.products[3]), "selamanya");
assert.equal(annualSavings(billingFixtures.products), 79000);
assert.equal(accessLabel(billingFixtures.access.lifetime), "Plus Selamanya");
assert.equal(
  paymentStatusCopy(billingFixtures.payments.verifying).title,
  "Memverifikasi pembayaran",
);
assert.equal(paymentStatusCopy(billingFixtures.payments.paid).title, "Plus sudah aktif");
assert.deepEqual(paymentStatusCopy(billingFixtures.payments.duplicateReview), {
  title: "Pembayaran sedang ditinjau",
  body: "Pembayaran ganda sedang diperiksa. Akses Plus yang sudah aktif tetap aktif selama peninjauan.",
  tone: "warning",
});
for (const state of PAYMENT_STATES) {
  assert.equal(
    typeof paymentStatusCopy({
      ...billingFixtures.payments.pending,
      state,
      verificationDeadline: null,
      duplicateReview: false,
    }).title,
    "string",
    `${state} must normalize to status copy`,
  );
}

assert.deepEqual(
  billingFixtures.products.map((product) => product.code),
  ["free", "plus_30d", "plus_12m", "plus_lifetime"],
);
assert.equal(formatIdr(annualSavings(billingFixtures.products)), "Rp79.000");
assert.equal(
  billingFixtures.products.find((product) => product.featured)?.code,
  "plus_12m",
);
assert.equal(
  billingFixtures.products.find((product) => product.code === "plus_lifetime")?.amount,
  249000,
  "lifetime fixture must match the production catalog",
);
assert.deepEqual(
  FALLBACK_BILLING_CATALOG.map(({ code, amount }) => ({ code, amount })),
  [
    { code: "free", amount: 0 },
    { code: "plus_30d", amount: 19000 },
    { code: "plus_12m", amount: 149000 },
    { code: "plus_lifetime", amount: 249000 },
  ],
);
assert.equal(FALLBACK_BILLING_CATALOG.every((product) => product.available), true);
assert.equal(billingFixtures.quotes.qris.package.code, "plus_30d");
assert.equal(billingFixtures.quotes.va.package.code, "plus_30d");
assert.equal(billingFixtures.quotes.qris.baseAmount, 19000);
assert.equal(billingFixtures.quotes.qris.channelFee, 0);
assert.equal(billingFixtures.quotes.qris.totalAmount, 19000);
assert.equal(billingFixtures.quotes.va.baseAmount, 19000);
assert.equal(billingFixtures.quotes.va.channelFee, 4000);
assert.equal(billingFixtures.quotes.va.totalAmount, 23000);
assert.equal(billingFixtures.payments.pending.channelFee, 0);
assert.equal(
  billingFixtures.payments.pending.totalAmount,
  billingFixtures.payments.pending.baseAmount,
);

const pricingCatalogPath = fileURLToPath(
  new URL("../components/billing/pricing-catalog.tsx", import.meta.url),
);
assert.equal(
  existsSync(pricingCatalogPath),
  true,
  "PricingCatalog has not been implemented",
);

const pricingCatalogSource = readFileSync(pricingCatalogPath, "utf8");
const normalizedPricingSource = pricingCatalogSource.toLowerCase();

assert.match(pricingCatalogSource, /ProductSummary\[\]/);
assert.match(pricingCatalogSource, /annualSavings\(products\)/);
assert.match(pricingCatalogSource, /formatIdr\(savings\)/);
assert.match(pricingCatalogSource, /productPeriodLabel\(product\)/);
assert.match(pricingCatalogSource, /Paling hemat/);
assert.match(pricingCatalogSource, /product\.code === "plus_12m"/);
assert.match(pricingCatalogSource, /product\.code === "plus_lifetime"/);
assert.match(pricingCatalogSource, /Sekali bayar/);
assert.match(
  pricingCatalogSource,
  /Bayar sekali untuk akses Plus selamanya\./,
);
assert.match(pricingCatalogSource, /styles\.savings/);
assert.match(pricingCatalogSource, /styles\.lifetime/);
assert.match(pricingCatalogSource, /styles\.lifetimeBadge/);

const pricingStylesPath = fileURLToPath(
  new URL("../components/billing/pricing.module.css", import.meta.url),
);
const pricingStylesSource = readFileSync(pricingStylesPath, "utf8");

assert.match(pricingStylesSource, /\.savings\s*\{/);
assert.match(pricingStylesSource, /\.lifetime\s*\{/);
assert.match(pricingStylesSource, /var\(--tl-lavender\)/);
assert.match(
  pricingCatalogSource,
  /const checkoutPath = `\/checkout\?package=\$\{encodeURIComponent\(product\.code\)\}`/,
);
assert.match(pricingCatalogSource, /authenticated\s*\? checkoutPath/);
assert.match(
  pricingCatalogSource,
  /`\/login\?next=\$\{encodeURIComponent\(checkoutPath\)\}`/,
);
assert.match(pricingCatalogSource, /authenticated\s*\? "\/app"\s*:\s*"\/login"/);
assert.match(
  pricingCatalogSource,
  /const isUnavailable = !isFree && !product\.available;[\s\S]*\{isUnavailable\s*\?\s*\(\s*<MarketingButton disabled[^>]*>\s*Belum tersedia\s*<\/MarketingButton>/,
  "unavailable paid products must render a clear disabled action without an href",
);
assert.doesNotMatch(normalizedPricingSource, /lynk\.id/);
assert.doesNotMatch(
  normalizedPricingSource,
  /tersisa|stok|kuota|buruan|segera beli|promo terbatas/,
);
assert.doesNotMatch(normalizedPricingSource, /<s(?:\s|>)/);
assert.doesNotMatch(normalizedPricingSource, /berhenti kapan saja/);

const checkoutPanelPath = fileURLToPath(
  new URL("../components/billing/checkout-panel.tsx", import.meta.url),
);
assert.equal(
  existsSync(checkoutPanelPath),
  true,
  "CheckoutPanel has not been implemented",
);

const checkoutPanelSource = readFileSync(checkoutPanelPath, "utf8");
const normalizedCheckoutSource = checkoutPanelSource.toLowerCase();

assert.match(checkoutPanelSource, /useState<PaymentMethod>\("qris"\)/);
assert.match(checkoutPanelSource, /value: "qris"/);
assert.match(checkoutPanelSource, /value: "va"/);
assert.match(checkoutPanelSource, /Harga paket/);
assert.match(checkoutPanelSource, /Biaya kanal/);
assert.match(checkoutPanelSource, /Total pembayaran/);
assert.match(normalizedCheckoutSource, /tidak diperpanjang otomatis/);
assert.match(checkoutPanelSource, /type="checkbox"/);
assert.match(checkoutPanelSource, /required/);
assert.match(checkoutPanelSource, /quoteRequestId\.current \+= 1/);
assert.match(checkoutPanelSource, /requestId !== quoteRequestId\.current/);
assert.match(
  checkoutPanelSource,
  /disabled=\{!canCreatePayment\}/,
  "payment action must stay disabled until the quote and terms are ready",
);
assert.match(checkoutPanelSource, /PACKAGE_UNAVAILABLE/);
assert.match(checkoutPanelSource, /PRICE_CHANGED/);
assert.match(checkoutPanelSource, /LIFETIME_ALREADY_ACTIVE/);
assert.match(checkoutPanelSource, /PROVIDER_UNAVAILABLE/);
assert.match(checkoutPanelSource, /PROVIDER_RESPONSE_INVALID/);
assert.match(checkoutPanelSource, /AbortError|TimeoutError/);
assert.match(checkoutPanelSource, /url\.protocol !== "https:"/);
assert.doesNotMatch(normalizedCheckoutSource, /ipaymu/);
assert.doesNotMatch(normalizedCheckoutSource, /provider_reference|providerreference/);

const paymentStatusPanelPath = fileURLToPath(
  new URL("../components/billing/payment-status-panel.tsx", import.meta.url),
);
assert.equal(
  existsSync(paymentStatusPanelPath),
  true,
  "PaymentStatusPanel has not been implemented",
);

const paymentStatusPanelSource = readFileSync(paymentStatusPanelPath, "utf8");
const normalizedPaymentStatusSource = paymentStatusPanelSource.toLowerCase();

assert.match(paymentStatusPanelSource, /PaymentStatusView/);
assert.match(
  paymentStatusPanelSource,
  /const POLL_DELAYS_MS = \[2000, 3000, 5000, 10000, 15000, 30000\] as const/,
);
assert.match(paymentStatusPanelSource, /const VERIFY_WINDOW_MS = 10 \* 60 \* 1000/);
assert.match(paymentStatusPanelSource, /role="status"/);
assert.match(paymentStatusPanelSource, /role="alert"/);
assert.match(paymentStatusPanelSource, /payment\.verificationDeadline/);
assert.match(paymentStatusPanelSource, /payment\.instructions/);
assert.match(paymentStatusPanelSource, /payment\.safeReference/);
assert.match(
  paymentStatusPanelSource,
  /`\/kontak\?reference=\$\{encodeURIComponent\(payment\.safeReference\)\}`/,
);
assert.match(paymentStatusPanelSource, /payment\.duplicateReview/);
assert.match(paymentStatusPanelSource, /cancelClient\(payment\.id\)/);
assert.match(paymentStatusPanelSource, /window\.confirm/);
assert.match(
  paymentStatusPanelSource,
  /`\/checkout\?package=\$\{encodeURIComponent\(purchase\.packageCode\)\}`/,
);
assert.match(paymentStatusPanelSource, /href="\/app"/);
assert.match(paymentStatusPanelSource, /visibilitychange/);
assert.match(paymentStatusPanelSource, /clearTimeout/);
assert.match(paymentStatusPanelSource, /POLL_DELAYS_MS/);
assert.match(paymentStatusPanelSource, /const remaining = VERIFY_WINDOW_MS - elapsed/);
assert.match(
  paymentStatusPanelSource,
  /const delay = Math\.min\(POLL_DELAYS_MS\[Math\.min\(pollIndexRef\.current, POLL_DELAYS_MS\.length - 1\)\], remaining\)/,
);
assert.match(
  paymentStatusPanelSource,
  /window\.setTimeout\(async \(\) => \{\s*if \(Date\.now\(\) - verificationStartedAtRef\.current >= VERIFY_WINDOW_MS\) \{\s*setVerificationWindowExpired\(true\);\s*return;\s*\}[\s\S]*?await refreshStatus\(\);/,
);
assert.match(paymentStatusPanelSource, /\|\| verificationWindowExpired/);
assert.match(
  paymentStatusPanelSource,
  /const refreshOnVisible = \(\) => \{[\s\S]*?const elapsed = Date\.now\(\) - verificationStartedAtRef\.current;[\s\S]*?if \(elapsed >= VERIFY_WINDOW_MS\) \{\s*setVerificationWindowExpired\(true\);\s*return;\s*\}[\s\S]*?void refreshStatus\(\);/,
);
assert.match(paymentStatusPanelSource, /error instanceof BillingClientError/);
assert.match(paymentStatusPanelSource, /error\.code/);
assert.doesNotMatch(paymentStatusPanelSource, /error\.message/);
assert.doesNotMatch(paymentStatusPanelSource, /payment\.redirectUrl/);
assert.doesNotMatch(normalizedPaymentStatusSource, /ipaymu/);
assert.doesNotMatch(
  normalizedPaymentStatusSource,
  /provider_reference|providerreference/,
);

const paymentStatusStylesPath = fileURLToPath(
  new URL("../components/billing/payment-status.module.css", import.meta.url),
);
const paymentStatusStyles = readFileSync(paymentStatusStylesPath, "utf8");
assert.match(paymentStatusStyles, /box-sizing: border-box/);
assert.match(paymentStatusStyles, /--app-paper:/);
assert.match(paymentStatusStyles, /--app-paper-muted:/);
assert.match(paymentStatusStyles, /--app-ink-disabled:/);
assert.match(paymentStatusStyles, /--app-line:/);
assert.match(paymentStatusStyles, /--app-action:/);
assert.match(paymentStatusStyles, /--app-action-hover:/);
assert.match(paymentStatusStyles, /--app-on-action:/);
assert.match(paymentStatusStyles, /--app-font-body:/);
assert.match(paymentStatusStyles, /--space-0:/);
assert.match(paymentStatusStyles, /--space-3:/);
assert.match(paymentStatusStyles, /--radius-round:/);
assert.match(paymentStatusStyles, /--motion-fast:/);
assert.match(paymentStatusStyles, /--motion-overlay:/);
assert.match(paymentStatusStyles, /--ease-standard:/);

const accessSummaryCardPath = fileURLToPath(
  new URL("../components/billing/access-summary-card.tsx", import.meta.url),
);
assert.equal(
  existsSync(accessSummaryCardPath),
  true,
  "AccessSummaryCard has not been implemented",
);

const accessSummaryCardSource = readFileSync(accessSummaryCardPath, "utf8");
assert.match(accessSummaryCardSource, /access: AccessSummary/);
assert.match(accessSummaryCardSource, /access\.isLifetime/);
assert.match(accessSummaryCardSource, /Plus Selamanya/);
assert.match(accessSummaryCardSource, /access\.activeUntil/);
assert.match(accessSummaryCardSource, /Aktif sampai/);
assert.match(accessSummaryCardSource, /Berakhir pada/);
assert.match(
  accessSummaryCardSource,
  /Intl\.DateTimeFormat\("id-ID", \{[\s\S]*timeZone: "Asia\/Jakarta"/,
  "access dates must render in the product timezone",
);
assert.match(
  accessSummaryCardSource,
  /const canRenew = access\.entitlementType === "term"/,
  "only term access may expose renewal",
);
assert.match(
  accessSummaryCardSource,
  /\{canRenew \? \([\s\S]*href="\/harga"[\s\S]*Perpanjang Plus[\s\S]*\) : null\}/,
  "active-term and expired access must expose the renewal action",
);
assert.doesNotMatch(accessSummaryCardSource, /new Date\(\)/);

const latestPaymentCardPath = fileURLToPath(
  new URL("../components/billing/latest-payment-card.tsx", import.meta.url),
);
assert.equal(
  existsSync(latestPaymentCardPath),
  true,
  "LatestPaymentCard has not been implemented",
);

const latestPaymentCardSource = readFileSync(latestPaymentCardPath, "utf8");
const normalizedLatestPaymentSource = latestPaymentCardSource.toLowerCase();
assert.match(latestPaymentCardSource, /payment: LatestPaymentSummary \| null/);
assert.match(latestPaymentCardSource, /payment\.packageName/);
assert.match(latestPaymentCardSource, /payment\.method/);
assert.match(latestPaymentCardSource, /payment\.state/);
assert.match(latestPaymentCardSource, /payment\.baseAmount/);
assert.match(latestPaymentCardSource, /payment\.channelFee/);
assert.match(latestPaymentCardSource, /payment\.totalAmount/);
assert.match(latestPaymentCardSource, /payment\.safeReference/);
assert.match(latestPaymentCardSource, /payment\.createdAt/);
assert.match(latestPaymentCardSource, /payment\.paidAt/);
assert.match(
  latestPaymentCardSource,
  /Intl\.DateTimeFormat\("id-ID", \{[\s\S]*timeZone: "Asia\/Jakarta"/,
  "payment dates must render in the product timezone",
);
assert.doesNotMatch(normalizedLatestPaymentSource, /ipaymu|provider_reference|providerreference/);

const appTopBarPath = fileURLToPath(
  new URL("../components/AppTopBar.tsx", import.meta.url),
);
const appTopBarSource = readFileSync(appTopBarPath, "utf8");
assert.match(appTopBarSource, /access: AccessSummary/);
assert.match(appTopBarSource, /accessLabel\(access\)/);
assert.doesNotMatch(appTopBarSource, /isPlus: boolean|isExpired: boolean/);
assert.match(appTopBarSource, /event\.key === "Escape"/);
assert.match(appTopBarSource, /document\.addEventListener\("mousedown", handleOutsideClick\)/);
assert.match(appTopBarSource, /clearInvoiceFormCache/);

const profileContentPath = fileURLToPath(
  new URL("../components/ProfileContent.tsx", import.meta.url),
);
const profileContentSource = readFileSync(profileContentPath, "utf8");
assert.match(profileContentSource, /access: AccessSummary/);
assert.match(profileContentSource, /latestPayment: LatestPaymentSummary \| null/);
assert.match(profileContentSource, /<AccessSummaryCard access=\{access\} \/>/);
assert.match(profileContentSource, /<LatestPaymentCard payment=\{latestPayment\} \/>/);
assert.match(profileContentSource, /updateName\(formData\)/);
assert.match(profileContentSource, /com\.tutorlog\.app/);

const homeUpgradePromptPath = fileURLToPath(
  new URL("../components/HomeUpgradePrompt.tsx", import.meta.url),
);
const homeUpgradePromptSource = readFileSync(homeUpgradePromptPath, "utf8");
assert.match(homeUpgradePromptSource, /href="\/harga"/);
assert.doesNotMatch(homeUpgradePromptSource, /useState|PaywallDialog|\/checkout/);

const paywallDialogPath = fileURLToPath(
  new URL("../components/PaywallDialog.tsx", import.meta.url),
);
const paywallDialogSource = readFileSync(paywallDialogPath, "utf8");
assert.match(paywallDialogSource, /<Dialog/);
assert.match(paywallDialogSource, /open=\{open\}/);
assert.match(paywallDialogSource, /onOpenChange=/);
assert.match(paywallDialogSource, /data-analytics-id="billing-paywall"/);
assert.match(paywallDialogSource, /href="\/harga"/);
assert.doesNotMatch(paywallDialogSource, /PricingCatalog|CheckoutPanel|\/checkout/);

const appLayoutPath = fileURLToPath(
  new URL("../app/app/layout.tsx", import.meta.url),
);
const appLayoutSource = readFileSync(appLayoutPath, "utf8");
assert.match(appLayoutSource, /getAccessSummary\(\)/);
assert.match(appLayoutSource, /<AppTopBar[\s\S]*access=\{access\}/);

const profilePagePath = fileURLToPath(
  new URL("../app/app/profil/page.tsx", import.meta.url),
);
const profilePageSource = readFileSync(profilePagePath, "utf8");
assert.match(profilePageSource, /getAccessSummary\(\)/);
assert.match(profilePageSource, /\.from\("billing_payments"\)/);
assert.match(profilePageSource, /safe_reference/);
assert.match(profilePageSource, /latestPayment=/);
assert.match(profilePageSource, /access=\{access\}/);

const pricingPagePath = fileURLToPath(
  new URL("../app/harga/page.tsx", import.meta.url),
);
const pricingPageSource = readFileSync(pricingPagePath, "utf8");
assert.match(pricingPageSource, /getCatalog\(\)/);
assert.match(pricingPageSource, /FALLBACK_BILLING_CATALOG/);
assert.match(pricingPageSource, /createClient\(\)/);
assert.match(pricingPageSource, /auth\.getUser\(\)/);
assert.match(pricingPageSource, /<PricingCatalog products=\{products\} authenticated=\{authenticated\} \/>/);
assert.doesNotMatch(
  pricingPageSource,
  /catalogUnavailable\s*\?\s*\([\s\S]*Daftar paket belum dapat dimuat/,
);
assert.doesNotMatch(pricingPageSource.toLowerCase(), /lynk\.id|lynkurl/);
assert.doesNotMatch(pricingPageSource, /fetch\(/, "pricing must query the server catalog directly");

const checkoutPagePath = fileURLToPath(
  new URL("../app/checkout/page.tsx", import.meta.url),
);
assert.equal(existsSync(checkoutPagePath), true, "checkout route has not been wired");
const checkoutPageSource = readFileSync(checkoutPagePath, "utf8");
assert.match(checkoutPageSource, /requireUser\(\)/);
assert.match(checkoutPageSource, /isPackageCode\(requestedPackage\)/);
assert.match(checkoutPageSource, /packageCode === "free"/);
assert.match(checkoutPageSource, /getCatalog\(\)/);
assert.match(checkoutPageSource, /getAccessSummary\(\)/);
assert.match(checkoutPageSource, /access\.isLifetime/);
assert.match(checkoutPageSource, /!product\.available/);
assert.match(checkoutPageSource, /getQuote\(packageCode, "qris"\)/);
assert.match(checkoutPageSource, /paymentReady/);
assert.match(checkoutPageSource, /createDisplayQuote/);
assert.match(checkoutPageSource, /redirect\("\/harga\?reason=/);
assert.match(
  checkoutPageSource,
  /<Link href="\/harga"[\s\S]*Kembali ke harga[\s\S]*<\/Link>/,
  "checkout must provide an in-page route back to pricing",
);
assert.match(
  checkoutPageSource,
  /<CheckoutPanel[\s\S]*product=\{product\}[\s\S]*initialQuote=\{initialQuote\}[\s\S]*paymentReady=\{paymentReady\}[\s\S]*\/>/,
);
assert.doesNotMatch(checkoutPageSource, /fetch\(/);

assert.match(checkoutPanelSource, /paymentReady\s*&&[\s\S]*termsAccepted/);
assert.match(
  checkoutPanelSource,
  /paymentReady \? "Lanjutkan pembayaran" : "Pembayaran segera tersedia"/,
);

const paymentPagePath = fileURLToPath(
  new URL("../app/pembayaran/[purchaseId]/page.tsx", import.meta.url),
);
assert.equal(existsSync(paymentPagePath), true, "payment status route has not been wired");
const paymentPageSource = readFileSync(paymentPagePath, "utf8");
assert.match(paymentPageSource, /requireUser\(\)/);
assert.match(paymentPageSource, /isUuid\(purchaseId\)/);
assert.match(paymentPageSource, /getPurchaseStatus\(user\.id, purchaseId\)/);
assert.match(paymentPageSource, /error instanceof BillingError/);
assert.match(paymentPageSource, /error\.code === "PURCHASE_NOT_FOUND"/);
assert.match(paymentPageSource, /notFound\(\)/);
assert.match(paymentPageSource, /<PaymentStatusPanel initialPurchase=\{purchase\} \/>/);
assert.doesNotMatch(
  paymentPageSource,
  /searchParams[\s\S]*(?:update|insert|rpc|createOrResumePurchase|cancelPendingPayment)/,
  "provider return query parameters must never mutate billing state",
);

for (const loadingPath of [
  "../app/checkout/loading.tsx",
  "../app/pembayaran/[purchaseId]/loading.tsx",
]) {
  const absoluteLoadingPath = fileURLToPath(new URL(loadingPath, import.meta.url));
  assert.equal(existsSync(absoluteLoadingPath), true, `${loadingPath} has not been implemented`);
  const loadingSource = readFileSync(absoluteLoadingPath, "utf8");
  assert.match(loadingSource, /LoadingState/);
}

const proxySource = readFileSync(
  fileURLToPath(new URL("../proxy.ts", import.meta.url)),
  "utf8",
);
assert.match(
  proxySource,
  /matcher: \["\/app\/:path\*", "\/checkout", "\/pembayaran\/:path\*"\]/,
);
assert.match(proxySource, /`\$\{request\.nextUrl\.pathname\}\$\{request\.nextUrl\.search\}`/);
assert.match(proxySource, /url\.searchParams\.set\("next", returnPath\)/);

const analyticsClientPath = fileURLToPath(
  new URL("../lib/billing/analytics-client.ts", import.meta.url),
);
assert.equal(existsSync(analyticsClientPath), true, "billing analytics client has not been implemented");
const analyticsClientSource = readFileSync(analyticsClientPath, "utf8");
for (const eventName of [
  "pricing_viewed",
  "package_selected",
  "paywall_opened",
  "checkout_started",
  "payment_method_selected",
  "payment_pending",
  "payment_paid",
  "payment_expired",
  "payment_failed",
  "entitlement_activated",
  "export_allowed",
  "export_blocked",
]) {
  assert.match(analyticsClientSource, new RegExp(`"${eventName}"`));
}
assert.match(analyticsClientSource, /ALLOWED_EVENT_NAMES\.has\(eventName\)/);
assert.match(analyticsClientSource, /void fetch\("\/api\/analytics"/);
assert.match(analyticsClientSource, /\.catch\(\(\) => undefined\)/);
assert.doesNotMatch(
  analyticsClientSource.toLowerCase(),
  /ipaymu|provider|signature|qrpayload|vanumber|secret|token/,
);

assert.match(pricingCatalogSource, /trackBillingEvent\("pricing_viewed"/);
assert.match(pricingCatalogSource, /trackBillingEvent\("package_selected"/);
assert.match(checkoutPanelSource, /trackBillingEvent\("checkout_started"/);
assert.match(checkoutPanelSource, /trackBillingEvent\("payment_method_selected"/);
assert.match(paymentStatusPanelSource, /payment_pending/);
assert.match(paymentStatusPanelSource, /payment_paid/);
assert.match(paymentStatusPanelSource, /payment_expired/);
assert.match(paymentStatusPanelSource, /payment_failed/);
assert.match(paymentStatusPanelSource, /entitlement_activated/);
assert.match(paywallDialogSource, /trackBillingEvent\("paywall_opened"/);

const billingClientSource = readFileSync(
  fileURLToPath(new URL("../lib/billing/client.ts", import.meta.url)),
  "utf8",
);
assert.match(billingClientSource, /result\.allowed \? "export_allowed" : "export_blocked"/);
assert.match(billingClientSource, /const BROWSER_REQUEST_TIMEOUT_MS = \d+;/);
assert.match(billingClientSource, /const requestController = new AbortController\(\);/);
assert.match(billingClientSource, /const callerSignal = init\?\.signal;/);
assert.match(billingClientSource, /callerSignal\.addEventListener\("abort", abortFromCaller, \{ once: true \}\);/);
assert.match(billingClientSource, /callerSignal\?\.removeEventListener\("abort", abortFromCaller\);/);
assert.match(billingClientSource, /timeoutError\.name = "TimeoutError";/);
assert.match(billingClientSource, /signal: requestController\.signal/);
assert.match(
  billingClientSource,
  /body = await response\.json\(\);\s*\} catch \(error\) \{\s*if \(requestController\.signal\.aborted\) throw error;\s*throw new BillingClientError\("PROVIDER_RESPONSE_INVALID"\);/,
  "timeout and caller aborts during JSON parsing must retain their abort identity",
);
assert.match(billingClientSource, /if \(timedOut\) throw timeoutError;/);
assert.match(billingClientSource, /clearTimeout\(timeoutId\);/);

assert.match(paymentStatusPanelSource, /const refreshRequestSequenceRef = useRef\(0\);/);
assert.match(
  paymentStatusPanelSource,
  /const requestSequence = \+\+refreshRequestSequenceRef\.current;\s*const ownsLatestRequest = \(\) => refreshRequestSequenceRef\.current === requestSequence;/,
  "each payment refresh must capture monotonic latest-request ownership",
);
assert.match(
  paymentStatusPanelSource,
  /const nextPurchase = await statusClient\(purchase\.id\);\s*if \(!ownsLatestRequest\(\)\) return;\s*setPurchase\(nextPurchase\);/,
  "stale payment successes must not replace the latest purchase",
);
assert.match(
  paymentStatusPanelSource,
  /catch \(error\) \{\s*if \(!ownsLatestRequest\(\)\) return;\s*setLoadError\(errorMessage\(error\)\);\s*\} finally \{\s*if \(ownsLatestRequest\(\)\) setChecking\(false\);/,
  "stale payment errors and finally blocks must not replace current UI state",
);

console.log("billing UI contract valid");
