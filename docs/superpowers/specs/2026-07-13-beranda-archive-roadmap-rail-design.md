# Beranda Archive and Roadmap Rail Design

**Status:** Approved and implemented in the working tree on 2026-07-13. Static review is complete; runtime viewport review remains pending explicit approval.

## Goal

Fill the lower Beranda canvas with information that suits an occasional administrative web companion: a real previous-month archive and a restrained preview of the mobile reminder roadmap. Make `Sesi selesai` the clear focal point of the current-month summary.

## Design read

Reading this as: a protected workspace for individual private tutors who record sessions in the mobile app and open the web mainly to review, archive, or prepare invoices. The visual language stays editorial and planner-like, with low interaction density and no daily-dashboard framing.

## Product boundary

- Mobile remains the daily surface for recording completed tutoring sessions.
- Beranda web remains an administrative overview, not a schedule, habit tracker, or analytics dashboard.
- All archive values come from the authenticated tutor's real completed-session data.
- The roadmap preview is informational. It has no release date, fake progress, disabled control, or destination link.
- No invoice-completion state is inferred because TutorLog does not currently store invoice history.

## Current-month summary hierarchy

### Component contract

Extend the existing `SummaryItem` type with an optional semantic emphasis:

```ts
export interface SummaryItem {
  label: string;
  value: ReactNode;
  emphasis?: "primary";
}
```

`SummaryBand` renders the value as `data-emphasis="primary"` on the matching `.summaryItem`. It accepts at most one primary item. Beranda assigns the emphasis only to `Sesi selesai`; other routes retain their current layout.

### Desktop and tablet

- Keep one solid soft-mint band.
- With three home items and one primary item, use `1.28fr 1fr 1fr` columns.
- Give the primary item a slightly stronger mint surface and a 38px value on desktop.
- Keep the two secondary values at 27px.
- Preserve one shared border, flat elevation, and the current label/value order.

### Mobile

- Use a two-column band.
- Make `Sesi selesai` span both columns as the first, taller row.
- Place `Waktu mengajar` and `Estimasi pendapatan` side by side below it.
- Keep the primary value at 32px and the secondary values at 20px. Secondary labels may wrap to two lines.
- Preserve source order and one accessible region label.

## Closing rail

Place one closing rail after the existing Beranda session or empty state and before the shell footer. It is part of the route canvas and uses one shared border treatment instead of separate floating cards.

### Desktop

- Use `minmax(0, 1.65fr) minmax(260px, .75fr)` tracks for the archive and roadmap areas.
- Separate the tracks with one vertical rule.
- Keep the rail full width of `PageMain`.
- Use the existing paper and mint tokens, existing radii, and no shadow.

### Tablet and mobile

- Stack the archive and roadmap areas vertically.
- Replace the vertical rule with a horizontal rule.
- Keep archive metrics scannable without introducing a second summary-card row.
- Keep the roadmap copy short enough to fit without pushing the footer far below the content.

## Previous-month archive

### Data flow

Derive the previous calendar month from the same request-time `now` value used for the current period. Reuse `monthRange()` and `fetchRekapDataByRange()`:

```ts
const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const previousPeriod = monthRange(previousMonthDate);
```

Add the archive request to the existing `Promise.allSettled()` call so its failure does not block the current summary, recent sessions, or quota state.

### Content with data

- Eyebrow: `Arsip bulan lalu`
- Heading: localized month and year, for example `Juni 2026`
- Metrics: completed sessions, teaching hours, and estimated income
- Action: `Buka rekap`
- Destination: `/app/rekap?from=<previous-from>&to=<previous-to>`

The archive metrics remain smaller than the current-month summary. They are a compact record, not another primary dashboard section.

### Empty and error states

- A successful empty result shows `Belum ada sesi selesai pada <bulan>.` and retains the `Buka rekap` action.
- A rejected archive request shows `Arsip bulan lalu belum dapat dimuat.` without changing the current Beranda state.
- Do not replace missing data with zero values when the request failed.

## Roadmap preview

### Content

- Eyebrow: `Sedang disiapkan`
- Heading: `Pengingat sebelum sesi`
- Body: `Kami sedang menyiapkan pengingat sebelum sesi untuk melengkapi alur harian di aplikasi mobile.`
- Visual: one existing Phosphor bell icon, marked decorative.

This wording is grounded in the existing Priority 2 roadmap entry for an email reminder before a session. It does not state a delivery date or claim that development is complete.

### Interaction

- No button or link.
- No fake progress bar, waitlist form, notification toggle, or `Segera hadir` badge.
- The panel must not appear as a Plus upsell.

## Files expected to change

- `app/app/page.tsx`
  - fetch previous-month recap data;
  - mark `Sesi selesai` as primary;
  - render the closing rail after the current Beranda state.
- `app/app/home.module.css`
  - own archive and roadmap rail composition and responsive stacking.
- `components/app-ui/types.ts`
  - add the optional `SummaryItem.emphasis` contract.
- `components/app-ui/structure.tsx`
  - render and validate semantic summary emphasis.
- `components/app-ui/app-ui.module.css`
  - style the primary summary item and its responsive grid without changing Recap or Invoice summary behavior.

No new component, package, route, Supabase table, migration, global stylesheet, or client-side state is required.

## Accessibility and resilience

- Keep `SummaryBand` as one labelled section and preserve logical DOM order.
- Give the archive heading a stable ID and use `aria-labelledby` on its region.
- Mark the roadmap icon decorative.
- Keep the archive link at least 44px high on mobile and preserve the shared focus ring.
- Archive loading failure remains isolated through `Promise.allSettled()`.
- Long currency values may wrap within the secondary mobile cell; they must not cause horizontal overflow or use a smaller type size than 20px.

## Constraints

- No dummy protected data.
- No comparison percentages, charts, streaks, student ranking, or daily insight.
- No second contextual action inside the existing `Buka rekap bulan ini` panel.
- No public-page or `/` navigation changes.
- No footer-height changes in this step.
- Preserve current paid, free, exhausted-quota, empty, loading, and error behavior.

## Verification

During development:

- run `rtk git diff --check`;
- run `rtk node scripts/audit-protected-app-system.mjs`;
- review the source diff for protected-data and state isolation.

Do not run build, lint, responsive sweep, automated accessibility, or visual regression unless explicitly requested under the repository development policy. If runtime review is requested, inspect the authenticated route at `1440x900`, `1024x768`, and `390x844`, including archive data, archive empty/error behavior when safely available, summary hierarchy, footer position, and horizontal overflow.

## Acceptance criteria

- `Sesi selesai` is the single primary summary item on desktop, tablet, and mobile.
- Current-month secondary metrics remain readable but visually quieter.
- The previous-month archive uses real authenticated completed-session data and links to the exact period in Rekap.
- Empty and failed archive requests have distinct copy.
- The roadmap preview contains no non-working interaction or release promise.
- The rail fills the lower composition without turning Beranda into a daily-use dashboard.
