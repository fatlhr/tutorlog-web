import assert from "node:assert/strict";
import {
  getAvailableStudentFilterOptions,
  hasUnappliedCustomRange,
} from "../lib/data/rekap-filter.ts";

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

console.log("rekap filter contract valid");
