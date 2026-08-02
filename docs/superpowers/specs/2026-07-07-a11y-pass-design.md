# Design: A11y Pass — Accessibility Improvements

> **Date:** 2026-07-07
> **Phase:** 7 — QA & Ship
> **Task:** 7.3 A11y pass — focus-visible, aria, alt text, prefers-reduced-motion
> **Status:** Done

## Goal

Make all routes navigable via keyboard-only, add proper ARIA attributes, and set up automated accessibility testing with axe-core.

## Current State

| Category | Status |
|----------|--------|
| `lang="id"` | ✅ Done |
| Global `:focus-visible` ring | ✅ Done |
| `prefers-reduced-motion` | ✅ Done |
| Dialog semantics (Paywall, Invoice) | ✅ Partial (2/3) |
| `aria-expanded`/`aria-haspopup` | ✅ Done (4 components) |
| `aria-label` on hamburger | ✅ Done |
| Decorative images `alt=""` | ✅ Done |
| Native interactive elements | ✅ Done |
| `<label>` on inputs | ⚠️ Rendered but not linked |
| Skip navigation link | ❌ Missing |
| `<main>` landmark | ❌ Missing |
| Focus trapping in dialogs | ❌ Missing |
| `aria-live` regions | ❌ Missing |
| Error association (`aria-describedby`) | ❌ Missing |
| Keyboard dropdown navigation | ❌ Missing |
| `eslint-plugin-jsx-a11y` | ❌ Missing |
| axe-core testing | ❌ Missing |

## Scope

### Fixes (7 items)

1. **Skip navigation link** — `<a href="#main-content" class="skip-link">Skip to content</a>` in root layout
2. **`<main>` landmark** — Wrap page content in `<main id="main-content">` in root layout
3. **Focus trapping in dialogs** — Add focus trap to `PaywallDialog` and invoice preview dialog
4. **`aria-live` regions** — Add `aria-live="polite"` to dynamic content areas (form submissions, state changes)
5. **Error association** — Link `<input>` to error message via `id` + `aria-describedby` in `Input.tsx`
6. **Keyboard dropdown navigation** — Add Escape key handler to `AppTopBar` and `TabBar` dropdowns
7. **SVG icon cleanup** — Add `aria-hidden="true"` and `focusable="false"` to decorative SVG icons

### Testing (2 items)

8. **Install `@axe-core/playwright`** — Automated a11y testing
9. **Create a11y test suite** — Test all routes for WCAG 2.1 AA violations

## Approach

### Fix Implementation Order

1. Root layout changes (skip nav + `<main>` landmark) — affects all pages
2. `Input.tsx` — error association (reusable component)
3. `Modal.tsx` — dialog semantics + focus trapping
4. `PaywallDialog.tsx` — focus trapping
5. `AppTopBar.tsx` + `TabBar.tsx` — keyboard navigation
6. SVG icons — `aria-hidden` across components
7. `aria-live` regions — dynamic content

### Testing Strategy

- **axe-core** with Playwright — automated WCAG 2.1 AA checks
- **Keyboard navigation test** — manual-style automated test (Tab through all interactive elements)
- Run on all 13 routes

## File Structure

```
tests/
  a11y.spec.ts              # axe-core + keyboard tests
components/
  SkipLink.tsx              # Skip to content component
app/
  layout.tsx                # Add skip nav + <main> landmark
  globals.css               # Add skip-link styles
components/
  Input.tsx                 # Add id + aria-describedby
  Modal.tsx                 # Add dialog semantics + focus trap
  PaywallDialog.tsx         # Add focus trap
  AppTopBar.tsx             # Add Escape key handler
  TabBar.tsx                # Add Escape key handler
```

## Pass/Fail Criteria

- axe-core: **0 violations** on all routes
- Keyboard: All interactive elements reachable via Tab
- Focus visible: All focused elements have visible outline

## DoD Alignment

This design satisfies TASKS.md Phase 7.3:
- ✅ focus-visible (already exists, verified)
- ✅ aria (dialog semantics, aria-live, aria-describedby)
- ✅ alt text (already exists, verified)
- ✅ prefers-reduced-motion (already exists, verified)
- ✅ Keyboard-only bisa navigasi semua halaman (skip nav, focus trap, Escape key)
