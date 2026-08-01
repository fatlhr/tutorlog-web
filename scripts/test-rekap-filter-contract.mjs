import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getAvailableStudentFilterOptions,
  getRekapPresetRange,
  hasUnappliedCustomRange,
  isValidRekapCustomRange,
} from "../lib/data/rekap-filter.ts";

assert.deepEqual(
  getRekapPresetRange("current", "2026-08-01"),
  { from: "2026-08-01", to: "2026-08-01" },
);

assert.deepEqual(
  getRekapPresetRange("current", "2026-08-17"),
  { from: "2026-08-01", to: "2026-08-17" },
);

assert.deepEqual(
  getRekapPresetRange("previous", "2027-01-01"),
  { from: "2026-12-01", to: "2026-12-31" },
);

assert.deepEqual(
  getRekapPresetRange("current", "2028-02-29"),
  { from: "2028-02-01", to: "2028-02-29" },
);

assert.equal(isValidRekapCustomRange("2026-08-01", "2026-08-17", "2026-08-17"), true);
assert.equal(isValidRekapCustomRange("2026-08-18", "2026-08-17", "2026-08-17"), false);
assert.equal(isValidRekapCustomRange("2026-08-01", "2026-08-18", "2026-08-17"), false);

const applied = {
  appliedFrom: "2026-07-01",
  appliedTo: "2026-07-31",
};

assert.equal(
  hasUnappliedCustomRange({
    rangeMode: "custom",
    appliedRangeMode: "custom",
    dateFrom: "2026-07-10",
    dateTo: "2026-07-31",
    ...applied,
  }),
  true,
);

assert.equal(
  hasUnappliedCustomRange({
    rangeMode: "custom",
    appliedRangeMode: "custom",
    dateFrom: "2026-07-01",
    dateTo: "2026-07-31",
    ...applied,
  }),
  false,
);

assert.equal(
  hasUnappliedCustomRange({
    rangeMode: "current",
    appliedRangeMode: "current",
    dateFrom: "2026-07-10",
    dateTo: "2026-07-31",
    ...applied,
  }),
  false,
);

assert.equal(
  hasUnappliedCustomRange({
    rangeMode: "custom",
    appliedRangeMode: "current",
    dateFrom: "2026-07-01",
    dateTo: "2026-07-31",
    ...applied,
  }),
  true,
);

assert.deepEqual(
  getAvailableStudentFilterOptions({
    students: ["Hanif Mubarak", "Citra Lestari"],
    customRangePending: true,
  }),
  [],
);

assert.deepEqual(
  getAvailableStudentFilterOptions({
    students: ["Hanif Mubarak", "Citra Lestari"],
    customRangePending: false,
  }),
  ["Hanif Mubarak", "Citra Lestari"],
);

const rekapPage = readFileSync(new URL("../app/app/rekap/page.tsx", import.meta.url), "utf8");
const rekapContent = readFileSync(new URL("../components/RekapContent.tsx", import.meta.url), "utf8");

assert.match(rekapPage, /getWibMonthToDateRange\(new Date\(\)\)/);
assert.match(rekapPage, /params\.from \?\? defaultRange\.from/);
assert.match(rekapPage, /params\.to \?\? defaultRange\.to/);
assert.match(rekapPage, /wibToday=\{defaultRange\.to\}/);

assert.match(rekapContent, /getRekapPresetRange/);
assert.match(rekapContent, /isValidRekapCustomRange/);
assert.doesNotMatch(rekapContent, /function monthDateRange/);
assert.equal(
  (rekapContent.match(/max=\{wibToday\}/g) ?? []).length,
  2,
  "both custom date fields must cap selection at today's WIB date",
);
assert.match(
  rekapContent,
  /if \(!isValidRekapCustomRange\(dateFrom, dateTo, wibToday\)\)/,
  "invalid custom ranges must be rejected before navigation",
);

console.log("rekap filter contract passed");
