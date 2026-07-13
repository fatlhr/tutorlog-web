# Beranda Bookmark Fan Decoration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Beranda timetable decoration with the approved three-piece Bookmark Fan while preserving the existing hero, data, and mobile route marker.

**Architecture:** Keep the decoration route-local inside `RouteCanvas`. Replace only the home decoration markup and its CSS-module rules, using the installed Phosphor SSR icons and existing protected-app tokens. Remove the obsolete timetable markup and selectors so Beranda has one decoration implementation.

**Tech Stack:** Next.js 16 App Router, React Server Components, TypeScript, CSS Modules, `@phosphor-icons/react/dist/ssr`.

## Global Constraints

- Use the approved mint, coral, lilac, paper, and green-ink tokens already defined in `components/app-ui/app-ui.module.css`.
- Do not add a dependency, route, data field, client state, visible label, fake data, animation, gradient, glow, or hand-drawn SVG path.
- Keep the decoration `aria-hidden="true"` and `pointer-events: none`.
- Desktop and tablet show the full bookmark fan. Mobile below 768px keeps only the existing slim mint edge marker.
- Do not change Beranda copy, summary, session rows, archive rail, navigation, footer, or public pages.
- Under the repository development-test policy, do not run automated tests, a responsive sweep, accessibility testing, or visual regression unless the user explicitly requests it. Default verification is `rtk git diff --check` plus focused source inspection.

## File Map

- `components/app-ui/route-canvas.tsx`: owns the route decoration selection and Bookmark Fan semantic-free markup.
- `components/app-ui/app-ui.module.css`: owns bookmark geometry, color, positioning, tablet scaling, and the mobile hide rule.
- `docs/superpowers/specs/2026-07-13-beranda-bookmark-fan-decoration-design.md`: approved design contract; no implementation edits beyond its approved status.
- `docs/superpowers/plans/2026-07-13-beranda-bookmark-fan-decoration.md`: execution checklist and verification record.

---

### Task 1: Replace the Beranda decoration with Bookmark Fan

**Files:**
- Modify: `components/app-ui/route-canvas.tsx`
- Modify: `components/app-ui/app-ui.module.css`

**Interfaces:**
- Consumes: `AppRoute`, the existing `RouteDecoration({ route })` switch, protected-app CSS tokens, and installed Phosphor SSR icons.
- Produces: route-local `BookmarkFanDecoration(): JSX.Element` and CSS-module selectors `.bookmarkFan`, `.bookmark`, `.bookmarkMint`, `.bookmarkCoral`, and `.bookmarkLilac`.

- [x] **Step 1: Replace the timetable markup with the bookmark composition**

Add the installed icons at the top of `components/app-ui/route-canvas.tsx`:

```tsx
import {
  BookOpen,
  Clock,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
```

Keep the home route branch named and isolated:

```tsx
function RouteDecoration({ route }: { route: AppRoute }) {
  if (route === "home") {
    return <BookmarkFanDecoration />;
  }

  if (route === "recap") {
    return (
      <div className={`${styles.routeDecoration} ${styles.recapDecoration}`} aria-hidden="true">
        <span className={styles.periodMarker} />
      </div>
    );
  }

  return (
    <div className={`${styles.routeDecoration} ${styles.invoiceDecoration}`} aria-hidden="true">
      <span className={styles.documentTab} />
      <span className={`${styles.cropMark} ${styles.cropMarkStart}`} />
      <span className={`${styles.cropMark} ${styles.cropMarkEnd}`} />
    </div>
  );
}
```

Replace `TutorPlannerCanvas` with this complete route-local component:

```tsx
function BookmarkFanDecoration() {
  return (
    <div className={`${styles.routeDecoration} ${styles.homeDecoration}`} aria-hidden="true">
      <div className={styles.bookmarkFan}>
        <span className={`${styles.bookmark} ${styles.bookmarkMint}`}>
          <BookOpen size={32} weight="duotone" />
        </span>
        <span className={`${styles.bookmark} ${styles.bookmarkCoral}`}>
          <Clock size={32} weight="duotone" />
        </span>
        <span className={`${styles.bookmark} ${styles.bookmarkLilac}`}>
          <FileText size={32} weight="duotone" />
        </span>
      </div>
    </div>
  );
}
```

- [x] **Step 2: Replace timetable CSS with Bookmark Fan geometry**

Keep `.routeDecoration` unchanged. Replace the existing `.homeDecoration`, planner-board, planner-day, planner-line, paper-tab, and schedule-block rules with:

```css
.homeDecoration {
  --tone-ink: var(--app-home-accent-ink);
  top: 88px;
  right: max(64px, calc((100vw - 1200px) / 2 + 64px));
  display: grid;
  width: min(38vw, 410px);
  height: 124px;
  place-items: center;
}

.bookmarkFan {
  position: relative;
  width: 280px;
  height: 116px;
  filter: drop-shadow(0 10px 14px color-mix(in srgb, var(--app-home-accent-ink) 8%, transparent));
}

.bookmark {
  --bookmark-fill: var(--app-home-accent);
  position: absolute;
  top: 4px;
  display: grid;
  width: 88px;
  height: 108px;
  place-items: center;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%);
  color: var(--app-home-accent-ink);
  background: color-mix(in srgb, var(--app-home-accent-ink) 18%, transparent);
}

.bookmark::before {
  position: absolute;
  inset: 1px;
  clip-path: inherit;
  background: var(--bookmark-fill);
  content: "";
}

.bookmark svg {
  position: relative;
  z-index: 1;
}

.bookmarkMint {
  left: 20px;
  z-index: 1;
  transform: rotate(-3deg);
}

.bookmarkCoral {
  --bookmark-fill: #fce1d9;
  left: 96px;
  z-index: 2;
}

.bookmarkLilac {
  --bookmark-fill: var(--app-recap-accent);
  left: 172px;
  z-index: 1;
  transform: rotate(3deg);
}
```

Use the approved prototype coral `#fce1d9` directly in `.bookmarkCoral`. The CSS module has no existing coral token, and this route-local decoration does not warrant a new global token.

- [x] **Step 3: Preserve tablet scaling and mobile route marker**

Inside `@media (max-width: 1100px) and (min-width: 768px)`, keep the route placement and add the scale rule:

```css
.homeDecoration {
  top: 88px;
  right: 32px;
  width: 37vw;
}

.bookmarkFan {
  transform: scale(.86);
  transform-origin: right center;
}
```

Inside `@media (max-width: 767px)`, preserve the existing `.homeDecoration` marker declaration and replace the old child-hide selector with:

```css
.homeDecoration .bookmarkFan {
  display: none;
}
```

- [x] **Step 4: Remove the obsolete timetable implementation**

Confirm that these names no longer occur in the two implementation files:

```text
TutorPlannerCanvas
plannerBoard
plannerDays
plannerLines
paperTab
scheduleBlock
scheduleBlockOne
scheduleBlockTwo
```

Run:

```bash
rtk rg -n "TutorPlannerCanvas|plannerBoard|plannerDays|plannerLines|paperTab|scheduleBlock" components/app-ui/route-canvas.tsx components/app-ui/app-ui.module.css
```

Expected: exit code 1 with no matches.

- [x] **Step 5: Run development-policy verification**

Run:

```bash
rtk git diff --check
rtk rg -n -C 3 "BookmarkFanDecoration|bookmarkFan|bookmarkMint|bookmarkCoral|bookmarkLilac" components/app-ui/route-canvas.tsx components/app-ui/app-ui.module.css
rtk rg -n "[[:blank:]]+$|^(<<<<<<<|=======|>>>>>>>)" components/app-ui/route-canvas.tsx components/app-ui/app-ui.module.css
```

Expected:

- `rtk git diff --check` exits 0 with no whitespace errors.
- Bookmark Fan selectors appear in both markup and CSS.
- The trailing-whitespace and conflict-marker scan exits 1 with no matches.

- [x] **Step 6: Record verification without running unapproved suites**

Append the exact verification evidence to this plan after execution. State explicitly that automated tests, responsive sweep, accessibility tests, visual regression, and build were not run unless the user separately authorizes them.

Do not stage or commit during this task unless the user explicitly requests a git action.

## Execution Record

The four authorized static verification commands produced these results:

```bash
rtk rg -n "TutorPlannerCanvas|plannerBoard|plannerDays|plannerLines|paperTab|scheduleBlock" components/app-ui/route-canvas.tsx components/app-ui/app-ui.module.css
```

Exited `1` with no output; no obsolete timetable names were found.

```bash
rtk git diff --check
```

Exited `0` with no whitespace errors.

```bash
rtk rg -n -C 3 "BookmarkFanDecoration|bookmarkFan|bookmarkMint|bookmarkCoral|bookmarkLilac" components/app-ui/route-canvas.tsx components/app-ui/app-ui.module.css
```

Exited `0`; Bookmark Fan markup, selectors, tablet scaling, and the mobile hide rule were present.

```bash
rtk rg -n "[[:blank:]]+$|^(<<<<<<<|=======|>>>>>>>)" components/app-ui/route-canvas.tsx components/app-ui/app-ui.module.css
```

Exited `1` with no output; no trailing whitespace or conflict markers were found.

Automated tests, the full test suite, build, lint, responsive sweep, accessibility tests, and visual regression tests were not run. Nothing was staged or committed.
