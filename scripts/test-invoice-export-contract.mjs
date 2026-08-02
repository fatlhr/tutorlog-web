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
const publicProductRail = readFileSync(join(root, "components/PublicProductRail.tsx"), "utf8");
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
  /\.tpl-klasik \.k-total-block \.row \{[^}]*font-size: 13px;[^}]*\}[\s\S]*\.tpl-klasik \.k-total-block \.row \.val \{[^}]*font-size: 15px;/,
  "Klasik total hours must be larger than 11px table items",
);
assert.match(
  invoiceCss,
  /\.tpl-modern \.m-total-hours \{[^}]*font-size: 13px;[^}]*\}[\s\S]*\.tpl-modern \.m-total-hours strong \{[^}]*font-size: 15px;/,
  "Modern total hours must be larger than 11px table items",
);
assert.match(
  modernTemplate,
  /<div className="m-total-summary">[\s\S]*<div className="m-total-hours">[\s\S]*<div className="m-total-amount">/,
  "Modern totals must use the approved hours-left and amount-right structure",
);
assert.doesNotMatch(
  modernTemplate,
  /m-total-badge/,
  "Modern totals must not render the old pill badge",
);
assert.match(
  invoiceCss,
  /\.tpl-modern \.m-total-summary \{[^}]*padding-top: 14px;[^}]*border-top: 1px solid var\(--tw-divider\);[^}]*display: grid;[^}]*grid-template-columns: 1fr auto;[^}]*\}/,
  "Modern totals must use a simple divider with hours on the left and amount on the right",
);
assert.match(
  invoiceCss,
  /\.tpl-modern \.m-total-amount \{[^}]*justify-items: end;[^}]*text-align: right;[^}]*\}[\s\S]*\.tpl-modern \.m-total-amount \.val \{[^}]*color: var\(--acc, #006C53\);/,
  "Modern total amount must be right-aligned and use the selected accent color",
);
assert.doesNotMatch(
  invoiceCss,
  /\.tpl-modern \.m-total-(?:badge|amount) \{[^}]*(?:background: var\(--acc|border-radius: 999px)/,
  "Modern total amount must not use a filled oval treatment",
);
assert.match(
  invoiceCss,
  /\.tpl-minimal \.mn-total-row \.hours \{[^}]*font-size: 13px;[^}]*\}[\s\S]*\.tpl-minimal \.mn-total-row \.hours strong \{[^}]*font-size: 15px;/,
  "Minimal total hours must be larger than 11px table items",
);
assert.match(
  invoiceCss,
  /\.tpl-modern \.m-foot \{[^}]*margin-top: 24px;[^}]*padding-top: 20px;[^}]*border-top: 1px solid var\(--tw-divider\);[^}]*display: grid;/,
  "Modern notes and transfer details must follow the totals behind a proportional divider",
);
assert.doesNotMatch(
  invoiceCss,
  /\.tpl-modern \.m-foot \{[^}]*margin-top: auto;/,
  "Modern notes and transfer details must not use bottom-pushing auto margin",
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
assert.match(
  page,
  /function buildInvoicePdfFilename\(\{[\s\S]*studentName[\s\S]*periodStart[\s\S]*periodEnd[\s\S]*\}\): string \{[\s\S]*Invoice-\$\{studentPart\}-\$\{startPart\}sd\$\{endPart\}\.pdf/,
  "Downloaded Invoice filename must include student name and date range",
);
assert.match(
  page,
  /pdf\.save\(buildInvoicePdfFilename\(\{[\s\S]*studentName: invoiceSessions\[0\]\?\.studentName\.trim\(\) \|\| studentName,[\s\S]*periodStart,[\s\S]*periodEnd,/,
  "Invoice PDF export must build the filename from the selected student and period",
);
assert.doesNotMatch(
  page,
  /record_feature_usage_event/,
  "Invoice export must not record usage after atomic authorization",
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
assert.match(
  page,
  /placeholder=\{getInvoiceBankOwnerPlaceholder\(tutorName\)\}/,
  "Bank owner placeholder must follow the resolved tutor name",
);
assert.doesNotMatch(
  page,
  /Rina Novianti/,
  "Invoice must not hard-code a tutor name in the bank owner placeholder",
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
  /\.tpl-klasik \.k-bank \{[^}]*margin-top: 24px;[^}]*grid-template-columns: max-content minmax\(0, 1fr\);[^}]*align-items: center;[^}]*align-content: center;/s,
  "Klasik payment label and account details must share one centered row with clear note spacing",
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
  /\.tpl-klasik table\.k-table td \{[^}]*padding-block: 8px 10px;[^}]*line-height: 1\.45;/s,
  "Klasik table cells must keep readable vertical padding without loose wrapped text",
);
assert.match(
  invoiceCss,
  /\.tpl-klasik table\.k-table td \.cell-content \{[^}]*position: relative;[^}]*top: 0;[^}]*line-height: 1\.45;/s,
  "Klasik table text must keep wrapped descriptions close while respecting cell padding",
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
assert.doesNotMatch(
  publicProductRail,
  /^\s*due:\s*/m,
  "The public InvoiceData fixture must not retain an unused due field",
);
assert.match(
  invoiceData,
  /export interface InvoiceItem \{[\s\S]*amount: number;[\s\S]*billingType: "hourly" \| "flat";[\s\S]*\}/,
  "Every InvoiceItem must retain authoritative amount and billing semantics",
);
assert.match(
  invoiceData,
  /items: InvoiceItem\[\];/,
  "InvoiceData must consume the shared InvoiceItem contract",
);
assert.match(
  invoiceData,
  /amount:\s*totals\.amount \+ item\.amount/,
  "Invoice totals must add each authoritative item amount",
);
assert.doesNotMatch(
  invoiceData,
  /amount:\s*totals\.amount \+ item\.h \* item\.rate/,
  "Invoice totals must never derive amount from hours and rate",
);
assert.match(
  page,
  /function getStudentRecipientName\(student: StudentOption\): string \{[\s\S]*student\.parentName\?\.trim\(\)[\s\S]*`Orang tua\/wali \$\{formatStudentDisplayName\(student\.name\)\}`[\s\S]*\}/,
  "Billing recipient defaults must prefer stored parent data and fall back to the selected student",
);
assert.match(
  page,
  /setStudentInfo\(found\.educationLevel \?\? ""\);[\s\S]*setStudentAddress\(found\.address \?\? ""\);[\s\S]*setParentName\(getStudentRecipientName\(found\)\);/,
  "Changing students must reset every student-derived Invoice value",
);
assert.match(
  page,
  /const restoredDraftStudentIdRef = useRef<string \| null>\(null\);[\s\S]*const restoredDraftStudentNameRef = useRef<string \| null>\(null\);[\s\S]*const restoredDraftHasStudentAddressRef = useRef\(false\);[\s\S]*const restoredDraftHasParentContactRef = useRef\(false\);/,
  "Draft restoration must track student identity, address, and guardian contact separately",
);
assert.match(
  page,
  /const isRestoredStudent =\s*restoredDraftStudentIdRef\.current === selectedStudent\.id \|\|[\s\S]*restoredDraftStudentNameRef\.current === selectedStudent\.name;[\s\S]*const shouldPreserveDraftStudentAddress =\s*isRestoredStudent && restoredDraftHasStudentAddressRef\.current;[\s\S]*setStudentAddress\(\(current\) =>\s*shouldPreserveDraftStudentAddress \? current : selectedStudent\.address \|\| ""\s*\);[\s\S]*setParentName\(\(current\) =>\s*isRestoredStudent && current\.trim\(\)\s*\? current\s*:\s*getStudentRecipientName\(selectedStudent\)\s*\);/,
  "Initial student hydration must only preserve address and recipient data for the restored student",
);
assert.match(
  page,
  /const handleStudentChange = \(studentId: string\) => \{\s*restoredDraftStudentIdRef\.current = null;\s*restoredDraftStudentNameRef\.current = null;\s*restoredDraftHasStudentAddressRef\.current = false;\s*restoredDraftHasParentContactRef\.current = false;\s*setSelectedStudentId\(studentId\);/,
  "Changing students must clear restored recipient preservation markers",
);
assert.match(
  page,
  /const shouldPreserveDraftParentContact =\s*isRestoredStudent && restoredDraftHasParentContactRef\.current;[\s\S]*setParentContact\(\(current\) =>\s*shouldPreserveDraftParentContact \? current : ""\s*\);/,
  "Guardian contact must only survive hydration for the restored student",
);
assert.match(
  page,
  /if \(typeof draft\.studentId === "string"\) \{\s*restoredDraftStudentIdRef\.current = draft\.studentId;\s*setSelectedStudentId\(draft\.studentId\);\s*\}[\s\S]*if \(typeof draft\.studentName === "string"\) \{\s*restoredDraftStudentNameRef\.current = draft\.studentName;\s*\}[\s\S]*if \(typeof draft\.studentAddress === "string"\) \{\s*restoredDraftHasStudentAddressRef\.current = true;\s*setStudentAddress\(draft\.studentAddress\);\s*\}[\s\S]*if \(typeof draft\.parentContact === "string"\) \{\s*restoredDraftHasParentContactRef\.current = true;\s*setParentContact\(draft\.parentContact\);\s*\}/,
  "Draft restoration must retain explicit address and guardian contact presence",
);
assert.doesNotMatch(
  page,
  /typeof draft\.studentInfo === "string"/,
  "Derived education data must not be restored from the draft",
);
const persistedDraftMatch = page.match(
  /saveInvoiceDraft\(sessionStorage, \{([\s\S]*?)\}\);/,
);
assert.ok(persistedDraftMatch, "Invoice draft persistence block must remain present");
const persistedDraftBody = persistedDraftMatch[1];
assert.doesNotMatch(
  persistedDraftBody,
  /^\s*studentInfo,\s*$/m,
  "Derived education data must not be written to the draft",
);
assert.match(
  persistedDraftBody,
  /^\s*parentContact,\s*$/m,
  "Guardian contact must be persisted in the Invoice draft",
);
assert.match(
  page,
  /from:\s*\{[\s\S]*lines:\s*\[\s*"Tutor Privat",\s*tutorLocation,\s*tutorContact,?\s*\]\.filter\(Boolean\)/,
  "Sender lines must contain the tutor role, location, and contact without duplicating the brand",
);
assert.match(
  page,
  /const recipientLines = buildInvoiceRecipientLines\(\{\s*studentName: invoiceStudentName,\s*educationLevel: studentInfo,\s*address: studentAddress,\s*parentContact,?\s*\}\);[\s\S]*to:\s*\{[\s\S]*name: parentName,\s*lines: recipientLines/,
  "Recipient lines must use the approved student, address, and guardian-contact order",
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
  /<Field controlId="invoice-parent-contact" label="Kontak wali">[\s\S]*<TextField id="invoice-parent-contact" value=\{parentContact\} onChange=\{setParentContact\}/,
  "Invoice recipient form must provide an optional guardian contact field",
);
assert.doesNotMatch(
  page,
  /<p className="inv-student-meta" aria-live="polite">\s*\{`Tingkat pendidikan: \$\{studentInfo \|\| "Belum tersedia"\}`\}\s*<\/p>/,
  "Education must be shown in the student dropdown instead of a separate form row",
);
assert.doesNotMatch(
  page,
  /controlId="invoice-student-level"|id="invoice-student-level"/,
  "Education must not remain a disabled form field",
);
assert.match(
  page,
  /title="Profil tutor"/,
  "Tutor identity fields must use the Profil tutor section title",
);
assert.match(
  page,
  /title="Penerima invoice"/,
  "Billing recipient fields must use the Penerima invoice section title",
);
assert.doesNotMatch(
  page,
  /inv-section-row|inv-section-col|inv-section-divide/,
  "The narrow Invoice form must not retain a nested two-column section row",
);
assert.match(
  page,
  /className="inv-payment-fields"/,
  "Payment fields need a named responsive grid instead of inline layout styles",
);
assert.match(
  siteCss,
  /\.inv-student-meta \{[\s\S]*display: block;[\s\S]*background: var\(--app-paper-soft\);/,
  "Student metadata must use an inline protected soft-paper treatment",
);
assert.match(
  siteCss,
  /\.app-invoice-main \.inv-form :is\(input, select, textarea, \.tw-helper, \.inv-auto-sessions\) \{\s*text-align: left;/,
  "Invoice field content and hints must remain left-aligned",
);
assert.match(
  siteCss,
  /@media \(max-width: 389px\) \{[\s\S]*\.inv-period-fields,[\s\S]*\.inv-payment-fields[\s\S]*grid-template-columns: 1fr;/,
  "Date and payment pairs must stack below 390px",
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
assert.match(
  page,
  /interface InvoiceSessionItem \{[\s\S]*amount: number;[\s\S]*billingType: "hourly" \| "flat";[\s\S]*\}/,
  "Fetched Invoice sessions must retain amount and billing semantics",
);
assert.match(
  page,
  /amount:\s*session\.amount,\s*billingType:\s*session\.billingType,/,
  "The Invoice mapper must forward authoritative amount and billing semantics",
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
    /data\.date/,
    /data\.period/,
    /data\.from\.lines\.map/,
    /data\.to\.lines\.map/,
    />Tarif<\/th>/,
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
    /formatIDR\(it\.amount\)/,
    `${name} must render the authoritative session amount`,
  );
  assert.doesNotMatch(
    template,
    /it\.h\s*\*\s*it\.rate|Tarif\/jam/,
    `${name} must not derive subtotals or label mixed billing as hourly-only`,
  );
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

assert.match(
  page,
  /const currentSessionsQueryKey = JSON\.stringify\(\[selectedStudentId, periodStart, periodEnd\]\);/,
  "Invoice sessions must use one stable student and date query key",
);
assert.match(
  page,
  /const \[loadedSessionsQueryKey, setLoadedSessionsQueryKey\] = useState<string \| null>\(null\);/,
  "Loaded Invoice sessions must record their query key",
);
assert.match(
  page,
  /const sessionsRequestSequence = useRef\(0\);/,
  "Invoice session requests must have sequence ownership",
);
assert.match(
  page,
  /const requestQueryKey = currentSessionsQueryKey;[\s\S]*const requestSequence = \+\+sessionsRequestSequence\.current;[\s\S]*let cancelled = false;[\s\S]*const ownsLatestRequest = \(\) =>[\s\S]*!cancelled && sessionsRequestSequence\.current === requestSequence;/,
  "Session fetches must capture their query key and latest-request ownership",
);
assert.match(
  page,
  /if \(!ownsLatestRequest\(\)\) return;[\s\S]*setInvoiceSessions\(items\);[\s\S]*setLoadedSessionsQueryKey\(requestQueryKey\);/,
  "Only the latest session request may write successful data",
);
assert.match(
  page,
  /catch \{[\s\S]*if \(!ownsLatestRequest\(\)\) return;[\s\S]*setInvoiceSessions\(\[\]\);[\s\S]*setSessionsError\(true\);[\s\S]*setLoadedSessionsQueryKey\(null\);[\s\S]*\} finally \{[\s\S]*if \(ownsLatestRequest\(\)\) \{[\s\S]*setSessionsLoading\(false\);[\s\S]*\}/,
  "Stale session requests must not write error or loading-finalization state",
);
assert.match(
  page,
  /return \(\) => \{\s*cancelled = true;\s*\};/,
  "Session fetch cleanup must cancel state ownership",
);
assert.match(
  page,
  /const invoiceActionsDisabled =\s*sessionsLoading \|\|[\s\S]*sessionsError \|\|[\s\S]*invoiceSessions\.length === 0 \|\|[\s\S]*loadedSessionsQueryKey !== currentSessionsQueryKey;/,
  "Invoice actions must reject loading, error, empty, and stale-query sessions",
);
assert.equal(
  [...page.matchAll(/disabled=\{invoiceActionsDisabled\}/g)].length,
  3,
  "Preview and both PDF actions must use the shared session guard",
);
assert.match(
  page,
  /<DateField[\s\S]*id="invoice-period-start"[\s\S]*max=\{periodEnd \|\| undefined\}/,
  "The period start must not move after the selected end",
);
assert.match(
  page,
  /<DateField[\s\S]*id="invoice-period-end"[\s\S]*min=\{periodStart \|\| undefined\}/,
  "The period end must not precede the selected start",
);
assert.match(
  page,
  /Tidak ada sesi selesai untuk murid dan periode ini\./,
  "An empty period must explain why preview and export are unavailable",
);
assert.match(
  page,
  /const validateInvoiceForm = useCallback\(\(\) => \{[\s\S]*reportValidity\(\)[\s\S]*!invoiceActionsDisabled[\s\S]*\}, \[invoiceActionsDisabled\]\);/,
  "Programmatic preview and export must retain the same session guard",
);
assert.match(
  page,
  /const \[exportError, setExportError\] = useState<string \| null>\(null\);/,
  "Invoice generation failures need a visible normalized feedback state",
);
assert.match(
  page,
  /catch \{\s*setExportError\("PDF invoice belum berhasil diunduh\. Coba lagi\."\);\s*\} finally \{\s*setExporting\(false\);/,
  "Invoice authorization and generation failures must normalize feedback and clear loading",
);
assert.match(
  page,
  /\{exportError \? <p className="app-export-error" role="alert">\{exportError\}<\/p> : null\}/,
  "Invoice export feedback must be announced as an alert",
);

console.log("Invoice export contract: validation, safe colors, single-page compression, and legible type present");
