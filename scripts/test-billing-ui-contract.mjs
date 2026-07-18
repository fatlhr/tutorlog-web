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

console.log("billing UI contract valid");
