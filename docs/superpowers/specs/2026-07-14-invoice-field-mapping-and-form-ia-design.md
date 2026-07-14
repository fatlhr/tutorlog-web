# Invoice Field Mapping and Form Information Architecture Design

**Date:** 2026-07-14
**Status:** Approved design, awaiting written-spec review
**Route:** `/app/invoice`
**Selected approach:** Minimum mapping patch

## Goal

Make every Invoice form field sit in the correct section and map predictably to the same business content in Klasik, Modern, and Minimal templates. Preserve the current `InvoiceData` shape and the established Invoice flow. Fix semantic grouping, duplicated output, stale student-derived values, and dead contract data without starting a broad Invoice refactor.

## Design Read

Reading this as: a protected invoice editor for individual private tutors, using TutorLog's playful editorial planner language while keeping the form calm, compact, and easy to scan.

- `DESIGN_VARIANCE: 4` because the form should preserve the existing visual system and avoid expressive layout changes inside a task surface.
- `MOTION_INTENSITY: 2` because Invoice composition needs stable reading and input states. Motion is limited to focus, hover, and pressed feedback.
- `VISUAL_DENSITY: 6` because the form contains many related controls inside a `360-430px` column.
- Design foundation: existing TutorLog protected-app tokens and internal React components. No external design system is added.

Design-taste v2 is used only for the redesign audit, hierarchy, spacing, contrast, shape consistency, and copy checks. It is not used to import landing-page patterns into this product form.

## Scope

### In scope

- Correct the field-to-document mapping inside `buildInvoiceData()`.
- Move Tingkat Pendidikan into the Murid dan periode section.
- Render Tingkat Pendidikan as selected-student metadata instead of a disabled text field.
- Rename Detail tambahan to Profil tutor.
- Rename Detail murid to Penerima invoice after moving Tingkat Pendidikan out.
- Replace the lower two-column section row with sequential single-column sections.
- Auto-fill Ditagih Kepada from the selected student and reset it when the student changes.
- Prevent student-derived values from leaking between students.
- Remove duplicated brand output.
- Remove the unused `due` property from the shared Invoice contract and sample data.
- Keep Klasik, Modern, and Minimal content-equivalent.
- Block preview and export when session data is loading, failed, or empty.
- Keep hints, placeholders, and helper copy left-aligned.

### Out of scope

- Changing routes, navigation, plan or paywall rules, PDF rasterization, A4 sizing, or template visual identity.
- Adding parent, guardian, or address fields to Supabase.
- Adding a due-date form field.
- Replacing `from.lines` and `to.lines` with a new structured party model.
- Changing Invoice history, quota, analytics, or draft storage keys.
- Refactoring unrelated protected-app CSS.
- Running a full test suite, responsive sweep, accessibility test, or visual regression test during development unless explicitly requested.

## Current-State Findings

The form currently mixes student metadata and billing-recipient data in Detail murid. Tingkat Pendidikan is shown as a disabled input even though it is derived from the selected student. The neighboring Detail tambahan section contains tutor identity fields, so its title is too vague.

`buildInvoiceData()` currently introduces two output problems:

1. `lembaga` appears as a top brand line and is also inserted into `from.lines`, which can display the same brand twice.
2. `to.lines` creates `Orang tua ${studentName}` while `to.name` already contains the billing recipient. This mixes the recipient relationship with the student identity and can repeat similar information.

The shared contract contains `due`, but the form has no due-date field and none of the three templates renders it. It is dead data.

The following controls correctly do not become textual Invoice content:

- Template controls document layout.
- Warna Aksen controls document color.
- Simpan pengaturan controls local persistence.

All other content fields already have a document destination, although some destinations need the corrections in this spec.

## Chosen Architecture

Preserve `InvoiceData` with its existing `from.lines` and `to.lines` arrays. Keep `buildInvoiceData()` as the page-level mapper. Make its array construction deterministic and remove fields that have no current product use.

This approach was selected over a structured party-contract refactor because the current problem can be solved safely with a smaller change. A template-specific mapper is rejected because it would allow Klasik, Modern, and Minimal to drift again.

## Canonical Field Mapping

| Form source | State or source | `InvoiceData` destination | Render rule |
| --- | --- | --- | --- |
| Nama murid | `studentName` | `to.lines[0]` | Render as `Murid: ${studentName}`. |
| Tingkat Pendidikan | selected student's `educationLevel` | next available `to.lines` entry | Render the current value once. Omit it when empty. |
| Periode and Sampai | `periodStart`, `periodEnd` | `period`; session query range | Render the formatted period and load sessions within it. |
| Nama tutor | `tutorName` | `from.name` | Required sender name. |
| Nama layanan atau brand | `lembaga` | `lembaga` | Render once in each template's brand position. Never copy it into `from.lines`. |
| Tutor role | fixed product fallback | `from.lines[0]` | Render `Tutor Privat`. |
| Lokasi | `tutorLocation` | next available `from.lines` entry | Omit when empty. |
| Kontak | `tutorContact` | next available `from.lines` entry | Omit when empty. |
| Ditagih Kepada | `parentName` | `to.name` | Required billing-recipient name. |
| Alamat | `studentAddress` | final available `to.lines` entry | Omit when empty. |
| Bank | parsed `bankAccount` | `bank.bank`, `bank.no` | Preserve the accepted hyphen or middle-dot separator parsing. |
| Nama Pemilik Rekening | `bankName` | `bank.name` | Required account owner. |
| Session date, note, hours, rate | `invoiceSessions` | `items` | Missing notes remain `-`. |
| Catatan tambahan | `notes` | `notes` | Render text or the shared ruled placeholder. |
| Template | `template` | presentation only | Select Klasik, Modern, or Minimal. |
| Warna Aksen | `accent` | presentation only | Select export-safe accent variables. |
| Simpan pengaturan | `saveSettings` | persistence only | Never render in the Invoice. |

`due` is removed from `InvoiceData`, `sampleInvoiceData`, and all page-level mapping because it has no form source and no template consumer.

## Student Selection and Draft Rules

### Initial load

- Select the first available student when no valid draft student is present.
- Derive Tingkat Pendidikan from the selected student's current `educationLevel`.
- Use the stored parent or guardian name when the current student data exposes one. Otherwise set Ditagih Kepada to `Orang tua/wali ${studentName}`.
- Use the selected student's stored address when available. Otherwise leave Alamat empty.

### User changes the selected student

Reset every student-dependent value in one transition:

- `studentName` becomes the new student.
- `studentInfo` becomes `found.educationLevel ?? ""`.
- `studentAddress` becomes `found.address ?? ""`.
- `parentName` uses `found.parentName?.trim()` when available. Otherwise it becomes `Orang tua/wali ${found.name}`.

Empty values must overwrite the previous student's values. Conditional setters that leave stale values in place are not allowed.

### Draft restore

- Preserve a manually edited Ditagih Kepada and Alamat when the restored draft still refers to the same valid student.
- Reloading a draft is not treated as the user changing students.
- Do not serialize or restore Tingkat Pendidikan in the draft. It always comes from the currently loaded student record.
- Keep the existing `tutorlog-invoice-draft:v1` key.

## Form Information Architecture

The macro order remains close to the current form to respect the selected minimum-patch approach:

1. Murid dan periode
2. Pembayaran
3. Tampilan invoice
4. Profil tutor
5. Penerima invoice
6. Catatan tambahan
7. Pengaturan

### Murid dan periode

- Keep Nama murid as the existing `Select`.
- Place a compact metadata row directly below it with label `Tingkat pendidikan` and the selected value.
- Use semantic static content, such as a compact `<dl>`, instead of a disabled `TextField`.
- Display `Belum tersedia` when the selected student has no education value.
- Keep Periode and Sampai side by side when the form column has enough width.
- Keep the automatic-session explanation once below the range.

### Pembayaran

- Keep Bank and Nama Pemilik Rekening paired when there is enough horizontal room.
- Stack the two fields when the available form width would clip their content or focus rings.

### Tampilan invoice

- Preserve the current three template choices and accent palette.
- Keep selected and focus rings inside the scrollable form inset.
- This section changes presentation only and has no textual mapping row.

### Profil tutor

- Replace the title Detail tambahan with Profil tutor.
- Keep Nama, Nama layanan atau brand, Lokasi, and Kontak in one vertical column.
- Do not split this section horizontally with another semantic group.

### Penerima invoice

- Replace the remaining Detail murid group with Penerima invoice.
- Keep Ditagih Kepada and Alamat in one vertical column.
- Tingkat Pendidikan does not appear here because it belongs to selected-student context.

### Catatan tambahan and Pengaturan

- Preserve the single visible Catatan tambahan heading and visually hidden control label.
- Keep Simpan pengaturan and its existing local-storage explanation.

## Visual Rules

- All labels, hints, placeholders, helper copy, and entered values are left-aligned.
- Each section uses the existing paper surface, one divider, and the protected-app spacing scale.
- Do not introduce nested cards for field groups.
- Preserve existing field and button radii from the protected visual system.
- Keep all form controls at least `44px` high on touch layouts.
- Route decoration stays outside the form, preview dialog, and A4 page.
- Motion is limited to current focus, hover, pressed, and dialog transitions. No entrance animation is added to fields or metadata.

## Responsive Behavior

- Desktop `>=1200px`: keep the `360-430px` form column beside the A4 preview.
- Tablet `768-1199px`: keep the single form column and centered preview dialog.
- Mobile `<768px`: keep the approved one-column editor and full-screen preview.
- Date and payment pairs may remain two columns while their container can preserve content and focus-ring insets.
- Below `390px`, date and payment pairs stack into one column.
- Profil tutor and Penerima invoice remain single-column at every viewport.

## Loading, Empty, and Error Behavior

- While sessions are loading, disable Periksa invoice and Unduh PDF.
- When sessions fail to load, block preview and export. Retain the existing reload guidance.
- When the selected range contains no completed sessions, block preview and export and show `Pilih periode yang memiliki minimal satu sesi selesai.`
- Set the period-end minimum to the selected period start, or apply an equivalent native constraint, so the end cannot precede the start.
- Continue using native required validation for student, period fields, tutor name, billing recipient, bank account, and account owner.
- Do not silently export an Invoice from failed, loading, or empty session data.

## Three-Template Content Parity

Klasik, Modern, and Minimal may differ in composition, type scale, color placement, spacing, and decoration. They must render the same supplied business information:

- Invoice number, issue date, and period.
- Optional brand exactly once.
- Tutor name, role, location, and contact when supplied.
- Billing recipient, student name, education level, and address when supplied.
- Every included session, total hours, rate, subtotal, and total amount.
- Notes or the shared empty-note ruled placeholder.
- Bank, account number, and account owner.

The Deskripsi column is hidden only when every item description is empty or `-`. When at least one description exists, all rows keep the column and missing row descriptions display `-`.

## Accessibility and Interaction

- Keep every editable field programmatically associated with its visible label.
- The static education metadata must be readable without implying editability or disabled form state.
- Disabled preview or export controls must expose their disabled state semantically.
- Status and error copy that changes after selecting a student or period remains available through the current live region.
- Preserve visible focus, Escape close, scroll lock, focus return, and current dialog behavior.
- Do not change analytics IDs, accessible names, or route navigation.

## Verification Strategy

Implementation verification is intentionally focused during development:

1. Extend `scripts/test-invoice-export-contract.mjs` for the approved mapping, removal of `due`, static student metadata, section titles, auto-recipient fallback, empty-session blocking, and three-template content parity.
2. Run `rtk node scripts/test-invoice-export-contract.mjs`.
3. Run `rtk git diff --check`.
4. Report that the full suite, responsive sweep, accessibility test, and visual regression test were not run under the development test policy unless the user separately requests them.

A later visual approval should inspect the form and each template at the already approved desktop, tablet, and mobile breakpoints. That review is not part of writing this design spec.

## Acceptance Criteria

- Tingkat Pendidikan appears once, directly below Nama murid, as static metadata.
- Changing students cannot leave the previous student's education, address, or billing recipient in the form.
- Ditagih Kepada defaults to the current student's stored parent or guardian name, or `Orang tua/wali ${studentName}`.
- A manually edited Ditagih Kepada remains editable and persists through draft restore for the same student.
- Profil tutor and Penerima invoice are separate single-column sections.
- Brand appears at most once in each template and never repeats inside sender detail lines.
- The recipient block identifies the billing recipient and student without repeated relationship copy.
- `due` no longer exists in the active Invoice contract or sample data.
- Every visible hint and placeholder is left-aligned.
- Preview and export cannot proceed while sessions are loading, failed, or empty.
- Klasik, Modern, and Minimal render the same supplied business fields.
- No route, quota, A4 export, dialog, or protected-shell behavior changes outside this scope.

## Approval Record

- Mapping approach: minimum patch.
- Ditagih Kepada default: `Orang tua/wali ${studentName}` when stored parent data is unavailable.
- Student-change behavior: reset Ditagih Kepada for the newly selected student, then keep it editable.
- Form layout: approved with all hints and placeholders left-aligned.
- Empty sessions: block preview and PDF export.
