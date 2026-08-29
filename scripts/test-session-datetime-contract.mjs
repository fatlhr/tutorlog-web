import assert from "node:assert/strict";

let sessionDateTime;
try {
  sessionDateTime = await import("../lib/data/session-datetime.mjs");
} catch (error) {
  if (error?.code !== "ERR_MODULE_NOT_FOUND") throw error;
}

assert.ok(
  sessionDateTime,
  "shared WIB session date/time formatter must exist",
);

const {
  formatWibSessionDate,
  formatWibSessionTimeRange,
} = sessionDateTime;

for (const [clockInAt, clockOutAt, expected] of [
  ["2026-08-23T02:30:00.000Z", "2026-08-23T04:00:00.000Z", "09:30 - 11:00"],
  ["2026-08-15T12:30:00.000Z", "2026-08-15T14:00:00.000Z", "19:30 - 21:00"],
  ["2026-08-01T02:00:00.000Z", "2026-08-01T04:00:00.000Z", "09:00 - 11:00"],
]) {
  assert.equal(formatWibSessionTimeRange(clockInAt, clockOutAt), expected);
}

assert.equal(
  formatWibSessionTimeRange("2026-08-23T02:30:00.000Z", null),
  "09:30 - selesai",
);

assert.equal(
  formatWibSessionTimeRange(
    "2026-08-23T17:00:00.000Z",
    "2026-08-23T18:30:00.000Z",
  ),
  "00:00 - 01:30",
);

assert.equal(
  formatWibSessionDate("2026-08-23T18:30:00.000Z"),
  "24 Agu 2026",
);

console.log("session datetime contract passed");
