# Beranda Visual Corrections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Correct Beranda alignment, strengthen the monthly summary, keep the footer compact, and simplify the protected top navigation to one underline active state.

**Architecture:** Keep protected data and behavior in `app/app/page.tsx`. Change only route composition and scoped CSS. The protected shell remains the viewport owner, `RouteCanvas` absorbs unused short-page height, and the footer stays at its intrinsic height.

**Tech Stack:** Next.js 16, React 19, CSS Modules, protected-app semantic tokens, Phosphor icons.

## Global Constraints

- Preserve all routes, queries, quota logic, links, labels, accessible names, analytics hooks, and real protected data.
- Do not add metrics, cards, dummy data, dependencies, or another contextual action.
- Keep the protected light paper theme, Courier Prime title and value roles, Source Serif 4 body roles, existing radii, and existing focus treatment.
- Do not migrate Rekap or Invoice content.
- During development run only `rtk git diff --check` and `rtk node scripts/audit-protected-app-system.mjs`.
- Do not run build, lint, automated accessibility, responsive sweep, or visual regression.
- Do not stage or commit before screenshot approval.

---

### Task 1: Align the Beranda session row

**Files:**
- Modify: `app/app/page.tsx`
- Modify: `app/app/home.module.css`
- Modify: `components/app-ui/app-ui.module.css`

**Interfaces:**
- Consumes: existing `Section`, `SectionHeading`, `Surface`, `DataRow`, and `Button` APIs.
- Produces: one heading row constrained to the session column and one content row containing the session surface and contextual aside.

- [x] **Step 1: Restructure the session section**

Move `Section` outside the two-column content grid. Add a `workspaceHeading` wrapper around `SectionHeading`, followed by `workspace` containing the current error or session `Surface` and `workspaceAside`.

```tsx
<Section labelledBy="recent-sessions-title">
  <div className={styles.workspaceHeading}>
    <SectionHeading
      headingId="recent-sessions-title"
      title="Sesi terbaru"
      description="Tiga sesi terakhir yang tercatat dari aplikasi."
      action={(
        <Button
          href="/app/rekap"
          variant="quiet"
          size="compact"
          trailingIcon={<ArrowRight aria-hidden="true" />}
        >
          Lihat semua
        </Button>
      )}
    />
  </div>
  <div className={styles.workspace}>
    {recentLoadError ? (
      <ErrorState
        scope="section"
        title="Sesi terbaru belum dapat dimuat"
        body="Ringkasan bulan ini tetap dapat digunakan."
      />
    ) : (
      <Surface padding="none" labelledBy="recent-sessions-title">
        {recentSessions.map((session) => (
          <DataRow
            key={session.id}
            label={`${session.m}, ${session.d}, ${session.h} jam, ${session.t}`}
            tone="home"
            leading={(
              <time className={styles.sessionDate} dateTime={session.rawDate}>
                {session.d}
              </time>
            )}
            title={session.m}
            metadata={`${session.s === String.fromCharCode(8212) ? "Tanpa detail" : session.s} · ${session.h} jam`}
            trailing={session.t}
          />
        ))}
      </Surface>
    )}
    <aside className={styles.workspaceAside} aria-label="Langkah berikutnya">
      <Surface
        as="section"
        variant="contextual"
        padding="compact"
        tone="home"
        labelledBy="home-next-action-title"
      >
        <div className={styles.contextualAction}>
          <span className={styles.contextualIcon} aria-hidden="true">
            <CalendarBlank size={20} />
          </span>
          <div className={styles.contextualCopy}>
            <h2 id="home-next-action-title">Buka rekap bulan ini</h2>
            <p>Periksa sesi, jam, dan pendapatan sebelum membuat invoice.</p>
          </div>
          <div className={styles.contextualButton}>
            <Button
              href={`/app/rekap?from=${period.from}&to=${period.to}`}
              size="compact"
              trailingIcon={<ArrowRight aria-hidden="true" />}
            >
              Buka rekap
            </Button>
          </div>
        </div>
      </Surface>
      {!isPaid && quota ? <HomeUpgradePrompt exhausted={freeQuotaExhausted} /> : null}
    </aside>
  </div>
</Section>
```

- [x] **Step 2: Give heading and content matching tracks**

Use identical track definitions for `workspaceHeading` and `workspace`, with the heading restricted to column one.

```css
.workspace,
.workspaceHeading {
  display: grid;
  grid-template-columns: minmax(0, 1.42fr) minmax(300px, .78fr);
  gap: var(--space-8);
}

.workspace { align-items: start; }
.workspaceHeading > * { grid-column: 1; }
```

Repeat the existing tablet track values for both selectors and collapse both to one column below 768px.

- [x] **Step 3: Align the mobile quiet action**

Inside the existing mobile media query in `app-ui.module.css`, remove horizontal inset only from quiet buttons used as `SectionHeading` actions.

```css
.sectionHeadingAction .buttonVariantQuiet { padding-inline: var(--space-0); }
```

The inherited compact control keeps its 44px minimum height and focus ring.

### Task 2: Strengthen the home summary band

**Files:**
- Modify: `components/app-ui/app-ui.module.css`

**Interfaces:**
- Consumes: existing `SummaryBand tone="home"` and semantic home tokens.
- Produces: a home-only highlighted summary without changing Recap or Invoice summary treatments.

- [x] **Step 1: Add the desktop and tablet home treatment**

```css
.summaryBand.toneHome {
  background: color-mix(in srgb, var(--app-home-accent) 54%, var(--app-paper));
}

.summaryDensityDefault.toneHome .summaryItem {
  display: grid;
  min-height: 116px;
  align-content: center;
}

.summaryDensityDefault.toneHome .summaryItem strong {
  font-size: 30px;
  line-height: 36px;
}
```

Use 104px minimum height in the existing tablet media query.

- [x] **Step 2: Preserve compact mobile hierarchy**

In the mobile media query, set home summary items back to natural height with 16px block padding and keep home values at 22px.

```css
.summaryDensityDefault.toneHome .summaryItem {
  min-height: 0;
  padding: var(--space-5) var(--space-6);
}

.summaryDensityDefault.toneHome .summaryItem strong {
  font-size: 22px;
  line-height: 27px;
}
```

### Task 3: Keep the footer compact at the end of the route canvas

**Files:**
- Modify: `components/app-ui/app-ui.module.css`
- Modify: `css/tutorlog-web.css`
- Modify: `css/site.css`

**Interfaces:**
- Consumes: `.app-shell-h` as the single viewport-height owner and the existing footer markup.
- Produces: a flexible route canvas plus a full-width footer that does not grow when the route is shorter than the viewport.

- [x] **Step 1: Let the route canvas own the flexible remainder**

Keep `min-height: 0`, add `flex: 1 0 auto`, and retain the route canvas isolation, background, and overflow declarations.

- [x] **Step 2: Make the footer a full-width closing field**

Replace the constrained transparent footer box with an intrinsic-height shell item.

```css
.app-shell-footer {
  flex: 0 0 auto;
  width: 100%;
  margin: 0;
  padding: 18px max(40px, calc((100% - 1280px) / 2));
  box-sizing: border-box;
  border-top: 1px solid var(--app-line);
  background: color-mix(in srgb, var(--app-mint) 64%, var(--app-paper));
}
```

Keep the existing footer text, links, hover behavior, and row alignment.

- [x] **Step 3: Preserve the mobile bottom-navigation clearance**

Update the mobile override in `site.css` to keep the footer in one row and clear the fixed navigation without the earlier oversized field.

```css
.app-shell-footer {
  width: 100%;
  padding: 18px 20px calc(80px + env(safe-area-inset-bottom));
  gap: 16px;
  text-align: left;
}
```

### Task 4: Use underline-only desktop app navigation

**Files:**
- Modify: `components/app-ui/app-ui.module.css`
- Modify: `css/tutorlog-web.css`

- [x] **Step 1: Remove the top-navigation pill and active fill**

Remove the border, rounded container, and translucent background from `.app-topbar-nav`. Limit the active icon background to `.navigationBottom`.

- [x] **Step 2: Keep one clear active indicator**

Use a centered route-accent underline up to 48px wide for `.navigationTop`. Preserve the current focus ring and keep the public `/` navigation unchanged.

### Task 5: Static and runtime verification

**Files:**
- Modify: `.superpowers/sdd/step-3a-report.md`
- Refresh: `live-screenshots/step-3a/beranda-1440x900.png`
- Refresh: `live-screenshots/step-3a/beranda-1024x768.png`
- Refresh: `live-screenshots/step-3a/beranda-390x844.png`
- Refresh: `live-screenshots/step-3a/beranda-390x844-bottom.png`

- [x] **Step 1: Run permitted static checks**

Run:

```bash
rtk git diff --check
rtk node scripts/audit-protected-app-system.mjs
```

Expected: no diff errors and the foundation audit prints inventory, token, radius, size, focus, boundary, and hygiene summaries without failures.

- [x] **Step 2: Review the running authenticated route**

Use the existing local server and authenticated browser session. Review 1440x900, 1024x768, and 390x844. Confirm:

- session-table and contextual-card top borders align at desktop and tablet;
- mobile `Lihat semua` starts on the section-copy line;
- summary band is visibly stronger without becoming three cards;
- footer starts after route content, remains full width, and clears the mobile tab bar;
- `documentWidth === clientWidth` at every viewport.

- [x] **Step 3: Refresh the report and stop for approval**

Record the changed selectors, runtime states, viewport results, screenshot paths, and any pre-existing console warning in `.superpowers/sdd/step-3a-report.md`. Do not update milestone completion or commit until the user approves the refreshed screenshots.
