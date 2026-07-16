import assert from "node:assert/strict";
import {
  canExportInvoice,
  canExportRecap,
  getAccessState,
  normalizeQuotaPayload,
} from "../lib/data/quota-access.ts";

const future = new Date(Date.now() + 7 * 86400000).toISOString();
const past = new Date(Date.now() - 7 * 86400000).toISOString();
const exactExpiry = "2026-07-16T12:00:00.000Z";

function quota(overrides = {}) {
  return normalizeQuotaPayload({
    plan: "free",
    active_until: null,
    export_window_days: 30,
    rekap_export_limit: 2,
    rekap_export_unlimited: false,
    rekap_pdf_export_count: 0,
    rekap_csv_export_count: 0,
    ...overrides,
  });
}

assert.equal(getAccessState(quota()).state, "free");
assert.equal(
  getAccessState(quota({
    plan: "plus",
    entitlement_type: "term",
    is_lifetime: false,
    active_until: future,
  })).state,
  "plus_active",
);
assert.equal(
  getAccessState(quota({
    plan: "plus",
    entitlement_type: "term",
    is_lifetime: false,
    active_until: past,
  })).state,
  "plus_expired",
);

const lifetime = quota({
  plan: "full_access",
  entitlement_type: "lifetime",
  is_lifetime: true,
  active_until: null,
});
assert.equal(lifetime.entitlementType, "lifetime");
assert.equal(lifetime.isLifetime, true);
assert.equal(getAccessState(lifetime).state, "plus_active");
assert.notEqual(
  getAccessState(quota({ plan: "full_access", active_until: null })).state,
  "plus_active",
  "a missing expiry alone must not imply lifetime access",
);
assert.equal(
  getAccessState(quota({
    plan: "plus",
    entitlement_type: "term",
    is_lifetime: false,
    active_until: "not-a-date",
  })).state,
  "plus_expired",
  "an invalid term expiry must never become active",
);
assert.equal(
  getAccessState(
    quota({
      plan: "plus",
      entitlement_type: "term",
      is_lifetime: false,
      active_until: exactExpiry,
    }),
    new Date(exactExpiry),
  ).state,
  "plus_expired",
  "term access expires at the exact server timestamp",
);

assert.equal(canExportRecap("pdf", quota({ rekap_pdf_export_count: 1 })).allowed, true);
assert.equal(canExportRecap("pdf", quota({ rekap_pdf_export_count: 2 })).allowed, false);
assert.equal(canExportRecap("csv", quota({ rekap_csv_export_count: 1 })).allowed, true);
assert.equal(canExportRecap("csv", quota({ rekap_csv_export_count: 2 })).allowed, false);

assert.equal(
  canExportRecap("pdf", quota({
    plan: "plus",
    entitlement_type: "term",
    is_lifetime: false,
    active_until: future,
    rekap_pdf_export_count: 99,
  })).allowed,
  true,
);
assert.equal(
  canExportRecap("csv", quota({
    plan: "plus",
    entitlement_type: "term",
    is_lifetime: false,
    active_until: past,
    rekap_csv_export_count: 2,
  })).allowed,
  false,
);

assert.equal(canExportInvoice(quota()).allowed, false);
assert.equal(canExportInvoice(quota({
  plan: "plus",
  entitlement_type: "term",
  is_lifetime: false,
  active_until: past,
})).allowed, false);
assert.equal(canExportInvoice(quota({
  plan: "plus",
  entitlement_type: "term",
  is_lifetime: false,
  active_until: future,
})).allowed, true);

const legacy = normalizeQuotaPayload({
  plan: "free",
  pdf_export_free_limit: 1,
  pdf_export_unlimited: false,
  pdf_export_count_30d: 1,
  csv_export_count_30d: 0,
  export_window_days: 30,
  active_until: null,
});

assert.equal(legacy.rekapExportLimit, 1);
assert.equal(legacy.rekapPdfExportCount, 1);
assert.equal(legacy.rekapCsvExportCount, 0);
assert.equal(canExportRecap("pdf", legacy).allowed, false);
assert.equal(canExportRecap("csv", legacy).allowed, true);

console.log("quota access contract valid");
