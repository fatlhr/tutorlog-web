# Invoice Field Mapping and Form Information Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct Invoice field mapping, student-derived state, form grouping, and action guards while preserving the current `InvoiceData` shape and all three template identities.

**Architecture:** Keep `buildInvoiceData()` as the single page-level mapper and retain `from.lines` plus `to.lines`. Add deterministic student-default handling in the Invoice page, replace the disabled education field with static metadata, and reuse the existing focused source contract to protect mapping and template parity. Keep styling in the existing Invoice section of `css/site.css`.

**Tech Stack:** Next.js 16, React, TypeScript, native form validation, TutorLog app-ui primitives, CSS custom properties, Node `assert` contract.

## Global Constraints

- Preserve the existing `/app/invoice` route, navigation, quota, paywall, PDF rasterization, A4 sizing, dialog behavior, analytics IDs, and draft key `tutorlog-invoice-draft:v1`.
- Preserve `InvoiceData` with `from.lines` and `to.lines`. Do not introduce a structured party-contract refactor.
- Do not add parent, guardian, address, or due-date fields to Supabase.
- Klasik, Modern, and Minimal must receive the same business content. Their visual identity remains unchanged.
- All hints, placeholders, helper copy, and entered values are left-aligned.
- Profil tutor and Penerima invoice are single-column sections at every viewport.
- Preview and export remain unavailable while sessions are loading, failed, or empty.
- Do not add a package or external UI kit.
- Do not stage or commit unrelated existing worktree changes.
- Do not push, merge, or create a PR.
- Under the development test policy, run only `rtk node scripts/test-invoice-export-contract.mjs` and `rtk git diff --check` unless the user explicitly requests broader testing.

---

## File Responsibility Map

- `app/app/invoice/page.tsx`: owns student selection lifecycle, draft restore, session state, `buildInvoiceData()`, form markup, native validation, and preview/export actions.
- `components/invoice/invoice-data.ts`: owns the shared `InvoiceData` interface, sample data, formatting helpers, totals, and description visibility.
- `css/site.css`: owns Invoice form grouping, metadata-row styling, left alignment, scroll insets, and narrow-width form fallbacks.
- `scripts/test-invoice-export-contract.mjs`: owns the focused development-phase contract for Invoice source, A4 export, mapping, form structure, and three-template parity.

## Task 1: Correct Student Defaults and Invoice Mapping

**Files:**
- Modify: `scripts/test-invoice-export-contract.mjs:1-312`
- Modify: `app/app/invoice/page.tsx:31-476`
- Modify: `components/invoice/invoice-data.ts:1-39`

**Interfaces:**
- Consumes: existing `StudentOption`, `InvoiceData`, `DRAFT_KEY`, and `invoiceSessions` state.
- Produces: `getStudentRecipientName(student: StudentOption): string` and deterministic `from.lines` plus `to.lines` mapping used by every template.

- [ ] **Step 1: Add failing mapping and student-lifecycle assertions**

Add these assertions after the existing `invoiceData` contract assertion in `scripts/test-invoice-export-contract.mjs`:

```js
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
  /typeof draft\.studentInfo === "string"|\n\s*studentInfo,\n\s*studentAddress/,
  "Derived education data must not be restored from or written to the draft",
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
```

- [ ] **Step 2: Run the focused contract and confirm the new assertions fail**

Run:

```bash
rtk node scripts/test-invoice-export-contract.mjs
```

Expected: FAIL first on the unused `due` field or missing `getStudentRecipientName` contract. Do not change implementation before observing this failure.

- [ ] **Step 3: Add the recipient default helper**

Add this immediately after `StudentOption` in `app/app/invoice/page.tsx`:

```ts
function getStudentRecipientName(student: StudentOption): string {
  const storedName = student.parentName?.trim();
  return storedName || `Orang tua/wali ${student.name}`;
}
```

- [ ] **Step 4: Make initial selection derive education while preserving a valid draft recipient**

Replace the current student-initialization effect with:

```ts
useEffect(() => {
  if (studentsLoading) return;

  if (students.length === 0) {
    setStudentName("");
    setStudentInfo("");
    setStudentAddress("");
    setParentName("");
    return;
  }

  const selectedStudent = students.find((student) => student.name === studentName);
  if (!selectedStudent) {
    const firstStudent = students[0];
    setStudentName(firstStudent.name);
    setStudentInfo(firstStudent.educationLevel ?? "");
    setStudentAddress(firstStudent.address ?? "");
    setParentName(getStudentRecipientName(firstStudent));
    return;
  }

  setStudentInfo(selectedStudent.educationLevel ?? "");
  setStudentAddress((current) => current || selectedStudent.address || "");
  setParentName((current) => current.trim() || getStudentRecipientName(selectedStudent));
}, [studentName, students, studentsLoading]);
```

This keeps non-empty editable draft values for the same valid student. It still derives Tingkat Pendidikan from the freshly loaded student record.

- [ ] **Step 5: Reset all student-dependent values when the user changes students**

Replace `handleStudentChange` with:

```ts
const handleStudentChange = (name: string) => {
  setStudentName(name);
  const found = students.find((student) => student.name === name);

  if (!found) {
    setStudentInfo("");
    setStudentAddress("");
    setParentName("");
    return;
  }

  setStudentInfo(found.educationLevel ?? "");
  setStudentAddress(found.address ?? "");
  setParentName(getStudentRecipientName(found));
};
```

- [ ] **Step 6: Remove derived education from draft restore and serialization**

In the draft-restore effect, delete:

```ts
if (typeof draft.studentInfo === "string") setStudentInfo(draft.studentInfo);
```

In the object passed to `localStorage.setItem(DRAFT_KEY, JSON.stringify({`, remove the `studentInfo,` property. Remove `studentInfo` from that effect's dependency list. Keep `studentAddress` and `parentName` because they remain editable and draft-backed.

- [ ] **Step 7: Remove dead due data and fix the page mapper**

In `components/invoice/invoice-data.ts`, remove `due` from the interface and `sampleInvoiceData`.

Replace the beginning and party portion of `buildInvoiceData()` with:

```ts
const buildInvoiceData = (): InvoiceData => {
  const now = new Date();
  const [bankCode = "", bankNo = ""] = bankAccount.split(/\s*(?:·|-)\s*/, 2);

  const items = invoiceSessions.map((session) => ({
    date: formatMonthDay(new Date(session.clockIn)),
    desc: session.note,
    h: session.hours,
    rate: session.rate,
  }));

  return {
    no: invoiceNo,
    date: formatInvoiceDate(now),
    period: periodLabel,
    lembaga: lembaga || undefined,
    from: {
      name: tutorName,
      lines: [
        "Tutor Privat",
        tutorLocation,
        tutorContact,
      ].filter(Boolean),
    },
    to: {
      name: parentName,
      lines: [
        `Murid: ${studentName}`,
        studentInfo,
        studentAddress,
      ].filter(Boolean),
    },
    bank: { bank: bankCode, no: bankNo, name: bankName },
    items,
    notes,
  };
};
```

- [ ] **Step 8: Run the focused contract and confirm Task 1 passes**

Run:

```bash
rtk node scripts/test-invoice-export-contract.mjs
```

Expected: PASS with the existing final `Invoice export contract` message and no assertion error.

- [ ] **Step 9: Review and commit only Task 1 files**

Run:

```bash
rtk git diff -- app/app/invoice/page.tsx components/invoice/invoice-data.ts scripts/test-invoice-export-contract.mjs
rtk git diff --check
rtk git add app/app/invoice/page.tsx components/invoice/invoice-data.ts scripts/test-invoice-export-contract.mjs
rtk git diff --cached --check
rtk git commit -m "fix: correct invoice field mapping"
```

Expected: the staged diff contains only the three listed files. Do not stage any other dirty worktree file.

## Task 2: Rebuild the Form Groups as One-Column Sections

**Files:**
- Modify: `scripts/test-invoice-export-contract.mjs:1-340`
- Modify: `app/app/invoice/page.tsx:535-718`
- Modify: `css/site.css:226-264, 323-350, 396-421`

**Interfaces:**
- Consumes: existing `Field`, `Select`, `DateField`, `TextField`, `SectionHeading`, and protected-app CSS tokens.
- Produces: `.inv-student-meta` and `.inv-payment-fields`; removes `.inv-section-row`, `.inv-section-col`, and `.inv-section-divide` from Invoice markup and CSS.

- [ ] **Step 1: Add failing form-structure and alignment assertions**

Add these assertions to `scripts/test-invoice-export-contract.mjs`:

```js
assert.match(
  page,
  /<dl className="inv-student-meta" aria-label="Data murid">[\s\S]*<dt>Tingkat pendidikan<\/dt>[\s\S]*<dd aria-live="polite">\{studentInfo \|\| "Belum tersedia"\}<\/dd>[\s\S]*<\/dl>/,
  "Education must render as static metadata below the selected student",
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
  /\.inv-student-meta \{[\s\S]*grid-template-columns: minmax\(0, 1fr\) auto;[\s\S]*background: var\(--app-paper-soft\);/,
  "Student metadata must use the protected soft-paper treatment",
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
```

- [ ] **Step 2: Run the focused contract and confirm the form assertions fail**

Run:

```bash
rtk node scripts/test-invoice-export-contract.mjs
```

Expected: FAIL because `.inv-student-meta`, Profil tutor, and Penerima invoice do not exist yet.

- [ ] **Step 3: Insert static education metadata below Nama murid**

Immediately after the closing `</Field>` for `invoice-student`, add:

```tsx
<dl className="inv-student-meta" aria-label="Data murid">
  <dt>Tingkat pendidikan</dt>
  <dd aria-live="polite">{studentInfo || "Belum tersedia"}</dd>
</dl>
```

- [ ] **Step 4: Replace the inline payment grid with a named responsive class**

Replace:

```tsx
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
```

with:

```tsx
<div className="inv-payment-fields">
```

- [ ] **Step 5: Replace the lower split row with sequential sections**

Replace the entire `inv-section-row` block with:

```tsx
<div className="inv-section">
  <SectionHeading level="h2" size="compact" title="Profil tutor" />

  <Field controlId="invoice-tutor-name" label="Nama" required>
    <TextField id="invoice-tutor-name" value={tutorName} onChange={setTutorName} placeholder="Contoh: Nama tutor" />
  </Field>

  <Field controlId="invoice-service-name" label="Nama layanan atau brand (opsional)">
    <TextField id="invoice-service-name" value={lembaga} onChange={setLembaga} placeholder="Contoh: Les Privat Rina" />
  </Field>

  <Field controlId="invoice-tutor-location" label="Lokasi">
    <TextField id="invoice-tutor-location" value={tutorLocation} onChange={setTutorLocation} placeholder="Contoh: Jakarta Selatan" />
  </Field>

  <Field controlId="invoice-tutor-contact" label="Kontak">
    <TextField id="invoice-tutor-contact" value={tutorContact} onChange={setTutorContact} placeholder="Contoh: 0812-3456-7890" />
  </Field>
</div>

<div className="inv-section">
  <SectionHeading level="h2" size="compact" title="Penerima invoice" />

  <Field controlId="invoice-parent-name" label="Ditagih Kepada" required>
    <TextField id="invoice-parent-name" value={parentName} onChange={setParentName} placeholder="Contoh: Orang tua/wali murid" />
  </Field>

  <Field controlId="invoice-student-address" label="Alamat">
    <TextField id="invoice-student-address" value={studentAddress} onChange={setStudentAddress} placeholder="Jalan Sudirman" />
  </Field>
</div>
```

- [ ] **Step 6: Add metadata, payment-grid, and alignment styles**

Add next to `.inv-period-fields` in `css/site.css`:

```css
.inv-payment-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.inv-student-meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-4);
  margin: 0;
  padding: var(--space-4);
  border-radius: var(--radius-control);
  color: var(--app-ink);
  background: var(--app-paper-soft);
  font-family: var(--app-font-body);
  font-size: 13px;
  line-height: 18px;
}

.inv-student-meta dt,
.inv-student-meta dd {
  margin: 0;
}

.inv-student-meta dt {
  color: var(--app-ink-muted);
}

.inv-student-meta dd {
  font-weight: 700;
  text-align: right;
}

.app-invoice-main .inv-form :is(input, select, textarea, .tw-helper, .inv-auto-sessions) {
  text-align: left;
}

@media (max-width: 389px) {
  .inv-period-fields,
  .inv-payment-fields {
    grid-template-columns: 1fr;
  }
}
```

The metadata value is right-aligned only to make the label-value relationship readable. The approved hint and field-content rule remains left-aligned.

- [ ] **Step 7: Remove obsolete split-row CSS**

Delete these exact selector blocks from `css/site.css` after their markup is gone:

```css
.inv-section-row {
  display: grid; grid-template-columns: 1fr; gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--app-line);
}

.inv-section-col {
  display: flex; flex-direction: column; gap: 12px;
}

.inv-section-divide {
  display: block;
}

.vp-mobile .inv-section-row { grid-template-columns: 1fr; }

.app-invoice-main .inv-section-row {
  grid-template-columns: 1fr;
}
```

Delete these exact media-query declarations:

```css
@media (max-width: 767px) {
  .inv-section-row { grid-template-columns: 1fr; }
  .inv-section-divide { display: block; }
}

@media (max-width: 1099px) {
  .inv-section-row { grid-template-columns: 1fr 1fr; }
  .inv-section-divide { display: none; }
}
```

If either media query also contains unrelated declarations, remove only the two listed Invoice declarations and keep the media-query wrapper plus its other rules. Confirm removal with:

```bash
rtk rg -n 'inv-section-row|inv-section-col|inv-section-divide' app/app/invoice/page.tsx css/site.css
```

Expected: no matches.

- [ ] **Step 8: Run the focused contract and confirm Task 2 passes**

Run:

```bash
rtk node scripts/test-invoice-export-contract.mjs
```

Expected: PASS with no assertion error.

- [ ] **Step 9: Review and commit only Task 2 files**

Run:

```bash
rtk git diff -- app/app/invoice/page.tsx css/site.css scripts/test-invoice-export-contract.mjs
rtk git diff --check
rtk git add app/app/invoice/page.tsx css/site.css scripts/test-invoice-export-contract.mjs
rtk git diff --cached --check
rtk git commit -m "fix: align invoice form sections"
```

Expected: the staged diff contains only the three listed files.

## Task 3: Guard Session-Dependent Actions and Date Range

**Files:**
- Modify: `scripts/test-invoice-export-contract.mjs:1-380`
- Modify: `app/app/invoice/page.tsx:129-328, 554-581, 720-740, 798-809`

**Interfaces:**
- Consumes: `sessionsLoading`, `sessionsError`, `invoiceSessions`, `periodStart`, `periodEnd`, and existing `Button` plus `DateField` props.
- Produces: `invoiceActionsDisabled: boolean` shared by Periksa invoice and both Unduh PDF buttons.

- [ ] **Step 1: Add failing state-guard assertions**

Add these assertions to `scripts/test-invoice-export-contract.mjs`:

```js
assert.match(
  page,
  /const invoiceActionsDisabled = sessionsLoading \|\| sessionsError \|\| invoiceSessions\.length === 0;/,
  "Invoice actions must share one loading, error, and empty-session guard",
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
  /Pilih periode yang memiliki minimal satu sesi selesai\./,
  "An empty period must explain why preview and export are unavailable",
);
assert.match(
  page,
  /const validateInvoiceForm = useCallback\(\(\) => \{[\s\S]*reportValidity\(\)[\s\S]*!invoiceActionsDisabled[\s\S]*\}, \[invoiceActionsDisabled\]\);/,
  "Programmatic preview and export must retain the same session guard",
);
```

- [ ] **Step 2: Run the focused contract and confirm the guard assertions fail**

Run:

```bash
rtk node scripts/test-invoice-export-contract.mjs
```

Expected: FAIL because `invoiceActionsDisabled` does not exist and Periksa invoice is still enabled for empty sessions.

- [ ] **Step 3: Add one shared action guard and extend validation**

Add next to `invoiceDownloadLocked`:

```ts
const invoiceActionsDisabled = sessionsLoading || sessionsError || invoiceSessions.length === 0;
```

Replace `validateInvoiceForm` with:

```ts
const validateInvoiceForm = useCallback(() => {
  const fieldsValid = formRef.current?.reportValidity() ?? false;
  return fieldsValid && !invoiceActionsDisabled;
}, [invoiceActionsDisabled]);
```

- [ ] **Step 4: Constrain the date range with native DateField props**

Update the two date controls:

```tsx
<DateField
  id="invoice-period-start"
  value={periodStart}
  max={periodEnd || undefined}
  onChange={setPeriodStart}
/>
<DateField
  id="invoice-period-end"
  value={periodEnd}
  min={periodStart || undefined}
  onChange={setPeriodEnd}
/>
```

- [ ] **Step 5: Use the approved empty-session copy**

Replace the current empty-period message with:

```tsx
<div className="inv-auto-sessions inv-auto-sessions-error" aria-live="polite">
  Pilih periode yang memiliki minimal satu sesi selesai.
</div>
```

Keep the existing loading and fetch-error messages unchanged.

- [ ] **Step 6: Disable all three session-dependent actions**

Add this prop to Periksa invoice, the form Unduh PDF button, and the desktop-header Unduh PDF button:

```tsx
disabled={invoiceActionsDisabled}
```

Replace the two existing `disabled={invoiceSessions.length === 0}` props with the shared guard.

- [ ] **Step 7: Run the focused contract and confirm Task 3 passes**

Run:

```bash
rtk node scripts/test-invoice-export-contract.mjs
```

Expected: PASS with no assertion error.

- [ ] **Step 8: Review and commit only Task 3 files**

Run:

```bash
rtk git diff -- app/app/invoice/page.tsx scripts/test-invoice-export-contract.mjs
rtk git diff --check
rtk git add app/app/invoice/page.tsx scripts/test-invoice-export-contract.mjs
rtk git diff --cached --check
rtk git commit -m "fix: guard incomplete invoice sessions"
```

Expected: the staged diff contains only the two listed files.

## Task 4: Final Focused Audit

**Files:**
- Verify: `app/app/invoice/page.tsx`
- Verify: `components/invoice/invoice-data.ts`
- Verify: `css/site.css`
- Verify: `scripts/test-invoice-export-contract.mjs`
- Verify: `components/invoice/TplKlasik.tsx`
- Verify: `components/invoice/TplModern.tsx`
- Verify: `components/invoice/TplMinimal.tsx`

**Interfaces:**
- Consumes: completed Tasks 1-3.
- Produces: verified implementation evidence and a clear handoff for the later user-requested visual review.

- [ ] **Step 1: Run the focused Invoice contract from a clean command invocation**

Run:

```bash
rtk node scripts/test-invoice-export-contract.mjs
```

Expected: exit code `0` and the final `Invoice export contract` message.

- [ ] **Step 2: Confirm removed names and dead data do not remain**

Run:

```bash
rtk rg -n 'invoice-student-level|Detail tambahan|Detail murid|inv-section-row|inv-section-col|inv-section-divide|due:' app/app/invoice/page.tsx components/invoice/invoice-data.ts css/site.css
```

Expected: no matches.

- [ ] **Step 3: Confirm the approved mapping appears exactly once**

Run:

```bash
rtk rg -n 'Profil tutor|Penerima invoice|Tingkat pendidikan|Murid:|Tutor Privat|Orang tua/wali|invoiceActionsDisabled' app/app/invoice/page.tsx
```

Expected: the section titles and mapping terms are present in the intended page blocks. `invoiceActionsDisabled` is declared once and consumed by three buttons.

- [ ] **Step 4: Inspect the final diff and whitespace**

Run:

```bash
rtk git diff -- app/app/invoice/page.tsx components/invoice/invoice-data.ts css/site.css scripts/test-invoice-export-contract.mjs
rtk git diff --check
rtk git status --short --branch
```

Expected: no whitespace error. Existing unrelated dirty files may remain, but none may be staged by this work.

- [ ] **Step 5: Report deferred verification accurately**

The implementation handoff must explicitly report:

```text
Focused Invoice contract: run and passed.
git diff --check: run and clean.
Full test suite, responsive sweep, accessibility test, and visual regression test: not run under the development test policy.
Fresh runtime screenshots: deferred until explicitly approved.
```

Do not update Milestone 9 or 10 as fully audited from this focused implementation alone. That ledger update remains gated on the previously requested cross-route visual and interaction audit.
