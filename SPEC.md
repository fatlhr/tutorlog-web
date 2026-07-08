# SPEC — TutorLog Web

> **Last updated:** 2026-07-07
> **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS v4 + Supabase

## Goal

TutorLog Web adalah web app untuk manajemen sesi les privat dan pembuatan invoice. Dibangun dengan Next.js App Router, mengikuti design system dari project Omelette (artboard di `design/`).

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + custom design tokens (`--tw-*`)
- **Database:** Supabase (PostgreSQL) — shared dengan mobile app
- **Auth:** Supabase Auth (Magic Link)
- **PDF Export:** Client-side (`jsPDF`, `html2canvas`)
- **Testing:** Playwright (responsive sweep, visual diff, A11y)
- **Deployment:** Vercel (Free tier)

## Route Map

### Public Routes

| # | Route | Description | Status |
|---|-------|-------------|--------|
| 1 | `/` | Landing page | ✅ |
| 2 | `/login` | Magic link login | ✅ |
| 3 | `/login/sent` | Login email sent | ✅ |
| 4 | `/fitur` | Features page | ✅ |
| 5 | `/harga` | Pricing page | ✅ |
| 6 | `/panduan` | Guide page | ✅ |
| 7 | `/privacy` | Privacy policy | ✅ |
| 8 | `/terms` | Terms of service | ✅ |
| 9 | `/account` | Account deletion | ✅ |
| 10 | `/kontak` | Contact page | ✅ |

### Protected Routes (auth required)

| # | Route | Description | Status |
|---|-------|-------------|--------|
| 11 | `/app` | Home dashboard | ✅ |
| 12 | `/app/rekap` | Session recap | ✅ |
| 13 | `/app/invoice` | Invoice builder | ✅ |

## Design System

Source of truth: `design/` folder (Omelette artboards).

- **Mobile:** `design/TutorLog Web Mobile.html` (artboard 390px)
- **Desktop:** `design/TutorLog Web.html` (artboard 1440px)
- **Design tokens:** `css/tutorlog-web.css` (`--tw-*`, `--f-*`, `--r-*`)
- **Mobile styles:** `css/tutorlog-web-mobile.css` (`mob-*` classes)
- **Desktop styles:** `css/tutorlog-web.css` + `css/site.css`

### Responsive Pattern

Dual viewport markup (`vp-mobile` + `vp-desktop`) via media query breakpoint 768px.

## Authentication

Magic Link flow via Supabase Auth:
1. User enters email → `sendMagicLink` server action
2. Supabase sends magic link email
3. User clicks link → `/auth/callback` handles PKCE flow
4. Session stored in cookies, middleware protects `/app/*` routes

## Key Components

| Component | File | Description |
|-----------|------|-------------|
| `SkipLink` | `components/SkipLink.tsx` | Skip navigation for keyboard users |
| `AppTopBar` | `components/AppTopBar.tsx` | Desktop top navigation |
| `TabBar` | `components/TabBar.tsx` | Mobile bottom tab bar |
| `Modal` | `components/Modal.tsx` | Accessible dialog (role=dialog, Escape key) |
| `Input` | `components/Input.tsx` | Form input with error association |
| `PricingCards` | `components/PricingCards.tsx` | Pricing cards for `/harga` and `/app` |
| `PaywallDialog` | `components/PaywallDialog.tsx` | Paywall for free tier users |

## Testing

### Responsive Sweep
- 50 public routes × 5 viewports (320, 390, 768, 1024, 1440)
- 15 protected routes × 3 viewports (390, 768, 1440)
- Validates: no horizontal scroll, correct viewport rendering

### Visual Diff
- Screenshots of live app vs design artboards
- Pixelmatch comparison with tolerance
- Diff report: `test-results/visual-diff-report.html`

### Accessibility (A11y)
- axe-core automated testing on all 10 public routes
- Keyboard navigation testing (skip link, landmarks, focus)
- WCAG 2.1 AA compliance

## File Structure

```
app/
  layout.tsx           # Root layout (fonts, metadata, SkipLink, main landmark)
  page.tsx             # Landing page
  globals.css          # Global styles + Tailwind config
  login/
    page.tsx           # Login form
    sent/page.tsx      # Email sent confirmation
    actions.ts         # Server actions (sendMagicLink)
  auth/callback/       # Supabase auth callback
  fitur/page.tsx       # Features
  harga/page.tsx       # Pricing
  panduan/page.tsx     # Guide
  privacy/page.tsx     # Privacy policy
  terms/page.tsx       # Terms of service
  account/page.tsx     # Account deletion
  kontak/page.tsx      # Contact
  app/
    layout.tsx         # App shell (auth check, nav)
    page.tsx           # Home dashboard
    rekap/page.tsx     # Session recap
    invoice/page.tsx   # Invoice builder
components/            # Shared React components
css/                   # Design tokens + styles
design/                # Omelette artboards
tests/                 # Playwright tests
```

## Git Strategy

Trunk-based development. See `GIT_STRATEGY.md` for details.
