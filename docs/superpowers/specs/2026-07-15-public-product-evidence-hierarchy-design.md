# Public Product Evidence Hierarchy Design

**Status:** Approved design direction

**Routes:** `/`, `/fitur`, `/harga`, `/panduan`

**Mode:** Redesign preserve

**Design Read:** Marketing site for Indonesian private tutors with a playful editorial planner language. Public pages remain marketing-oriented while product evidence is assigned a clear role per route.

**Design dials:** Variance 7, motion 5, density 4.

## Problem

The public site currently repeats the same mobile home, history, recap, and invoice visuals across the homepage, feature page, and guide. Several screenshots are too small to read on desktop, so they behave as decoration instead of useful product evidence. On mobile, repeated copy, screenshot, and divider stacks make `/fitur` and `/panduan` longer than their content requires.

The repetition also weakens route differentiation:

- `/` reads like a condensed feature catalog.
- `/fitur` repeats four nearly identical split rows.
- `/panduan` gives full screenshots more space than the instructions they support.
- `/harga` is easier to scan because it does not repeat device mockups.

## Goals

- Keep one strong full-product composition in the homepage hero.
- Make `/fitur` the primary destination for complete product screenshots and enlargement dialogs.
- Replace repeated screenshots on the lower homepage and `/panduan` with product-derived artifacts.
- Keep `/harga` focused on package comparison and purchase decisions.
- Preserve routes, navigation, copy intent, CTA intent, analytics hooks, pricing logic, and protected app behavior.
- Shorten the mobile reading path without removing product information.

## Non-goals

- No protected app redesign.
- No route, navigation, authentication, pricing, export, or invoice logic changes.
- No new product screenshots.
- No generated fake dashboard, fake mobile frame, or invented product capability.
- No photography or external image dependency in this revision.
- No rewrite of legal, payment, pricing, or formal invoice copy.
- No replacement of the existing homepage hero direction.

## Product Evidence Hierarchy

Product evidence has three levels.

### Level A: Full product proof

Full screenshots or rendered product views answer: "What does TutorLog look like?"

Allowed locations:

- Homepage hero.
- `/fitur` evidence groups.
- Enlargement dialogs opened from `/fitur`.

Full product proof is removed from the lower homepage and `/panduan`.

### Level B: Product-derived artifacts

Artifacts answer: "What moves through TutorLog?"

Artifacts use real TutorLog content and data contracts without device chrome:

- Session Artifact.
- Monthly Recap Sheet.
- Invoice Paper.
- Data Journey connectors.

These are marketing compositions built from actual product information. They must not imitate a full dashboard or mobile screenshot.

### Level C: Symbolic marketing visual

Symbolic visuals answer: "How should I think about this decision?"

The receipt and access illustration on `/harga` remains symbolic. It does not need a screenshot or product UI fragment.

## Shared Artifact Data

All artifacts in one composition must describe the same teaching period so the journey is credible.

Use the current public invoice fixture as the source and extract it from `components/PublicProductRail.tsx` into a shared public evidence data module.

The derived artifact values are:

- Session example: `03 Jun`, `Matematika - Trigonometri`, `1.5 jam`, `Rp180.000`.
- Recap period: `Juni 2026`.
- Recap totals: `3 sesi`, `5 jam`, `Rp560.000`.
- Invoice number: `INV-2026-06-014`.
- Invoice total: `Rp560.000`.

Do not create a second fixture with different students, periods, or totals for the same workflow canvas.

## Artifact Definitions

### Session Artifact

A compact paper card representing one completed lesson.

Content:

- Date.
- Subject or session note.
- Duration.
- Amount.
- Small completed-state label.

It has no mobile status bar, tab bar, timer screen, or fake input controls.

### Monthly Recap Sheet

A small monthly paper summary using the same metric language as the protected recap.

Content:

- Period label.
- Completed session count.
- Teaching hours.
- Estimated income.
- One short student or subject breakdown line when space allows.

It is a document-like summary, not a miniature dashboard screenshot.

### Invoice Paper

Use the real `TplModern` invoice component and the shared public fixture. The artifact may be scaled and cropped by its container, but its content contract stays unchanged.

### Data Journey

Connect the three artifacts in this order:

`Session Artifact -> Monthly Recap Sheet -> Invoice Paper`

Connectors are decorative and receive `aria-hidden="true"`. The reading order in the DOM follows the same sequence without relying on connector graphics.

## Route Composition

### `/` Homepage

Keep the current hero timetable canvas and overlapping mobile product composition.

Replace the three equal screenshot proof stories below the transition section with one `TutorLog Workflow Canvas`.

Desktop composition:

- One asymmetric horizontal canvas.
- Session Artifact starts at the left.
- Monthly Recap Sheet sits slightly higher in the center.
- Invoice Paper anchors the right side.
- Existing titles and body copy for `Catat sesi`, `Buka rekap`, and `Buat invoice` remain associated with their artifact.
- Connectors show that the same data continues through the workflow.

Mobile composition:

- Strict single-column sequence.
- Copy appears before its artifact.
- Short vertical connectors separate stages.
- No horizontal scrolling.
- Artifact width stays inside the content column.

The testimonial, navigation links, final CTA, and footer remain in their current order.

Screenshot budget:

- One full-product composition in the hero.
- Zero full product screenshots below the hero.
- One workflow canvas containing three product-derived artifacts.

### `/fitur`

This route becomes the primary full product evidence page.

Replace four identical feature rows with three evidence groups.

#### Mobile workspace

- Combine the current mobile home and history screenshots in one group.
- Keep separate copy for session recording and history revision.
- Present the screenshots as a paired proof rather than two repeated sections.
- Both screenshots remain eligible for the existing enlargement dialog.

#### Cross-device recap

- Keep the current mobile and web recap pair.
- Increase its usable display area so the web summary and mobile export state can be recognized without opening the dialog.
- Preserve the enlargement dialogs.

#### Invoice output

- Use the real `TplModern` preview.
- Give the invoice a wider composition and enough scale to read its hierarchy.
- Preserve the enlargement dialog.

Desktop layout rhythm:

- Mobile workspace uses a split composition.
- Cross-device recap uses a wide evidence stage with copy above or beside the proof based on available width.
- Invoice output uses an offset document composition.
- Do not repeat the same left-copy and right-proof row more than once.

Mobile layout:

- Every group becomes one column.
- The paired mobile screenshots share one bounded composition.
- Copy and proof remain adjacent.
- Proofs do not create nested horizontal page scrolling.

Screenshot budget:

- One mobile evidence group with two screenshots.
- One recap evidence group with mobile and web proof.
- One invoice evidence group using the real invoice component.

### `/panduan`

Remove full device screenshots from both phases.

#### `Di HP`

- Keep steps 01-03 and their current copy.
- Place the Session Artifact close to the completed-session step.
- Add a restrained line showing that one saved session becomes reusable data.

#### `Di web`

- Keep steps 04-06 and their current copy.
- Use the Monthly Recap Sheet followed by the Invoice Paper.
- The sequence supports the recap and invoice steps without repeating the full web screenshots from `/fitur`.

Desktop layout:

- Each phase uses a two-column arrangement with instructions and one bounded artifact composition.
- Artifacts align with the related step group, not the page center.

Mobile layout:

- Artifacts appear directly after the related steps.
- The phone-height poster space is removed.
- The existing step order and numbering remain unchanged.

Screenshot budget:

- Zero full device screenshots.
- Two product-derived artifact compositions.

### `/harga`

Keep the current pricing ledger, FAQ, and receipt illustration.

The receipt visual uses the shared public paper surface, border line, primary action green, card radius, and pill radius tokens. It must remain symbolic and must not gain a product screenshot.

Screenshot budget:

- Zero screenshots.

## Component Boundaries

Create a focused public evidence module:

```text
components/public-ui/product-evidence/
  product-evidence-data.ts
  session-artifact.tsx
  recap-artifact.tsx
  invoice-artifact.tsx
  workflow-canvas.tsx
  product-evidence.module.css
```

Responsibilities:

- `product-evidence-data.ts` owns the shared public fixture and derived totals used by artifacts and the existing invoice proof.
- `session-artifact.tsx` renders one completed session card.
- `recap-artifact.tsx` renders the period summary.
- `invoice-artifact.tsx` wraps the real `TplModern` output for marketing composition.
- `workflow-canvas.tsx` composes the artifacts and connectors for the homepage.
- `product-evidence.module.css` owns artifact layout, responsive collapse, and reduced-motion behavior.

Existing boundaries:

- `components/PublicProductRail.tsx` remains responsible for full screenshots and enlargement dialogs.
- `components/PublicProofDialog.tsx` keeps its existing behavior.
- Protected components remain under `components/app-ui` and are not imported into public pages.
- Public artifacts may consume shared non-visual foundation tokens from `css/tutorlog-foundation.css`.

## Visual Contract

### Material

- Artifacts use opaque paper surfaces.
- Borders use the existing green-gray line family.
- The primary green remains the only action or completion accent.
- Lavender and coral remain background decoration, not artifact state colors.
- Device chrome is reserved for full product screenshots.

### Shape

- Artifact paper uses the established public card radius.
- Compact labels may use the established pill radius.
- Connectors remain line-based and do not introduce new floating badges.

### Typography

- Artifact labels and values use the existing title or mono language where product values require emphasis.
- Supporting descriptions use the existing body type.
- The artifacts do not introduce a new font family.

### Density

- Each artifact shows only the fields required to understand the workflow.
- No full session table appears on the homepage.
- No miniature dashboard is placed inside an artifact.
- Invoice content stays intact because it is a real output document.

## Interaction and Motion

- Homepage and guide artifacts are non-interactive.
- Full product proofs on `/fitur` retain enlargement dialogs.
- Existing focus trap, Escape dismissal, scroll lock, and focus return behavior remain unchanged.
- Existing public reveal behavior may be reused for artifact entry.
- Connector motion, if used, communicates workflow progression and only animates transform or opacity.
- `prefers-reduced-motion: reduce` renders all artifacts and connectors immediately without animation.
- No new motion dependency is added.

## Accessibility

- Workflow stages follow a logical DOM order.
- Decorative connectors are hidden from assistive technology.
- Each artifact has an accessible heading or figure caption.
- Text remains readable without opening a dialog.
- Interactive screenshot proofs retain keyboard access and visible focus.
- Artifact text, placeholder-like labels, borders, and focus rings meet WCAG AA contrast against their surface.
- Mobile touch targets remain at least 44px where interaction exists.

## Responsive Requirements

Audit at these widths:

- 320px.
- 390px.
- 768px.
- 1024px.
- 1440px.

Required outcomes:

- No horizontal overflow.
- Homepage workflow collapses to one column below 768px.
- Feature evidence groups keep copy next to the proof they describe.
- Guide artifacts do not exceed the content column.
- Invoice scaling never changes its internal data mapping or PDF layout contract.
- Footer and CTA positions remain stable.

## Testing and Review

### Contract checks

- Add a public product evidence contract test that verifies one shared fixture feeds session, recap, and invoice artifacts.
- Verify derived totals equal the invoice total.
- Verify `/panduan` no longer imports `PublicProductProof`.
- Verify `/fitur` remains the only lower-page full screenshot destination.
- Keep the existing invoice export contract passing.

### Browser checks

- Responsive sweep for `/`, `/fitur`, `/harga`, and `/panduan` at the five required widths.
- Accessibility scan for all four routes.
- Keyboard check for feature proof dialogs.
- Reduced-motion check for workflow and evidence reveals.
- Visual review of route differentiation and screenshot budgets.

### Visual review questions

- Does the homepage explain one continuous data journey without reading like a feature catalog?
- Can the screenshots on `/fitur` be recognized at their default size?
- Does `/panduan` stay instructional and become shorter on mobile?
- Does `/harga` remain the fastest page to scan?
- Does each route have a distinct visual job while staying in the same TutorLog system?

## Acceptance Criteria

- The homepage keeps its hero product composition and has no full screenshots below the hero.
- The lower homepage uses one workflow canvas with session, recap, and invoice artifacts.
- `/fitur` contains three visually distinct evidence groups and preserves screenshot enlargement.
- `/panduan` contains no full device screenshot and preserves steps 01-06 in order.
- `/harga` contains no screenshot and preserves pricing and purchase behavior.
- The same fixture and totals connect session, recap, and invoice evidence.
- No protected route, business logic, analytics hook, CTA intent, or invoice PDF contract changes.
- Public responsive, accessibility, reduced-motion, and interaction checks pass before merge.
