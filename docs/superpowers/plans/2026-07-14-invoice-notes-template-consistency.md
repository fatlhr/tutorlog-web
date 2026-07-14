# Invoice Notes and Template Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the duplicated visible notes label, show notebook-like lines when Invoice notes are empty, and keep the same business information in Klasik, Modern, and Minimal templates.

**Architecture:** Keep the existing `InvoiceData` contract, but move its shared default data and formatting helpers out of `TplKlasik`. A small shared notes component owns the filled and empty states, while each template keeps its own layout. The focused source contract protects semantic parity without running the development-phase full test suite.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules, shared Invoice CSS, Node assertion contract.

## Global Constraints

- Preserve the existing TutorLog visual system and A4 export pipeline.
- The form shows one visible heading for notes while retaining an accessible textarea label.
- Empty notes render two ruled notebook lines in all templates.
- Klasik, Modern, and Minimal display number, date, period, sender, recipient, every supplied detail line, session rows, total hours, total amount, notes, and full payment details.
- Do not commit, push, merge, or create a PR.
- Run only the focused Invoice contract and `git diff --check`.

---

### Task 1: Extend the focused Invoice contract

**Files:**
- Modify: `scripts/test-invoice-export-contract.mjs`

- [ ] Assert that the notes field uses a visually hidden label.
- [ ] Assert that all templates use one shared empty-notes component.
- [ ] Assert template parity for invoice metadata, party detail lines, `Tarif/jam`, total hours, total amount, and payment owner.
- [ ] Run `rtk node scripts/test-invoice-export-contract.mjs` and verify it fails for the missing behavior.

### Task 2: Remove the duplicated visible field label

**Files:**
- Modify: `components/app-ui/controls.tsx`
- Modify: `components/app-ui/app-ui.module.css`
- Modify: `app/app/invoice/page.tsx`

- [ ] Add a `labelVisuallyHidden` option to `Field` that preserves the native `<label>` relationship.
- [ ] Apply it only to `invoice-notes` so the section heading remains the single visible label.

### Task 3: Share Invoice notes and data semantics

**Files:**
- Create: `components/invoice/InvoiceNotes.tsx`
- Create: `components/invoice/invoice-data.ts`
- Modify: `components/invoice/TplKlasik.tsx`
- Modify: `components/invoice/TplModern.tsx`
- Modify: `components/invoice/TplMinimal.tsx`
- Modify: `app/app/invoice/page.tsx`
- Modify: `components/PublicProductRail.tsx`
- Modify: `css/tutorlog-web-invoices.css`

- [ ] Centralize `InvoiceData`, sample data, currency formatting, and totals.
- [ ] Render real notes when present and two ruled lines when empty.
- [ ] Preserve each template's visual character while displaying the same business information.

### Task 4: Focused verification

**Files:**
- Verify: all files above

- [ ] Run `rtk node scripts/test-invoice-export-contract.mjs` and verify it passes.
- [ ] Run `rtk git diff --check` and verify it is clean.
- [ ] Report that the full suite was not run under the development test policy.
