import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const recap = readFileSync(join(root, "components/RekapContent.tsx"), "utf8");
const invoice = readFileSync(join(root, "app/app/invoice/page.tsx"), "utf8");
const quota = readFileSync(join(root, "lib/data/quota.ts"), "utf8");

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

assert.match(
  recap,
  /import \{ authorizeExport \} from "@\/lib\/billing\/client";/,
  "Recap exports must use the billing authorization client",
);
assert.equal(
  countMatches(recap, /await authorizeExport\("recap_csv"\)/g),
  1,
  "CSV export must await exactly one server authorization",
);
assert.equal(
  countMatches(recap, /await authorizeExport\("recap_pdf"\)/g),
  1,
  "Recap PDF export must await exactly one server authorization",
);
assert.match(
  recap,
  /setCsvLoading\(true\);[\s\S]*await authorizeExport\("recap_csv"\)[\s\S]*if \(!decision\.allowed\) \{[\s\S]*setPaywallReason\(decision\.reason \?\? "free-limit"\);[\s\S]*setPaywallOpen\(true\);[\s\S]*return;[\s\S]*\}[\s\S]*downloadCSV\([\s\S]*\} finally \{[\s\S]*setCsvLoading\(false\);/,
  "CSV export must authorize while loading, open its contextual paywall when blocked, and always clear loading",
);
assert.match(
  recap,
  /setPdfLoading\(true\);[\s\S]*await authorizeExport\("recap_pdf"\)[\s\S]*if \(!decision\.allowed\) \{[\s\S]*setPaywallReason\(decision\.reason \?\? "free-limit"\);[\s\S]*setPaywallOpen\(true\);[\s\S]*return;[\s\S]*\}[\s\S]*pdf\.save\("rekap-sesi\.pdf"\);[\s\S]*\} finally \{[\s\S]*setPdfLoading\(false\);/,
  "Recap PDF export must authorize while loading, open its contextual paywall when blocked, and always clear loading",
);

assert.match(
  invoice,
  /import \{ authorizeExport \} from "@\/lib\/billing\/client";/,
  "Invoice export must use the billing authorization client",
);
assert.equal(
  countMatches(invoice, /await authorizeExport\("invoice_pdf"\)/g),
  1,
  "Invoice PDF export must await exactly one server authorization",
);
assert.match(
  invoice,
  /if \(!validateInvoiceForm\(\)\) return;[\s\S]*setExporting\(true\);[\s\S]*await authorizeExport\("invoice_pdf"\)[\s\S]*if \(!decision\.allowed\) \{[\s\S]*setPaywallReason\(decision\.reason \?\? "invoice-locked"\);[\s\S]*setPaywallOpen\(true\);[\s\S]*return;[\s\S]*\}[\s\S]*html2canvas\([\s\S]*pdf\.save\([\s\S]*\} finally \{[\s\S]*setExporting\(false\);/,
  "Invoice export must preserve validation, authorize while loading, block into its contextual paywall, and always clear loading",
);

assert.doesNotMatch(
  `${recap}\n${invoice}`,
  /record_feature_usage_event|recordExportEvent/,
  "Export consumers must not record a second usage event after authorization",
);
assert.doesNotMatch(
  quota,
  /export async function recordExportEvent|record_feature_usage_event/,
  "The obsolete export recording action must be removed after both consumers migrate",
);

console.log("Export authorization contract: recap CSV, recap PDF, and invoice PDF use one atomic server decision");
