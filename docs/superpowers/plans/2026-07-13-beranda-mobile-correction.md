# Beranda Mobile Correction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the Bookmark Fan overlap at narrow tablet widths, simplify mobile session rows to date, name, and duration, and reorganize the mobile previous-month archive into aligned key-value rows.

**Architecture:** Preserve the existing server-rendered Beranda and shared `DataRow` API. Add route-local spans in the existing session row props, style them through `home.module.css`, and add one narrow-tablet override to the shared Bookmark Fan CSS. Keep all data fetching, navigation, and desktop content unchanged.

**Tech Stack:** Next.js 16 App Router, React Server Components, TypeScript, CSS Modules, existing app-ui components, Chrome responsive viewport checks.

## Global Constraints

- Preserve the current paper-planner visual language, mint accent, typography, surface radius, and static interaction model.
- Use `DESIGN_VARIANCE: 5`, `MOTION_INTENSITY: 1`, and `VISUAL_DENSITY: 6` as the design calibration.
- Do not add a dependency, client state, animation, route, data request, or shared component variant.
- Keep `DataRow` props and shared row behavior unchanged outside Beranda.
- Keep data fetching, date formatting, session ordering, quota logic, archive parameters, and all empty or error states unchanged.
- Keep desktop and tablet session content unchanged.
- Keep the roadmap panel, navigation, footer, and public pages unchanged.
- The user explicitly approved responsive checks at `1101 x 900`, `1100 x 900`, `850 x 900`, `768 x 900`, `767 x 900`, and `390 x 844`.
- Under the repository development-test policy, do not run the automated test suite, build, lint, accessibility automation, or visual regression.
- Do not stage or commit without explicit git authorization.

## File Map

- `components/app-ui/app-ui.module.css`: owns only the narrow-tablet Bookmark Fan scale override.
- `app/app/page.tsx`: wraps existing recent-session values in route-local spans without changing the data or `DataRow` contract.
- `app/app/home.module.css`: owns Beranda-specific session visibility, name truncation, and mobile archive layout.
- `docs/superpowers/specs/2026-07-13-beranda-mobile-correction-design.md`: approved design contract; no further edits during implementation.
- `docs/superpowers/plans/2026-07-13-beranda-mobile-correction.md`: execution checklist and verification record.

---

### Task 1: Correct the Bookmark Fan at narrow tablet widths

**Files:**
- Modify: `components/app-ui/app-ui.module.css`

**Interfaces:**
- Consumes: the existing `.bookmarkFan` geometry and the `768px-1100px` tablet scale rule.
- Produces: a later cascade override that uses `.66` scale from `768px` through `850px` while preserving the existing transform origin.

- [x] **Step 1: Confirm the existing breakpoint order**

Run:

```bash
rtk rg -n -C 4 "bookmarkFan|@media \(max-width: 1100px\)|@media \(max-width: 767px\)" components/app-ui/app-ui.module.css
```

Expected: the `.86` tablet rule appears inside `@media (max-width: 1100px) and (min-width: 768px)`, followed later by the mobile block.

- [x] **Step 2: Add the narrow-tablet override**

Insert this block after the existing tablet media query and before `@media (max-width: 767px)`:

```css
@media (max-width: 850px) and (min-width: 768px) {
  .bookmarkFan { transform: scale(.66); }
}
```

Do not repeat `transform-origin`; the existing `.86` tablet rule continues to provide `right center`.

- [x] **Step 3: Verify the cascade statically**

Run:

```bash
rtk rg -n -C 4 "scale\(\.86\)|scale\(\.66\)|@media \(max-width: 850px\)" components/app-ui/app-ui.module.css
```

Expected: `.86` appears in the broad tablet block and `.66` appears later in the narrow-tablet block.

Do not run a runtime check until Task 4 so every responsive correction is reviewed together.

---

### Task 2: Simplify recent-session rows on mobile

**Files:**
- Modify: `app/app/page.tsx`
- Modify: `app/app/home.module.css`

**Interfaces:**
- Consumes: `DataRow` props `leading`, `title`, `metadata`, and `trailing`, all typed as `ReactNode`.
- Produces: route-local selectors `.sessionName`, `.sessionMetadata`, `.sessionAmount`, and `.sessionDuration`.

- [x] **Step 1: Wrap the four session content roles**

Replace the existing recent-session `DataRow` call in `app/app/page.tsx` with this complete block:

```tsx
<DataRow
  key={session.id}
  label={`${session.m}, ${session.d}, ${session.h} jam, ${session.t}`}
  tone="home"
  leading={(
    <time className={styles.sessionDate} dateTime={session.rawDate}>
      {session.d}
    </time>
  )}
  title={<span className={styles.sessionName}>{session.m}</span>}
  metadata={(
    <span className={styles.sessionMetadata}>
      {session.s === String.fromCharCode(8212) ? "Tanpa detail" : session.s} · {session.h} jam
    </span>
  )}
  trailing={(
    <>
      <span className={styles.sessionAmount}>{session.t}</span>
      <span className={styles.sessionDuration}>{session.h} jam</span>
    </>
  )}
/>
```

Do not change the `label`, data fields, fallback copy, key, tone, or `time` semantics.

- [x] **Step 2: Add default route-local session styles**

Directly after `.sessionDate` in `app/app/home.module.css`, add:

```css
.sessionName {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sessionMetadata,
.sessionAmount,
.sessionDuration {
  min-width: 0;
}

.sessionDuration {
  display: none;
}
```

This keeps desktop and tablet visuals equivalent to the existing presentation.

- [x] **Step 3: Add the mobile visibility switch**

Inside the existing `@media (max-width: 767px)` block in `app/app/home.module.css`, place these rules after `.sessionDate`:

```css
.workspace span:has(> .sessionMetadata),
.sessionAmount {
  display: none;
}

.sessionDuration {
  display: inline;
  color: var(--app-ink-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
```

The existing shared row grid already provides `auto minmax(0, 1fr) auto`, so do not change `DataRow` CSS or its API.

- [x] **Step 4: Verify route-local markup and selectors**

Run:

```bash
rtk rg -n -C 3 "sessionName|sessionMetadata|sessionAmount|sessionDuration" app/app/page.tsx app/app/home.module.css
```

Expected: every selector appears once in JSX, default CSS hides only duration, and mobile CSS hides metadata plus amount while showing duration.

---

### Task 3: Reorganize the mobile previous-month archive

**Files:**
- Modify: `app/app/home.module.css`

**Interfaces:**
- Consumes: existing `.railHeader`, `.archiveRail`, `.archiveMetrics`, and metric `dl` markup.
- Produces: a one-row mobile header and three stacked label-value metric rows without changing JSX.

- [x] **Step 1: Replace the mobile archive header rule**

Inside `@media (max-width: 767px)`, replace the current column header rule with:

```css
.archiveRail {
  gap: var(--space-5);
}

.railHeader {
  align-items: center;
  flex-direction: row;
  gap: var(--space-3);
}

.railHeader > div {
  min-width: 0;
}

.railHeader h2 {
  white-space: nowrap;
}

.railHeader > :last-child {
  flex: 0 0 auto;
}
```

Keep the existing header markup, action label, arrow, URL, and accessible name unchanged.

- [x] **Step 2: Replace the mobile `2 + 1` metric grid**

Remove the mobile `.archiveMetrics` two-column rule, the `nth-child(2)` reset, and the full-width last-child rule. Replace them with:

```css
.archiveMetrics {
  grid-template-columns: 1fr;
  gap: 0;
}

.archiveMetrics div {
  grid-column: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-top: 0;
  border-inline-end: 0;
  border-bottom: 1px solid var(--app-line);
}

.archiveMetrics div:last-child {
  border-bottom: 0;
}

.archiveMetrics dt {
  min-width: 0;
}

.archiveMetrics dd {
  margin: 0;
  text-align: end;
  white-space: nowrap;
}
```

Use `border-inline-end: 0` to reset the logical desktop divider. Do not change the desktop rule.

- [x] **Step 3: Verify the old mobile layout is gone**

Run:

```bash
rtk rg -n -C 5 "railHeader|archiveMetrics|nth-child\(2\)|grid-template-columns: repeat\(2" app/app/home.module.css
```

Expected: the mobile header uses `flex-direction: row`, the mobile archive uses one column, and no mobile `repeat(2, ...)` archive rule remains.

---

### Task 4: Run the approved responsive verification

**Files:**
- Modify: `docs/superpowers/plans/2026-07-13-beranda-mobile-correction.md`

**Interfaces:**
- Consumes: the completed CSS and JSX from Tasks 1-3 plus the already running authenticated `/app` preview.
- Produces: an execution record with static and responsive evidence.

- [x] **Step 1: Run static development-policy checks**

Run:

```bash
rtk git diff --check
rtk rg -n "^(<<<<<<<|=======|>>>>>>>)|[[:blank:]]+$" app/app/page.tsx app/app/home.module.css components/app-ui/app-ui.module.css
rtk rg -n -C 3 "scale\(\.66\)|sessionDuration|sessionAmount|archiveMetrics" app/app/page.tsx app/app/home.module.css components/app-ui/app-ui.module.css
```

Expected:

- `rtk git diff --check` exits `0`.
- The conflict-marker and trailing-whitespace scan exits `1` with no output.
- The focused selector scan exits `0` and shows every new selector in its intended breakpoint.

- [x] **Step 2: Check the six approved viewport sizes**

Use the browser viewport capability and the authenticated `http://localhost:3000/app` tab. Check these sizes in order:

```text
1101 x 900
1100 x 900
850 x 900
768 x 900
767 x 900
390 x 844
```

At every size, verify `document.documentElement.scrollWidth <= window.innerWidth`.

At `1101`, `1100`, and `850`, verify:

- desktop or tablet session metadata and amount remain visible;
- the archive retains its non-mobile layout;
- the Bookmark Fan remains inside the viewport and does not overlap the heading or description.

At `768`, verify:

- `.bookmarkFan` computes to `.66` scale;
- all three bookmarks remain visible;
- the fan does not overlap the heading or description.

At `767` and `390`, verify:

- `.bookmarkFan` computes to `display: none` and the slim mint marker remains visible;
- each recent-session row visibly contains only date, name, and duration;
- each row remains one line and long names truncate without hiding duration;
- `Arsip bulan lalu` plus the month remain left while `Buka rekap` remains right on one header row;
- archive metrics render as three rows with labels left and values right;
- the roadmap panel remains below the archive.

- [x] **Step 3: Reset the viewport and record evidence**

Reset the browser viewport override before finalizing the browser session. Append the measured results and any screenshots reviewed to an `## Execution Record` section in this plan.

State explicitly that the automated test suite, build, lint, accessibility automation, and visual regression were not run. State that nothing was staged or committed.

Do not claim merge readiness because the repository integration test gate has not run.

## Execution Record

Executed on 2026-07-13 against the authenticated `http://localhost:3000/app` Chrome tab.

### Static development-policy checks

- `rtk git diff --check`: exit `0`, no findings.
- `rtk rg -n "^(<<<<<<<|=======|>>>>>>>)|[[:blank:]]+$" app/app/page.tsx app/app/home.module.css components/app-ui/app-ui.module.css`: exit `1`, no output, as expected for no matches.
- `rtk rg -n -C 3 "scale\(\.66\)|sessionDuration|sessionAmount|archiveMetrics" app/app/page.tsx app/app/home.module.css components/app-ui/app-ui.module.css`: exit `0`; the narrow-tablet `.66` fan rule, route-local amount/duration markup and visibility rules, and desktop/mobile archive metric rules were all present in their intended locations.

### Responsive measurements

All sizes were checked in the approved order. Each root `scrollWidth` was less than or equal to `window.innerWidth`.

| Viewport | Root width check | Bookmark Fan / marker | Sessions | Archive and roadmap |
| --- | --- | --- | --- | --- |
| `1101 x 900` | `1086 <= 1101` | `scale 1`; 3 bookmarks; visible union `x 694.23-939.77`, `y 41.27-153.73`; inside viewport; no title/description overlap | Metadata and amount visible for all 3 rows; duration hidden | Non-mobile metrics remained 3 horizontal columns (`185.773px 185.773px 185.781px`) |
| `1100 x 900` | `1085 <= 1100` | `scale .86`; 3 bookmarks; visible union `x 763.52-974.68`, `y 49.14-145.86`; inside viewport; no title/description overlap | Metadata and amount visible for all 3 rows; duration hidden | Non-mobile metrics remained 3 horizontal `313px` columns |
| `850 x 900` | `835 <= 850` | `scale .66`; 3 bookmarks; visible union `x 612.32-774.38`, `y 60.39-134.61`; inside viewport; no title/description overlap | Metadata and amount visible for all 3 rows; duration hidden | Non-mobile metrics remained 3 horizontal columns (`229.664px 229.664px 229.672px`) |
| `768 x 900` | `753 <= 768` | computed transform `matrix(0.66, 0, 0, 0.66, 0, 0)`; 3 bookmarks; visible union `x 545.50-707.55`, `y 60.39-134.61`; inside viewport; no title/description overlap | Tablet content unchanged | Non-mobile metrics remained 3 horizontal columns (`202.328px 202.336px 202.328px`) |
| `767 x 900` | `752 <= 767` | fan `display: none`; mint marker visible at `x 727-740`, `y 27.5-77.5` (`13 x 50`) | Only date, name, duration visible; metadata and amount `display: none`; all rows `52px` high with `0px` center delta | Header copy/action centers both `y 824.75`; metric rows `y 863-906`, `906-949`, `949-991`, labels left and values right; roadmap top `1011` equals archive bottom `1011` |
| `390 x 844` | `375 <= 390` | fan `display: none`; mint marker visible at `x 350-363`, `y 27.5-77.5` (`13 x 50`) | Only date, name, duration visible; metadata and amount `display: none`; all rows `52px` high with `0px` center delta | Header copy/action centers both `y 865.75`; metric rows `y 904-947`, `947-990`, `990-1032`, labels left and values right; roadmap top `1052` equals archive bottom `1052` |

At `767` and `390`, the current names did not exceed their available widths. The `.sessionName` elements nevertheless computed to `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap`; their widths were `563/574/563px` at `767` and `186/197/186px` at `390`. Duration remained visible at the right edge in every row.

Viewport screenshots were reviewed at all six sizes. A full-page `390 x 844` screenshot was also reviewed to confirm the archive and roadmap sequence. No screenshot files were saved to the workspace.

The viewport override was reset before the Chrome tab was released. The automated test suite, build, lint, accessibility automation, and visual regression were not run. Nothing was staged or committed. Merge readiness is not claimed because the repository integration test gate has not run.

### Final review follow-up

The final-review accessibility and fractional-breakpoint findings were addressed route-locally. Each static session row now exposes one visually hidden complete session summary while its duplicate visual nodes are `aria-hidden`; shared `DataRow` behavior is unchanged. Both mobile blocks now use `@media (width < 768px)`.

Focused browser checks at `768 x 900`, `767 x 900`, and `390 x 844` passed with no horizontal overflow. At `768`, the fan remained visible at `.66` scale without header overlap. At `767` and `390`, the fan was hidden, the mint marker remained visible, session rows showed only date/name/duration in one line, and archive metrics remained three ordered label/value rows above the roadmap. Full evidence is recorded in `.superpowers/sdd/mobile-correction-final-fix-report.md`.

The live names were still too short to exercise actual overflow, so only the computed ellipsis mechanics were confirmed without mutating real data. The viewport was reset afterward. No test suite, build, lint, accessibility automation, visual regression, staging, or commit was performed.
