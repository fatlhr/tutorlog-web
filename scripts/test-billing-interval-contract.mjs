import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  formatBillingTypeLabel,
  formatDurationMinutes,
  getSessionMetrics,
  normalizeBillingType,
} from "../lib/data/session-metrics.mjs";

const clockInAt = "2026-07-15T10:00:00.000Z";

function session(minutes, billingType, hourlyRate = 80_000) {
  const clockOutAt = new Date(
    new Date(clockInAt).getTime() + (minutes * 60_000),
  ).toISOString();

  return getSessionMetrics({ clockInAt, clockOutAt, hourlyRate, billingType });
}

for (const [raw, expected] of [
  [null, "sixty_minutes"],
  ["hourly", "sixty_minutes"],
  ["sixty_minutes", "sixty_minutes"],
  ["ninety_minutes", "ninety_minutes"],
  ["flat", "flat"],
]) {
  assert.equal(normalizeBillingType(raw), expected);
}

assert.equal(normalizeBillingType("weekly"), "invalid");

for (const [minutes, billableMinutes] of [
  [1, 60],
  [45, 60],
  [60, 60],
  [61, 60],
  [75, 90],
  [90, 90],
  [105, 120],
  [1441, 1440],
]) {
  const result = session(minutes, "sixty_minutes");
  assert.equal(result.durationMinutes, Math.min(Math.max(Math.floor(minutes), 1), 1440));
  assert.equal(result.billableMinutes, billableMinutes);
  assert.equal(result.amount, (billableMinutes / 30) * 40_000);
  assert.equal(result.isValid, true);
}

assert.deepEqual(session(60, "ninety_minutes", 90_000), {
  durationMinutes: 60,
  billableMinutes: 90,
  amount: 90_000,
  billingType: "ninety_minutes",
  isValid: true,
});

assert.deepEqual(session(105, "ninety_minutes", 100_000), {
  durationMinutes: 105,
  billableMinutes: 120,
  amount: 133_333,
  billingType: "ninety_minutes",
  isValid: true,
});

assert.deepEqual(session(150, "flat", 125_000), {
  durationMinutes: 150,
  billableMinutes: 150,
  amount: 125_000,
  billingType: "flat",
  isValid: true,
});

assert.equal(
  [
    session(60, "sixty_minutes", 80_000).amount,
    session(60, "ninety_minutes", 90_000).amount,
    session(150, "flat", 125_000).amount,
  ].reduce((total, amount) => total + amount, 0),
  295_000,
);

assert.equal(session(60, "unknown").isValid, false);
assert.equal(session(60, "unknown").amount, 0);

for (const [minutes, expected] of [
  [60, "60 menit"],
  [90, "90 menit"],
  [120, "120 menit"],
  [150, "2 jam 30 menit"],
  [180, "3 jam"],
]) {
  assert.equal(formatDurationMinutes(minutes), expected);
}

assert.deepEqual(
  ["sixty_minutes", "ninety_minutes", "flat"].map(formatBillingTypeLabel),
  ["Per 60 menit", "Per 90 menit", "Flat"],
);

const invoiceSource = readFileSync(new URL("../app/app/invoice/page.tsx", import.meta.url), "utf8");
const recapSource = readFileSync(new URL("../components/RekapContent.tsx", import.meta.url), "utf8");
const invoiceDataSource = readFileSync(new URL("../components/invoice/invoice-data.ts", import.meta.url), "utf8");
const invoiceTemplateSource = readFileSync(new URL("../components/invoice/TplModern.tsx", import.meta.url), "utf8");
const invoiceTemplateSources = [
  invoiceTemplateSource,
  readFileSync(new URL("../components/invoice/TplKlasik.tsx", import.meta.url), "utf8"),
  readFileSync(new URL("../components/invoice/TplMinimal.tsx", import.meta.url), "utf8"),
];

assert.match(invoiceSource, /getSessionMetrics\(/);
assert.match(invoiceSource, /hourly_rate_snapshot/);
assert.match(invoiceSource, /const rate = \(row\.hourly_rate_snapshot as number\) \?\? 0/);
assert.match(invoiceSource, /billingTypeLabel|formatBillingTypeLabel/);
assert.match(invoiceSource, /invalid billing|Billing tidak valid/i);
assert.match(recapSource, /formatDurationMinutes/);
assert.match(invoiceDataSource, /durationMinutes/);
assert.match(invoiceDataSource, /getInvoiceRateColumnLabel/);
assert.match(invoiceTemplateSource, />Durasi</);
for (const templateSource of invoiceTemplateSources) {
  assert.match(templateSource, /getInvoiceRateColumnLabel\(data\.items\)/);
  assert.doesNotMatch(templateSource, /invoice-billing-meta/);
}

console.log("billing interval contract passed");
