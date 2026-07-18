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

console.log("billing UI contract valid");
