# Beranda Archive and Roadmap Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `Sesi selesai` the primary current-month metric and fill the lower Beranda composition with a real previous-month archive plus a non-interactive preview of the mobile reminder roadmap.

**Architecture:** Extend the existing `SummaryBand` contract with one optional semantic emphasis and keep the styling scoped to the home tone. Fetch the previous calendar month through the existing server-side recap query, isolate it with `Promise.allSettled()`, and render one responsive closing rail directly in Beranda without adding client state, a route, or a new shared component.

**Tech Stack:** Next.js 16 Server Components, React 19, TypeScript, Supabase, CSS Modules, internal `app-ui` primitives, Phosphor SSR icons.

**Status:** Tasks 1 and 2 are implemented and independently reviewed. Task 3 is complete through the static stop point; runtime review, screenshot approval, staging, and commit remain pending.

## Global Constraints

- Mobile remains the daily surface for recording completed tutoring sessions.
- Beranda web remains an administrative overview, not a schedule, habit tracker, or analytics dashboard.
- All archive values must come from the authenticated tutor's real completed-session data.
- Use the exact roadmap copy `Kami sedang menyiapkan pengingat sebelum sesi untuk melengkapi alur harian di aplikasi mobile.`
- Do not add a roadmap link, button, release date, progress indicator, notification toggle, or Plus upsell.
- Do not infer invoice completion because TutorLog does not store invoice history.
- Do not add dummy protected data, a dependency, route, component, Supabase table, migration, global stylesheet, or client-side state.
- Do not change public pages, `/` navigation, footer height, Rekap content, Invoice content, quota behavior, or the existing `Buka rekap bulan ini` contextual action.
- Preserve current paid, free, exhausted-quota, empty, loading, and error behavior.
- During feature development, do not run build, lint, test suites, responsive sweep, automated accessibility, or visual regression unless the user explicitly requests it.
- Use only `rtk git diff --check`, `rtk node scripts/audit-protected-app-system.mjs`, and source-diff review before runtime approval.
- Do not stage `.superpowers/`, `live-screenshots/`, `AGENTS.md`, or unrelated working-tree files.

---

## File map

- `components/app-ui/types.ts`: owns the optional `SummaryItem.emphasis` type.
- `components/app-ui/structure.tsx`: validates one primary summary item and exposes it as a data attribute.
- `components/app-ui/app-ui.module.css`: owns shared summary layout and home-only primary emphasis.
- `app/app/page.tsx`: derives the previous period, fetches its recap data, marks `Sesi selesai` primary, and renders the closing rail.
- `app/app/home.module.css`: owns the archive/roadmap rail layout and responsive treatment.
- `docs/superpowers/specs/2026-07-13-beranda-archive-roadmap-rail-design.md`: approved visual and product contract.
- `docs/superpowers/plans/2026-07-13-beranda-archive-roadmap-rail.md`: execution checklist and verification evidence.

---

### Task 1: Add semantic summary emphasis

**Files:**
- Modify: `components/app-ui/types.ts:25-28`
- Modify: `components/app-ui/structure.tsx:113-141`
- Modify: `components/app-ui/app-ui.module.css:453-500, 916-950`

**Interfaces:**
- Consumes: existing `SummaryBand({ label, items, density, tone })` and `SummaryItem` contracts.
- Produces: `SummaryItem.emphasis?: "primary"` and `.summaryItem[data-emphasis="primary"]` for the Beranda consumer in Task 2.

- [x] **Step 1: Extend `SummaryItem` with semantic emphasis**

Change the interface to:

```ts
export interface SummaryItem {
  label: string;
  value: ReactNode;
  emphasis?: "primary";
}
```

- [x] **Step 2: Validate and render the primary item**

In `SummaryBand`, retain the existing item-count guard and add a primary-count guard before the return:

```tsx
const primaryCount = items.filter((item) => item.emphasis === "primary").length;
if (primaryCount > 1) {
  throw new Error("SummaryBand accepts at most one primary item.");
}
```

Render each summary item with its semantic data attribute:

```tsx
{items.map((item) => (
  <div
    className={styles.summaryItem}
    data-emphasis={item.emphasis}
    key={item.label}
  >
    <span>{item.label}</span>
    <strong>{item.value}</strong>
  </div>
))}
```

- [x] **Step 3: Add desktop and tablet home emphasis**

Place these rules after the current home summary value rules so they win without `!important`:

```css
.summaryBand[data-count="3"]:has(.summaryItem[data-emphasis="primary"]) {
  grid-template-columns: 1.28fr 1fr 1fr;
}

.summaryDensityDefault.toneHome .summaryItem[data-emphasis="primary"] {
  background: color-mix(in srgb, var(--app-home-accent) 78%, var(--app-paper));
}

.summaryDensityDefault.toneHome .summaryItem[data-emphasis="primary"] strong {
  color: var(--app-home-accent-ink);
  font-size: 38px;
  line-height: 44px;
}

.summaryDensityDefault.toneHome .summaryItem:not([data-emphasis="primary"]) strong {
  font-size: 27px;
  line-height: 33px;
}
```

In the existing tablet query, add:

```css
.summaryDensityDefault.toneHome .summaryItem[data-emphasis="primary"] strong {
  font-size: 34px;
  line-height: 40px;
}
```

- [x] **Step 4: Build the two-row mobile hierarchy**

Append these rules inside the existing `@media (max-width: 767px)` query after the current summary rules:

```css
.summaryBand.summaryBand[data-count="3"]:has(.summaryItem[data-emphasis="primary"]) {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summaryBand[data-count="3"]:has(.summaryItem[data-emphasis="primary"]) .summaryItem {
  display: grid;
  min-height: 78px;
  align-content: center;
  justify-content: stretch;
  padding: 14px var(--space-5);
  border-bottom: 0;
}

.summaryBand[data-count="3"]:has(.summaryItem[data-emphasis="primary"]) .summaryItem[data-emphasis="primary"] {
  grid-column: 1 / -1;
  min-height: 92px;
  padding: 18px var(--space-6);
  border-bottom: 1px solid var(--app-line);
}

.summaryBand[data-count="3"]:has(.summaryItem[data-emphasis="primary"]) .summaryItem:nth-child(2) {
  border-inline-end: 1px solid var(--app-line);
}

.summaryBand[data-count="3"]:has(.summaryItem[data-emphasis="primary"]) .summaryItem span {
  max-width: 15ch;
  margin: 0 0 var(--space-1);
  line-height: 17px;
}

.summaryBand[data-count="3"]:has(.summaryItem[data-emphasis="primary"]) .summaryItem strong {
  overflow-wrap: anywhere;
  text-align: start;
}

.summaryDensityDefault.toneHome .summaryItem[data-emphasis="primary"] strong {
  font-size: 32px;
  line-height: 38px;
}

.summaryDensityDefault.toneHome .summaryItem:not([data-emphasis="primary"]) strong {
  font-size: 20px;
  line-height: 25px;
}
```

- [x] **Step 5: Review the Task 1 diff**

Run:

```bash
rtk git diff -- components/app-ui/types.ts components/app-ui/structure.tsx components/app-ui/app-ui.module.css
```

Expected: one optional type field, one validation branch, one data attribute, and home-scoped summary CSS. No Recap or Invoice selector changes.

---

### Task 2: Fetch and render the archive and roadmap rail

**Files:**
- Modify: `app/app/page.tsx:1-210`
- Modify: `app/app/home.module.css:1-130`

**Interfaces:**
- Consumes: `fetchRekapDataByRange(from: string, to: string): Promise<RekapData>`, `SummaryItem.emphasis`, `Button`, and the existing `monthRange(date)` helper.
- Produces: an isolated `previousResult`, exact previous-period Rekap link, one archive region, and one informational roadmap aside.

- [x] **Step 1: Add the required imports**

Update the icon import and add the summary type import:

```tsx
import {
  ArrowRight,
  BellRinging,
  CalendarBlank,
  DeviceMobile,
} from "@phosphor-icons/react/dist/ssr";
import type { SummaryItem } from "@/components/app-ui/types";
```

- [x] **Step 2: Derive the current and previous calendar months**

Replace the current `period` and `monthLabel` declarations with this complete ordered block:

```tsx
const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});
const period = monthRange(now);
const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const previousPeriod = monthRange(previousMonthDate);
const monthLabel = monthFormatter.format(now);
const previousMonthLabel = monthFormatter.format(previousMonthDate);
```

- [x] **Step 3: Add the isolated archive request**

Change the settled request tuple to:

```tsx
const [monthResult, recentResult, quotaResult, previousResult] = await Promise.allSettled([
  fetchRekapDataByRange(period.from, period.to),
  fetchRecentSessions(3),
  checkQuota(),
  fetchRekapDataByRange(previousPeriod.from, previousPeriod.to),
]);
```

Derive archive state without altering current-month state:

```tsx
const previousData = previousResult.status === "fulfilled" ? previousResult.value : null;
const previousLoadError = previousResult.status === "rejected";
```

- [x] **Step 4: Mark `Sesi selesai` as the primary item**

Annotate the array and set emphasis only on the first metric:

```tsx
const summaryItems: SummaryItem[] = monthData ? [
  {
    label: "Sesi selesai",
    value: monthData.summary.totalSesi,
    emphasis: "primary",
  },
  { label: "Waktu mengajar", value: monthData.summary.totalJam },
  { label: "Estimasi pendapatan", value: monthData.summary.totalPendapatan },
] : [];
```

- [x] **Step 5: Render the closing rail after the existing page-state branch**

Place this block after the current sessions/error/empty ternary and before `</PageMain>`:

```tsx
<section className={styles.closingRail} aria-label="Arsip dan pembaruan TutorLog">
  <article className={styles.archiveRail} aria-labelledby="previous-month-title">
    <header className={styles.railHeader}>
      <div>
        <p>Arsip bulan lalu</p>
        <h2 id="previous-month-title">{previousMonthLabel}</h2>
      </div>
      <Button
        href={`/app/rekap?from=${previousPeriod.from}&to=${previousPeriod.to}`}
        variant="quiet"
        size="compact"
        trailingIcon={<ArrowRight aria-hidden="true" />}
      >
        Buka rekap
      </Button>
    </header>

    {previousData && previousData.summary.totalSesi > 0 ? (
      <dl className={styles.archiveMetrics}>
        <div>
          <dt>Sesi selesai</dt>
          <dd>{previousData.summary.totalSesi}</dd>
        </div>
        <div>
          <dt>Waktu mengajar</dt>
          <dd>{previousData.summary.totalJam}</dd>
        </div>
        <div>
          <dt>Estimasi pendapatan</dt>
          <dd>{previousData.summary.totalPendapatan}</dd>
        </div>
      </dl>
    ) : previousLoadError ? (
      <p className={styles.archiveMessage}>Arsip bulan lalu belum dapat dimuat.</p>
    ) : (
      <p className={styles.archiveMessage}>Belum ada sesi selesai pada {previousMonthLabel}.</p>
    )}
  </article>

  <aside className={styles.roadmapRail} aria-labelledby="roadmap-preview-title">
    <BellRinging size={24} weight="duotone" aria-hidden="true" />
    <div>
      <p>Sedang disiapkan</p>
      <h2 id="roadmap-preview-title">Pengingat sebelum sesi</h2>
      <span>Kami sedang menyiapkan pengingat sebelum sesi untuk melengkapi alur harian di aplikasi mobile.</span>
    </div>
  </aside>
</section>
```

- [x] **Step 6: Add the desktop rail styles**

Append these module rules before the existing responsive queries:

```css
.closingRail {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, .75fr);
  overflow: hidden;
  border: 1px solid var(--app-line);
  border-radius: var(--radius-surface);
  background: var(--app-paper);
}

.archiveRail,
.roadmapRail {
  min-width: 0;
  padding: var(--space-7);
}

.archiveRail {
  display: grid;
  gap: var(--space-6);
}

.railHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-5);
}

.railHeader p,
.roadmapRail p {
  margin: 0;
  color: var(--app-home-accent-ink);
  font-family: var(--app-font-title);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
}

.railHeader h2,
.roadmapRail h2 {
  margin: var(--space-2) 0 0;
  font-family: var(--app-font-title);
  font-size: 18px;
  line-height: 24px;
}

.archiveMetrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
  margin: 0;
}

.archiveMetrics div {
  min-width: 0;
  padding-inline-end: var(--space-5);
  border-inline-end: 1px solid var(--app-line);
}

.archiveMetrics div:last-child {
  padding-inline-end: 0;
  border-inline-end: 0;
}

.archiveMetrics dt {
  color: var(--app-ink-muted);
  font-family: var(--app-font-body);
  font-size: 12px;
  line-height: 17px;
}

.archiveMetrics dd {
  margin: var(--space-2) 0 0;
  overflow-wrap: anywhere;
  font-family: var(--app-font-title);
  font-size: 20px;
  font-weight: 700;
  line-height: 26px;
}

.archiveMessage {
  margin: 0;
  color: var(--app-ink-muted);
  font-family: var(--app-font-body);
  font-size: 14px;
  line-height: 21px;
}

.roadmapRail {
  display: grid;
  align-content: start;
  gap: var(--space-5);
  border-inline-start: 1px solid var(--app-line);
  color: var(--app-ink);
  background: color-mix(in srgb, var(--app-home-accent) 46%, var(--app-paper));
}

.roadmapRail > svg {
  color: var(--app-home-accent-ink);
}

.roadmapRail span {
  display: block;
  margin-top: var(--space-3);
  color: var(--app-ink-muted);
  font-family: var(--app-font-body);
  font-size: 13px;
  line-height: 19px;
}
```

- [x] **Step 7: Stack the rail at tablet and mobile widths**

Add to the existing `@media (max-width: 1100px) and (min-width: 768px)` query:

```css
.closingRail {
  grid-template-columns: 1fr;
}

.roadmapRail {
  border-inline-start: 0;
  border-top: 1px solid var(--app-line);
}
```

Add to the existing `@media (max-width: 767px)` query:

```css
.closingRail {
  grid-template-columns: 1fr;
}

.archiveRail,
.roadmapRail {
  padding: var(--space-6);
}

.roadmapRail {
  border-inline-start: 0;
  border-top: 1px solid var(--app-line);
}

.railHeader {
  align-items: flex-start;
  flex-direction: column;
  gap: var(--space-3);
}

.archiveMetrics {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

.archiveMetrics div:nth-child(2) {
  padding-inline-end: 0;
  border-inline-end: 0;
}

.archiveMetrics div:last-child {
  grid-column: 1 / -1;
  padding-top: var(--space-4);
  border-top: 1px solid var(--app-line);
}
```

Rely on the shared mobile 44px button treatment and keep the action at its natural left edge. Do not reach into the shared button's generated CSS Module class from `home.module.css`.

- [x] **Step 8: Review the Task 2 diff**

Run:

```bash
rtk git diff -- app/app/page.tsx app/app/home.module.css
```

Expected: one additional server query in the existing settled group, no client state, one exact-period link, one archive rail, and one non-interactive roadmap aside.

---

### Task 3: Verify and prepare the visual-review handoff

**Files:**
- Modify after verification: `docs/superpowers/plans/2026-07-13-beranda-archive-roadmap-rail.md`
- Modify after runtime review: `.superpowers/sdd/step-3a-report.md`

**Interfaces:**
- Consumes: completed Task 1 and Task 2 source changes.
- Produces: static-check evidence and a clear stop point before any runtime sweep, staging, or commit.

- [x] **Step 1: Run the permitted static checks**

Run:

```bash
rtk git diff --check
rtk node scripts/audit-protected-app-system.mjs
```

Expected:

```text
git diff --check: no output, exit 0
audit: component inventory, token, radius, button-size, input-height, focus, boundary, and file-hygiene summaries with exit 0
```

- [x] **Step 2: Review the scoped source diff**

Run:

```bash
rtk git diff -- app/app/page.tsx app/app/home.module.css components/app-ui/types.ts components/app-ui/structure.tsx components/app-ui/app-ui.module.css
```

Confirm all of the following from the diff:

- only `Sesi selesai` has `emphasis: "primary"`;
- the previous query uses `previousPeriod.from` and `previousPeriod.to`;
- `previousLoadError` cannot replace or block current-month state;
- archive values come only from `previousData.summary`;
- empty and failed archive copy are distinct;
- the roadmap aside has no interactive element;
- no footer, public navigation, Rekap content, Invoice content, or quota logic changed.

- [x] **Step 3: Stop before runtime review**

Report that implementation and static checks are ready. Do not run a responsive sweep, accessibility test, visual regression, build, lint, or full test suite until the user explicitly requests runtime review.

- [ ] **Step 4: If runtime review is explicitly approved, inspect the required viewports**

Use the running authenticated app at:

```text
1440x900
1024x768
390x844
```

Review:

- `Sesi selesai` is the only primary summary item;
- secondary values remain readable and mobile currency does not overflow;
- the archive shows real previous-month data or the honest empty/error copy;
- `Buka rekap` opens the exact previous period;
- the roadmap copy has no link or control;
- the rail stacks at tablet and mobile widths;
- the compact footer remains below the rail;
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 5: Update review evidence and wait for screenshot approval**

When runtime review is requested, record viewport results, observed archive state, screenshot paths, console warnings, and deviations in `.superpowers/sdd/step-3a-report.md`. Do not stage or commit before the user approves the refreshed screenshots.

- [ ] **Step 6: Commit only after approval and only if Git writes are available**

Stage exactly:

```bash
rtk git add app/app/page.tsx app/app/home.module.css components/app-ui/types.ts components/app-ui/structure.tsx components/app-ui/app-ui.module.css docs/superpowers/specs/2026-07-13-beranda-archive-roadmap-rail-design.md docs/superpowers/plans/2026-07-13-beranda-archive-roadmap-rail.md
```

Review:

```bash
rtk git diff --cached --stat
rtk git diff --cached
```

Commit:

```bash
rtk git commit -m "feat: add home archive rail"
```

If the environment rejects `.git` writes, stop and report the blocker. Do not use an alternate index, filesystem workaround, or indirect commit path.
