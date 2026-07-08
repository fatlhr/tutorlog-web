# Design: Responsive Sweep — Playwright E2E

> **Date:** 2026-07-07
> **Phase:** 7 — QA & Ship
> **Task:** 7.1 Responsive sweep — semua routes di 320/390/768/1024/1440
> **Status:** Approved

## Goal

Verify that all routes render without horizontal scroll across 5 viewport sizes (320, 390, 768, 1024, 1440). Detect layout overflow issues early before deployment.

## Scope

### Routes (13 total)

| # | Route | Auth Required | Notes |
|---|-------|---------------|-------|
| 1 | `/` | No | Landing page |
| 2 | `/login` | No | Login form |
| 3 | `/login/sent` | No | Magic link sent |
| 4 | `/fitur` | No | Features page |
| 5 | `/harga` | No | Pricing page |
| 6 | `/panduan` | No | Guide page |
| 7 | `/privacy` | No | Privacy policy |
| 8 | `/terms` | No | Terms of service |
| 9 | `/account` | No | Account deletion |
| 10 | `/kontak` | No | Contact page |
| 11 | `/app` | Yes | Home dashboard |
| 12 | `/app/rekap` | Yes | Session recap |
| 13 | `/app/invoice` | Yes | Invoice builder |

### Viewports

| Size | Name | Expected Viewport |
|------|------|-------------------|
| 320px | Small mobile | `vp-mobile` |
| 390px | Design mobile | `vp-mobile` |
| 768px | Tablet breakpoint | `vp-desktop` |
| 1024px | Tablet | `vp-desktop` |
| 1440px | Design desktop | `vp-desktop` |

**Dual viewport rule:** `< 768px` → `vp-mobile`, `>= 768px` → `vp-desktop`

### Total Test Cases

13 routes × 5 viewports = **65 tests**

## Approach

### Framework

- **Playwright** (`@playwright/test`) — free, easy setup, good TypeScript support
- Browser: Chromium only (sufficient for responsive testing)

### Auth Flow

- Test public routes (1–10) without auth
- Test `/app/*` routes (11–13) with authenticated session
- Auth via Supabase API using test account: `fatiharahmat257@gmail.com`
- Login via `supabase.auth.signInWithPassword()` or magic link flow
- Session stored in cookies, reused across `/app/*` tests

### Test Logic

Per test case:
1. Navigate to route
2. Wait for page load (network idle)
3. Set viewport size
4. Check horizontal scroll:
   ```typescript
   const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
   const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
   const hasHorizontalScroll = scrollWidth > clientWidth;
   ```
5. Take screenshot → `test-results/screenshots/{route-slug}-{viewport}.png`
6. Record result: `{ route, viewport, pass, scrollWidth, clientWidth, screenshot }`

### Pass/Fail Criteria

- `scrollWidth <= clientWidth` → **PASS**
- `scrollWidth > clientWidth` → **FAIL** (horizontal scroll detected)

## Output

### Screenshots

- Folder: `test-results/screenshots/`
- Naming: `{route-slug}-{viewport}.png`
- Examples: `app-rekap-390.png`, `fitur-1440.png`, `login-320.png`

### HTML Report

- File: `test-results/responsive-report.html`
- Content:
  - Summary: total tests, pass/fail count
  - Table per route: `| Route | 320 | 390 | 768 | 1024 | 1440 |`
  - Each cell: pass/fail badge + thumbnail screenshot
  - Failed tests: highlighted red, scrollWidth vs clientWidth diff
  - Click thumbnail → full screenshot

### Console Output

- Real-time pass/fail per test
- Final summary

## File Structure

```
tests/
  responsive-sweep.spec.ts    # Main test file
  fixtures/
    auth.ts                   # Auth helper (Supabase login)
playwright.config.ts          # Playwright config
test-results/
  screenshots/                # Screenshots per route/viewport
  responsive-report.html      # HTML report
```

## Dependencies

- `@playwright/test` (dev dependency)
- Chromium browser binary (~200MB)
- `.env.test` with `TEST_EMAIL` and `TEST_PASSWORD`

## DoD Alignment

This design satisfies TASKS.md Phase 7.1:
- ✅ Semua routes di 5 viewport (320/390/768/1024/1440)
- ✅ Tanpa horizontal scroll (`scrollWidth <= clientWidth`)
- ✅ Viewport yang benar tampil (dual viewport rule verified)
- ✅ Screenshots for visual verification
- ✅ Automated, repeatable test suite
