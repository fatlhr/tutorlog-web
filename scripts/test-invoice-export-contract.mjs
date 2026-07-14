import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const page = readFileSync(join(root, "app/app/invoice/page.tsx"), "utf8");
const a4Page = readFileSync(join(root, "components/invoice/A4Page.tsx"), "utf8");
const invoiceCss = readFileSync(join(root, "css/tutorlog-web-invoices.css"), "utf8");
const siteCss = readFileSync(join(root, "css/site.css"), "utf8");
const baseCss = readFileSync(join(root, "css/tutorlog-web.css"), "utf8");
const controls = readFileSync(join(root, "components/app-ui/controls.tsx"), "utf8");
const klasikTemplate = readFileSync(join(root, "components/invoice/TplKlasik.tsx"), "utf8");
const modernTemplate = readFileSync(join(root, "components/invoice/TplModern.tsx"), "utf8");
const minimalTemplate = readFileSync(join(root, "components/invoice/TplMinimal.tsx"), "utf8");
const templateSources = [klasikTemplate, modernTemplate, minimalTemplate];
const templates = templateSources.join("\n");
const readOptional = (path) => existsSync(path) ? readFileSync(path, "utf8") : "";
const invoiceNotes = readOptional(join(root, "components/invoice/InvoiceNotes.tsx"));
const invoiceData = readOptional(join(root, "components/invoice/invoice-data.ts"));

assert.match(page, /<form\b[^>]*ref=\{formRef\}/, "Invoice editor must use a real form");
assert.match(
  page,
  /formRef\.current\?\.reportValidity\(\)/,
  "Invoice actions must run native required-field validation",
);
assert.doesNotMatch(
  invoiceCss,
  /color-mix\(in oklab/i,
  "Invoice export styles must not use colors unsupported by html2canvas",
);
assert.match(
  invoiceCss,
  /var\(--acc-soft-12/,
  "Invoice styles must consume an export-safe soft accent",
);
assert.match(
  templates,
  /createInvoiceAccentStyle/,
  "Invoice templates must provide export-safe accent variables",
);
assert.match(
  page,
  /canvas\.toDataURL\("image\/jpeg", 0\.88\)/,
  "Invoice export must use a compressed JPEG image",
);
assert.match(
  page,
  /pdf\.addImage\(imgData, "JPEG", 0, 0, pageWidth, pageHeight, undefined, "FAST"\)/,
  "Invoice image must fit exactly one A4 page",
);
assert.doesNotMatch(
  page,
  /await supabase\.rpc\("record_feature_usage_event"/,
  "Usage tracking must not keep the Invoice export action loading",
);
assert.match(
  page,
  /void supabase\.rpc\("record_feature_usage_event"/,
  "Invoice export should record usage without blocking the download flow",
);
assert.match(
  page,
  /<A4Page pageRef=\{exportRef\}>/,
  "Invoice export must capture the shared A4Page wrapper",
);
assert.doesNotMatch(
  page,
  /<div style=\{\{ width: "794px", aspectRatio:/,
  "Invoice export must not maintain a second manual A4 wrapper",
);
assert.match(
  a4Page,
  /pageRef\?: Ref<HTMLDivElement>/,
  "A4Page must expose its shared page element to the exporter",
);
assert.match(
  a4Page,
  /<div ref=\{pageRef\} className="a4">/,
  "A4Page must attach the export ref to the same wrapper used by preview",
);
assert.match(
  baseCss,
  /\.a4 \{[^}]*width: 794px;/s,
  "Preview and export must share the native 794px A4 layout width",
);
assert.match(
  baseCss,
  /\.a4 \{[^}]*border-radius: 0;[^}]*box-shadow: none;/s,
  "Shared A4 document chrome must not introduce rounded PDF corners",
);
assert.doesNotMatch(
  siteCss,
  /\.a4-preview \.a4 \{[^}]*aspect-ratio: auto;/s,
  "Preview must not override the shared A4 page ratio",
);
assert.match(
  page,
  /Math\.floor\(\(\(w - 16\) \/ 794\) \* 100\)/,
  "Dialog preview fitting must use the shared native A4 width",
);
assert.match(
  page,
  /bankAccount\.split\(\/\\s\*\(\?:·\|-\)\\s\*\/,\s*2\)/,
  "Invoice payment parser must accept the separator shown by the Bank placeholder",
);
assert.doesNotMatch(
  page,
  /while \(heightLeft > 0\)/,
  "A single-page Invoice must not create a rounding-overflow page",
);
assert.match(
  invoiceCss,
  /\.tpl-klasik table\.k-table td \{[^}]*font-size: 11px;/s,
  "Invoice body text must stay legible after A4 scaling",
);
for (const selector of [
  ".tpl-klasik table.k-table td",
  ".tpl-modern table.m-table td",
  ".tpl-minimal table.mn-table td",
]) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(
    invoiceCss,
    new RegExp(`${escapedSelector} \\{[^}]*vertical-align: middle;`, "s"),
    `${selector} must vertically center its cell content`,
  );
}
for (const selector of [
  ".tpl-klasik table.k-table td",
  ".tpl-minimal table.mn-table td",
]) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(
    invoiceCss,
    new RegExp(`${escapedSelector} \\{[^}]*height: 34px;[^}]*padding-block: 0;[^}]*line-height: 34px;`, "s"),
    `${selector} must use a fixed row box for optical vertical centering`,
  );
}
assert.match(
  invoiceCss,
  /\.tpl-modern table\.m-table td \{[^}]*padding-block: 10px;[^}]*line-height: 1\.4;/s,
  "Modern session rows must have real vertical breathing room",
);
assert.match(
  invoiceCss,
  /\.tpl-modern table\.m-table \{[^}]*border-collapse: separate;[^}]*border-spacing: 0;/s,
  "Modern table must use a separate border model so the header and first row can have a real gap",
);
assert.match(
  modernTemplate,
  /<tr className="m-table-gap" aria-hidden="true">\s*<td colSpan=\{showDescription \? 5 : 4\}><\/td>\s*<\/tr>/s,
  "Modern table must render a real spacer row between the header rule and session rows",
);
assert.match(
  invoiceCss,
  /\.tpl-modern table\.m-table tbody tr\.m-table-gap td \{[^}]*height: 6px;[^}]*padding: 0;[^}]*background: transparent;/s,
  "Modern spacer row must reserve six visible pixels without a tinted background",
);
assert.match(
  invoiceCss,
  /\.tpl-modern table\.m-table tbody tr:nth-child\(even\) td \{[^}]*background: var\(--acc-soft-6, #F0F6F5\);/s,
  "Modern row tint must start after the spacer row",
);
assert.match(
  invoiceCss,
  /\.tpl-klasik \.k-bank \{[^}]*margin-top: 24px;[^}]*grid-template-columns: max-content minmax\(0, 1fr\);[^}]*align-items: baseline;[^}]*align-content: center;/s,
  "Klasik payment label and account details must share one centered baseline row with clear note spacing",
);
assert.match(
  invoiceCss,
  /\.tpl-klasik \.k-bank \{[^}]*height: 36px;[^}]*padding-block: 0;/s,
  "Klasik payment bar must provide a fixed vertical centering box",
);
assert.match(
  klasikTemplate,
  /<span className="cell-content">\{it\.date\}<\/span>/,
  "Klasik table values must expose a stable element for optical centering",
);
assert.match(
  invoiceCss,
  /\.tpl-klasik table\.k-table td \.cell-content \{[^}]*position: relative;[^}]*top: -8px;/s,
  "Klasik table text must compensate for rasterized font baseline offset",
);
assert.doesNotMatch(
  invoiceCss,
  /\.tpl-klasik \.k-bank \.(?:lbl|val) \{[^}]*top: -8px;/s,
  "Klasik payment text must not be positioned as separate pasted-on layers",
);
assert.match(
  modernTemplate,
  /<div className="lbl">Transfer ke<\/div>[\s\S]*<div className="val">\{data\.bank\.bank\} · \{data\.bank\.no\}<\/div>/,
  "Modern payment details must use the same clear hierarchy as Minimal",
);
assert.doesNotMatch(
  invoiceCss,
  /\.tpl-modern \.m-foot \.bank \{[^}]*background:/s,
  "Modern payment details must not look like a detached card",
);
assert.match(
  siteCss,
  /\.app-invoice-main \.inv-form \{[^}]*padding-inline: var\(--space-2\);/s,
  "Scrollable Invoice form must reserve horizontal room for focus rings",
);
assert.match(
  controls,
  /labelVisuallyHidden\?: boolean;/,
  "Field must support an accessible label without rendering duplicate visible copy",
);
assert.match(
  page,
  /<Field controlId="invoice-notes" label="Catatan tambahan" labelVisuallyHidden>/,
  "Invoice notes must keep one visible section heading",
);
assert.match(
  invoiceNotes,
  /notes\.trim\(\)/,
  "Invoice notes must treat whitespace-only input as empty",
);
assert.match(
  invoiceNotes,
  /className="body invoice-note-placeholder"/,
  "Empty Invoice notes must render the shared notebook placeholder",
);
assert.match(
  invoiceNotes,
  /<span aria-hidden="true"><\/span>[\s\S]*<span aria-hidden="true"><\/span>/,
  "Notebook placeholder must provide two ruled lines",
);
assert.match(
  invoiceCss,
  /\.invoice-note-placeholder \{[^}]*display: grid;[^}]*min-height:/s,
  "Notebook placeholder must reserve visible writing space",
);
assert.match(
  invoiceData,
  /export interface InvoiceData/,
  "Invoice data contract must not belong to one visual template",
);
assert.doesNotMatch(
  invoiceData,
  /^\s*due:\s*string;|^\s*due:\s*"/m,
  "InvoiceData and sample data must not retain an unused due field",
);
assert.doesNotMatch(
  page,
  /^\s*due:\s*formatInvoiceDate|const dueDate =/m,
  "The page mapper must not calculate unused due data",
);
assert.match(
  page,
  /function getStudentRecipientName\(student: StudentOption\): string \{[\s\S]*student\.parentName\?\.trim\(\)[\s\S]*`Orang tua\/wali \$\{student\.name\}`[\s\S]*\}/,
  "Billing recipient defaults must prefer stored parent data and fall back to the selected student",
);
assert.match(
  page,
  /setStudentInfo\(found\.educationLevel \?\? ""\);[\s\S]*setStudentAddress\(found\.address \?\? ""\);[\s\S]*setParentName\(getStudentRecipientName\(found\)\);/,
  "Changing students must reset every student-derived Invoice value",
);
assert.doesNotMatch(
  page,
  /typeof draft\.studentInfo === "string"/,
  "Derived education data must not be restored from the draft",
);
const persistedDraftMatch = page.match(
  /localStorage\.setItem\(DRAFT_KEY, JSON\.stringify\(\{([\s\S]*?)\}\)\);/,
);
assert.ok(persistedDraftMatch, "Invoice draft persistence block must remain present");
const persistedDraftBody = persistedDraftMatch[1];
assert.doesNotMatch(
  persistedDraftBody,
  /^\s*studentInfo,\s*$/m,
  "Derived education data must not be written to the draft",
);
assert.match(
  page,
  /from:\s*\{[\s\S]*lines:\s*\[\s*"Tutor Privat",\s*tutorLocation,\s*tutorContact,?\s*\]\.filter\(Boolean\)/,
  "Sender lines must contain the tutor role, location, and contact without duplicating the brand",
);
assert.match(
  page,
  /to:\s*\{[\s\S]*lines:\s*\[\s*`Murid: \$\{studentName\}`,\s*studentInfo,\s*studentAddress,?\s*\]\.filter\(Boolean\)/,
  "Recipient lines must identify the student without repeating the billing relationship",
);
assert.match(
  page,
  /placeholder="Contoh: Nama tutor"/,
  "Tutor name must use a generic placeholder without a fake person",
);
assert.match(
  page,
  /placeholder="Contoh: Orang tua\/wali murid"/,
  "Billing recipient must use a generic role placeholder",
);
assert.match(
  page,
  /placeholder="Jalan Sudirman"/,
  "Student address must use the requested simple address example",
);
assert.match(
  page,
  /<TextField id="invoice-student-level"[^>]*disabled/s,
  "Student education level must be read-only because it comes from student data",
);
assert.match(
  page,
  /placeholder="Contoh: Bulan ini pembelajaran berfokus pada persiapan ujian dan penguatan materi\."/,
  "Additional notes must describe the teaching sessions for the month",
);
assert.match(
  page,
  /note: note \|\| "-"/,
  "A session without a note must use a neutral dash",
);
assert.doesNotMatch(
  page,
  /Belum ada catatan sesi/,
  "Invoice session descriptions must not expose an explanatory empty-state sentence",
);
assert.match(
  invoiceData,
  /export function hasInvoiceDescriptions/,
  "Description visibility must be derived from the shared Invoice data contract",
);

for (const [index, template] of templateSources.entries()) {
  const name = ["Klasik", "Modern", "Minimal"][index];
  for (const requiredContent of [
    /data\.no/,
    /data\.date/,
    /data\.period/,
    /data\.from\.lines\.map/,
    /data\.to\.lines\.map/,
    /Tarif\/jam/,
    /hours\.toFixed\(1\)/,
    /formatIDR\(sub\)/,
    /<InvoiceNotes notes=\{data\.notes\} \/>/,
    /data\.bank\.bank/,
    /data\.bank\.no/,
    /data\.bank\.name/,
  ]) {
    assert.match(template, requiredContent, `${name} must preserve the shared Invoice content contract`);
  }
  assert.match(
    template,
    /hasInvoiceDescriptions\(data\.items\)/,
    `${name} must use the shared description visibility rule`,
  );
  assert.match(
    template,
    /\{showDescription \? <th[^>]*>Deskripsi(?: sesi)?<\/th> : null\}/,
    `${name} must hide the Description header when every session description is empty`,
  );
  assert.match(
    template,
    /\{showDescription \? <td[^>]*>[\s\S]*it\.desc[\s\S]*<\/td> : null\}/,
    `${name} must hide Description cells together with their header`,
  );
}

console.log("Invoice export contract: validation, safe colors, single-page compression, and legible type present");
