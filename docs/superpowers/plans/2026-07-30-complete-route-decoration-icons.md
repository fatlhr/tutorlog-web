# Complete Route Decoration Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the partial right-side Rekap and Invoice ornaments with complete calendar and document badges that cannot read as cropped fragments.

**Architecture:** Keep `RouteCanvas` as the single owner of decorative route visuals. Render one semantic-free Phosphor icon per route and style both through a shared closed badge treatment; retain the existing grid and ruled-paper route backgrounds.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Phosphor Icons, Node contract tests, Chrome runtime QA.

## Global Constraints

- Preserve route behavior, page hierarchy, data mapping, forms, Invoice preview, and PDF output.
- Keep all decoration `aria-hidden` and outside operational content surfaces.
- Show the floating badge only at desktop widths of 1280px or wider.
- Do not commit, merge, push, or create a PR without explicit user approval.

---

### Task 1: Complete Rekap and Invoice route badges

**Files:**
- Modify: `scripts/test-route-decoration-layering-contract.mjs`
- Modify: `components/app-ui/route-canvas.tsx`
- Modify: `components/app-ui/app-ui.module.css`

**Interfaces:**
- Consumes: `RouteCanvas` route values `recap` and `invoice`, Phosphor `CalendarDots` and `FileText` SSR icons.
- Produces: one complete `routeBadge` visual per supported route, with the existing route decoration remaining `aria-hidden`.

- [x] **Step 1: Write the failing contract**

Update the contract to require `CalendarDots` and `FileText` route icons, a shared 64px closed badge, desktop outer-gutter positioning, and removal of `periodMarker`, `documentTab`, and `cropMark`.

- [x] **Step 2: Run the contract and confirm the expected failure**

Run: `rtk node scripts/test-route-decoration-layering-contract.mjs`

Expected: FAIL because the current JSX still renders the partial marker, tab, and crop-mark spans.

- [x] **Step 3: Render complete route icons**

Import `CalendarDots` from `@phosphor-icons/react/dist/ssr`. Render `CalendarDots` for Rekap and the existing `FileText` for Invoice, both inside `routeDecoration routeBadge` wrappers with `size={30}` and `weight="duotone"`.

- [x] **Step 4: Replace fragment CSS with a closed badge**

Create a shared `.routeBadge` rule with `display: grid`, `width: 64px`, `height: 64px`, centered content, a complete one-pixel border, and `border-radius: var(--radius-control)`. Give Rekap and Invoice their existing route accent colors and place them in the desktop outer gutter with `right: max(var(--space-8), calc((100vw - 1200px) / 2 - 80px))`. Hide both decorations below 1280px.

- [x] **Step 5: Run the focused contract**

Run: `rtk node scripts/test-route-decoration-layering-contract.mjs`

Expected: `route decoration contract passed`.

- [x] **Step 6: Verify in Chrome**

Open `/app/rekap` and `/app/invoice` in the authenticated Chrome session at the default desktop viewport. Capture screenshots and confirm each right-side visual is a fully bordered icon badge, remains outside the page content, and does not appear on a 1024px tablet viewport.

- [x] **Step 7: Run final repository checks**

Run: `rtk git diff --check`

Expected: exit code 0 with no whitespace errors. Review `git status --short --branch` and keep unrelated user changes untouched.
