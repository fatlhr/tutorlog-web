import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const fallbackCatalog = read("lib/billing/fallback-catalog.ts");
const pricingCatalog = read("components/billing/pricing-catalog.tsx");
const paywall = read("components/PaywallDialog.tsx");
const invoice = read("app/app/invoice/page.tsx");
const recap = read("components/RekapContent.tsx");
const features = read("app/fitur/page.tsx");
const terms = read("components/content/terms-content.tsx");
const privacy = read("components/content/privacy-content.tsx");

// Package copy names the free tier plainly and avoids the retired benefit wording.
assert.match(fallbackCatalog, /name: "Paket Free"/);
assert.match(
  fallbackCatalog,
  /description: "Catat sesi, periksa rekap, dan susun draft invoice dengan batas ekspor gratis\."/,
);
assert.doesNotMatch(fallbackCatalog, /Akses penuh|Premium/i);
assert.doesNotMatch(pricingCatalog, /\bUpgrade\b|\bPremium\b/i);

// The invoice paywall keeps the draft available to Free and reserves the PDF download for Plus.
assert.match(
  paywall,
  /"Kamu tetap bisa menyusun dan memeriksa draft invoice dengan Paket Free\. Aktifkan Plus untuk mengunduh PDF\."/,
);
assert.match(paywall, /const primaryCta = expired \? "Perpanjang Plus" : "Aktifkan Plus"/);
assert.doesNotMatch(paywall, />\s*Export(?:\s|<)/i);
assert.doesNotMatch(paywall, />\s*Premium(?:\s|<)/i);

// Web actions name their downloaded format, rather than using the generic legacy action.
assert.match(invoice, />\s*Unduh PDF\s*</);
assert.match(recap, />\s*Unduh CSV\s*</);
assert.match(recap, />\s*Unduh PDF\s*</);

// Failure messages identify the output the tutor was trying to download.
assert.match(invoice, /setExportError\("PDF invoice belum berhasil diunduh\. Coba lagi\."\)/);
assert.match(recap, /setExportError\("CSV belum berhasil diunduh\. Coba lagi\."\)/);
assert.match(recap, /setExportError\("PDF belum berhasil diunduh\. Coba lagi\."\)/);

// Public copy distinguishes sharing on the phone from downloading on the web.
assert.match(
  features,
  /Di HP, bagikan rekap sebagai PDF atau CSV\. Di web, unduh file untuk disimpan atau dibagikan\./,
);

// Legal pages describe the paid capability as Plus and name the PDF invoice output.
assert.match(terms, /Paket Free dapat digunakan untuk menyusun dan memeriksa draft invoice\./);
assert.match(terms, /Plus aktif diperlukan untuk mengunduh PDF invoice\./);
assert.doesNotMatch(terms, /\bpremium\b/i);
assert.match(privacy, /PDF invoice/);
assert.doesNotMatch(privacy, /\bpremium\b/i);

console.log("TL3-19 web copy contract passed.");
