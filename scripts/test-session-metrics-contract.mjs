import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getSessionMetrics,
  getWibMonthRange,
  toWibDateRange,
} from "../lib/data/session-metrics.mjs";

function hourlySession(minutes, hourlyRate = 80_000) {
  const clockInAt = "2026-07-15T10:00:00.000Z";
  const clockOutAt = new Date(
    new Date(clockInAt).getTime() + (minutes * 60_000),
  ).toISOString();

  return getSessionMetrics({
    clockInAt,
    clockOutAt,
    hourlyRate,
    billingType: "hourly",
  });
}

for (const [minutes, expectedAmount] of [
  [0.5, 80_000],
  [1, 80_000],
  [45, 80_000],
  [60, 80_000],
  [61, 80_000],
  [74, 80_000],
  [75, 120_000],
  [91, 120_000],
  [105, 160_000],
]) {
  assert.equal(
    hourlySession(minutes).amount,
    expectedAmount,
    `${minutes} minutes must follow the mobile billing rule`,
  );
}

assert.deepEqual(
  getSessionMetrics({
    clockInAt: "2026-07-15T10:00:00.000Z",
    clockOutAt: "2026-07-15T10:31:00.000Z",
    hourlyRate: 80_000,
    billingType: "flat",
  }),
  {
    actualMinutes: 31,
    actualHours: 0.5,
    billableMinutes: 0,
    amount: 80_000,
    billingType: "flat",
  },
);

for (const clockOutAt of [null, "invalid", "2026-07-15T09:59:00.000Z"]) {
  assert.equal(
    getSessionMetrics({
      clockInAt: "2026-07-15T10:00:00.000Z",
      clockOutAt,
      hourlyRate: 80_000,
      billingType: "hourly",
    }).amount,
    0,
  );
}

assert.deepEqual(toWibDateRange("2026-07-01", "2026-07-31"), {
  startISO: "2026-06-30T17:00:00.000Z",
  endExclusiveISO: "2026-07-31T17:00:00.000Z",
});

assert.deepEqual(
  getWibMonthRange(new Date("2026-07-31T20:00:00.000Z")),
  { from: "2026-08-01", to: "2026-08-31", year: 2026, month: 8 },
);

const rekapSource = readFileSync(new URL("../lib/data/rekap.ts", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../app/app/page.tsx", import.meta.url), "utf8");
const invoiceSource = readFileSync(new URL("../app/app/invoice/page.tsx", import.meta.url), "utf8");

for (const [surface, source] of [
  ["Rekap", rekapSource],
  ["Invoice", invoiceSource],
]) {
  assert.match(source, /getSessionMetrics\(/, `${surface} must use the shared billing helper`);
  assert.match(source, /toWibDateRange\(/, `${surface} must use the shared WIB range helper`);
  assert.match(source, /\.lt\("clock_in_at", endExclusiveISO\)/, `${surface} must use a half-open date range`);
}

assert.match(homeSource, /getWibMonthRange\(now\)/);
assert.match(homeSource, /getWibMonthRange\(now, -1\)/);
assert.match(rekapSource, /sum \+ session\.rawAmount/);
assert.doesNotMatch(rekapSource, /Math\.round\(durationHours \*/);
assert.doesNotMatch(invoiceSource, /Math\.round\(hours \* rate\)/);

console.log("session metrics contract passed");
