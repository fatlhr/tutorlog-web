# Route-aware Loading Layouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deliberate vertical space to the Beranda hero and make Beranda, Rekap, and Invoice loading states follow their final screen layouts without covering route decorations.

**Architecture:** Keep the existing shared `LoadingState` API unchanged. Add protected-route-only skeleton helpers and CSS under `app/app`, then compose them differently in each route loading file. Beranda owns its hero spacing through `home.module.css` so other routes keep the shared `PageMain` gap.

**Tech Stack:** Next.js 16 App Router, React 19, CSS Modules, Node contract tests, Chrome runtime QA.

## Global Constraints

- Preserve business logic, data fetching, route hierarchy, Invoice form behavior, and PDF output.
- Use 48px between Beranda header and summary on desktop/tablet, and 28px on mobile.
- Keep route decorations visible and unobstructed by loading panels.
- Do not change the shared `LoadingState` public API.
- Do not commit, merge, push, or create a PR without explicit approval.

---

### Task 1: Contract and Beranda hero spacing

**Files:**
- Create: `scripts/test-route-loading-layout-contract.mjs`
- Modify: `app/app/page.tsx`
- Modify: `app/app/home.module.css`

**Interfaces:**
- Produces: `homeStyles.hero` used by both the final Beranda page and its loading route.

- [x] **Step 1: Write a failing source contract**

Require `page.tsx` to wrap `PageHeader` and the summary/error state in `styles.hero`. Require `.hero` to use a 48px gap and its mobile rule to use 28px.

- [x] **Step 2: Run the contract and confirm RED**

Run: `rtk node scripts/test-route-loading-layout-contract.mjs`

Expected: failure because `styles.hero` and route-aware loading helpers do not exist.

- [x] **Step 3: Implement the Beranda hero wrapper**

Wrap the header and summary branch in `<div className={styles.hero}>`. Add:

```css
.hero {
  display: grid;
  gap: 48px;
}

@media (width < 768px) {
  .hero { gap: 28px; }
}
```

### Task 2: Route-aware loading helpers and screen compositions

**Files:**
- Create: `app/app/route-loading.tsx`
- Create: `app/app/route-loading.module.css`
- Modify: `app/app/loading.tsx`
- Modify: `app/app/rekap/loading.tsx`
- Modify: `app/app/invoice/loading.tsx`
- Test: `scripts/test-route-loading-layout-contract.mjs`

**Interfaces:**
- Produces: `LoadingPageHeader({ label, actions })` and `LoadingSectionHeading({ label, action })`.
- Consumes: existing `LoadingState`, `RouteCanvas`, `PageMain`, and `homeStyles.hero/workspace/workspaceAside`.

- [x] **Step 1: Extend the failing contract**

Require all three loading routes to use `LoadingPageHeader`; Beranda must use `homeStyles.hero`, Rekap must declare two actions plus desktop/mobile filter placeholders, and Invoice must declare one action plus desktop and mobile-handoff layouts.

- [x] **Step 2: Add protected-route loading helpers**

Create semantic `role="status"` header and section-heading skeletons with route-local bars. Header copy is capped at 560px; optional action placeholders sit on the right. All decorative spans remain `aria-hidden`.

- [x] **Step 3: Compose each route**

- Beranda: constrained loading header, three-column summary, workspace rows/sidebar, and closing rail.
- Rekap: header with two actions, desktop filters/mobile trigger, compact summary, section heading, and rows.
- Invoice: header with one action, desktop form/preview, tablet form-only, and mobile handoff skeleton.

- [x] **Step 4: Add responsive CSS**

- At `<1200px`, hide Invoice preview and center the form skeleton.
- At `<768px`, stack Beranda workspace, switch Rekap to its filter trigger, hide desktop Invoice loading, and show the mobile handoff skeleton.

- [x] **Step 5: Run focused contract and confirm GREEN**

Run: `rtk node scripts/test-route-loading-layout-contract.mjs`

Expected: `route loading layout contract passed`.

### Task 3: Runtime and repository verification

**Files:**
- Verify only; no new application files.

**Interfaces:**
- Consumes the three loading routes and the final Beranda hero.

- [x] **Step 1: Verify Chrome desktop**

Use client navigation to capture loading states for `/app`, `/app/rekap`, and `/app/invoice`. Confirm the Beranda decoration is not covered and final header-to-summary gap is 48px.

- [x] **Step 2: Verify responsive layouts**

Check 1024px for all routes and a mobile viewport for the Invoice handoff skeleton.

- [x] **Step 3: Run final checks**

Run `rtk node scripts/test-route-loading-layout-contract.mjs`, `rtk git diff --check`, and `rtk git status --short --branch`. Review only scoped files and leave unrelated user changes untouched.
