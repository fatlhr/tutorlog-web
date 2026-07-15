import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  publicProductInvoiceData,
  publicRecapEvidence,
  publicSessionEvidence,
} from "../components/public-ui/product-evidence/product-evidence-data.ts";

assert.equal(publicProductInvoiceData.no, "INV-2026-06-014");
assert.equal(publicProductInvoiceData.items.length, 3);
assert.deepEqual(publicSessionEvidence, {
  date: "03 Jun",
  description: "Matematika - Trigonometri",
  hours: 1.5,
  amount: 180000,
  status: "Selesai",
});
assert.deepEqual(publicRecapEvidence, {
  period: "Juni 2026",
  sessionCount: 3,
  hours: 5,
  amount: 560000,
});
assert.equal(
  publicProductInvoiceData.items.reduce((sum, item) => sum + item.amount, 0),
  publicRecapEvidence.amount,
);

const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const features = await readFile(new URL("../app/fitur/page.tsx", import.meta.url), "utf8");
const guide = await readFile(new URL("../app/panduan/page.tsx", import.meta.url), "utf8");
const pricing = await readFile(new URL("../app/harga/page.tsx", import.meta.url), "utf8");

assert.match(home, /<WorkflowCanvas\s*\/>/);
assert.doesNotMatch(home, /proofStories/);
assert.equal((features.match(/data-evidence-group=/g) ?? []).length, 3);
assert.doesNotMatch(guide, /PublicProductProof/);
assert.match(guide, /<MobileGuideEvidence\s*\/>/);
assert.match(guide, /<WebGuideEvidence\s*\/>/);
assert.doesNotMatch(pricing, /PublicProductProof/);

console.log("public product evidence contract valid");
