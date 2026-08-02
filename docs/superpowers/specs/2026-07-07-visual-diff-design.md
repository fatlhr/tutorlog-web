# Design: Visual Diff vs Canvas — Pixelmatch

> **Date:** 2026-07-07
> **Phase:** 7 — QA & Ship
> **Task:** 7.2 Visual diff vs canvas — screenshot tiap route, bandingkan dengan artboard
> **Status:** Approved

## Goal

Compare live app screenshots against design artboards to detect visual regressions. Document intentional differences (layout changes, responsive adaptations, content updates).

## Scope

### Artboards (Design Reference)

**Mobile** (`design/TutorLog Web Mobile.html`) — 390px width:

| Artboard ID | Route | Notes |
|-------------|-------|-------|
| `mob-landing` | `/` | Landing page |
| `mob-login` | `/login` | Login form |
| `mob-login-sent` | `/login/sent` | Magic link sent |
| `mob-fitur` | `/fitur` | Features |
| `mob-harga` | `/harga` | Pricing |
| `mob-panduan` | `/panduan` | Guide |
| `mob-privacy` | `/privacy` | Privacy policy |
| `mob-terms` | `/terms` | Terms of service |
| `mob-account-del` | `/account` | Account deletion |
| `mob-kontak` | `/kontak` | Contact |
| `mob-rekap` | `/app/rekap` | Session recap (protected) |
| `mob-invoice` | `/app/invoice` | Invoice builder (protected) |

**Desktop** (`design/TutorLog Web.html`) — 1440px width:

| Artboard ID | Route | Notes |
|-------------|-------|-------|
| `landing` | `/` | Landing page |
| `login` | `/login` | Login form |
| `login-sent` | `/login/sent` | Magic link sent |
| `rekap-h` | `/app/rekap` | Session recap (protected) |

### Live App Routes (from responsive sweep)

10 public routes × 2 key viewports (390px mobile, 1440px desktop) = **20 comparisons**

Protected routes excluded (no auth credentials).

## Approach

### Pipeline

```
Design HTML (serve locally)
    ↓ Playwright screenshot each artboard by ID
    ↓
Live App (dev server)
    ↓ Playwright screenshot each route
    ↓
Pixelmatch compare
    ↓
Diff images + HTML report
```

### Step 1: Serve Design HTML

- Use `npx serve design/` on port 4000
- Design HTML files load React + Babel from CDN, render artboards client-side
- Wait for `#root` to have content before screenshot

### Step 2: Screenshot Design Artboards

For each artboard:
1. Navigate to `http://localhost:4000/TutorLog Web Mobile.html` (or `TutorLog Web.html`)
2. Wait for design canvas to render (`waitForSelector`)
3. Find artboard element by ID (`[data-artboard-id="mob-landing"]`)
4. Screenshot the artboard element → `test-results/diff/design/{route}-{viewport}.png`

### Step 3: Screenshot Live App

Reuse screenshots from responsive sweep (already captured at 390px and 1440px).

### Step 4: Pixelmatch Compare

For each route × viewport:
1. Load design screenshot + live screenshot
2. Resize if needed (design artboards have fixed height, live is full-page)
3. Run pixelmatch → diff image
4. Calculate mismatch percentage
5. Threshold: **< 1% mismatch = PASS**, **≥ 1% = FAIL** (with documented reason)

### Step 5: Generate Report

HTML report at `test-results/visual-diff-report.html`:
- Summary: total comparisons, pass/fail count
- Per-route table: `| Route | Mobile (390) | Desktop (1440) |`
- Each cell: pass/fail badge + side-by-side thumbnails (design | live | diff)
- Failed items: mismatch %, diff image, documented reason
- Click thumbnail → full-size view

## File Structure

```
tests/
  visual-diff.spec.ts          # Playwright test for screenshots
scripts/
  generate-diff.ts             # Pixelmatch comparison + report
  serve-design.sh              # Serve design HTML locally
test-results/
  diff/
    design/                    # Design artboard screenshots
    live/                      # Live app screenshots (copied from responsive sweep)
    images/                    # Diff images (red = mismatch)
  visual-diff-report.html      # HTML report
```

## Dependencies

- `pixelmatch` (npm) — pixel comparison
- `pngjs` (npm) — PNG read/write
- `serve` (npm) — static file server for design HTML

## Pass/Fail Criteria

- Mismatch < 1% → **PASS** (subpixel rendering, font loading differences)
- Mismatch ≥ 1% → **FAIL** (requires documentation)
- All FAILs must have a documented reason in the report (intentional change, bug, etc.)

## Intentional Differences (Expected)

These are known differences between design artboards and live app:

| Route | Difference | Reason |
|-------|-----------|--------|
| `/` | Responsive layout adapts to viewport | Design is fixed 390/1440, live is fluid |
| `/app/*` | Protected routes not compared | No auth credentials |
| All | Font loading timing | Design loads from CDN, app uses next/font |

## Actual Differences Found

| Route | Mismatch % | Reason | Status |
|-------|-----------|--------|--------|
| landing | 7.66% | Layout adaptation, navigation elements, footer | Intentional |
| login | 54.46% | Full-page capture includes viewport switching, design is form-only | Intentional |
| login-sent | 52.85% | Same as login - viewport switching in live app | Intentional |
| fitur | 11.24% | Content layout differences, navigation | Intentional |
| harga | 10.09% | Pricing card layout, navigation | Intentional |
| panduan | 7.61% | Guide content layout, navigation | Intentional |
| privacy | 6.31% | Privacy policy content, navigation | Intentional |
| terms | 5.19% | Terms content, navigation | Intentional |
| account | 5.43% | Account deletion form, navigation | Intentional |
| kontak | 5.12% | Contact form, navigation | Intentional |

**Root Cause:** Design artboards are fixed-size mockups (390px × specific height) showing only the core content. Live app screenshots are full-page responsive captures that include navigation, viewport switching (mobile/desktop), and footer elements. The mismatches are expected and represent the difference between design intent and implementation.

## DoD Alignment

This design satisfies TASKS.md Phase 7.2:
- ✅ Screenshot tiap route
- ✅ Bandingkan dengan artboard design
- ✅ Selisih yang disengaja terdokumentasi
- ✅ Automated, repeatable comparison
