# MVP Design Spec — TutorLog Web

> **Created:** 2026-07-08
> **Status:** Approved
> **Purpose:** Dokumentasi komprehensif MVP v1.0 TutorLog Web

---

## 1. TutorLog Web

TutorLog Web adalah web application untuk manajemen sesi les privat dan pembuatan invoice. Dibangun untuk tutor privat yang membutuhkan cara cepat dan praktis untuk mencatatan sesi mengajar serta membuat invoice profesional.

**Target User:**
- Tutor les privat (matematika, fisika, bahasa, dll)
- Solo tutor yang handle semua sendiri
- Butuh cara cepat catat sesi + buat invoice

**Value Proposition:**
- Catat sesi les dalam hitungan detik
- Buat invoice profesional dari 3 template
- Export PDF/CSV untuk keperluan administrasi
- Akses dari mana saja (web app, bukan native app)

**Tech Stack:**
- Framework: Next.js 16 (App Router) + TypeScript
- Styling: Tailwind CSS v4 + custom design tokens
- Database: Supabase (PostgreSQL) — shared dengan mobile app
- Auth: Supabase Auth (Magic Link)
- PDF Export: Client-side (jsPDF + html2canvas)
- Testing: Playwright (responsive, visual diff, a11y)
- Deployment: Vercel Free tier

---

## 2. MVP v1.0

MVP v1.0 mencakup semua fitur yang sudah built, deployed, dan siap untuk launch. Deployment ke Vercel Free tier sudah terkoneksi dengan GitHub repo.

### 2.1 Features

#### Landing & Marketing Pages
| Page | Route | Status | Description |
|------|-------|--------|-------------|
| Landing | `/` | ✅ Done | Hero section, problem statement, how it works, CTA |
| Fitur | `/fitur` | ✅ Done | Feature showcase dengan 6 kartu fitur |
| Harga | `/harga` | ✅ Done | Pricing cards (Free vs Plus) |
| Panduan | `/panduan` | ✅ Done | Step-by-step guide untuk tutor |
| Kontak | `/kontak` | ✅ Done | Contact form + email |
| Privacy | `/privacy` | ✅ Done | Privacy policy |
| Terms | `/terms` | ✅ Done | Terms of service |
| Account | `/account` | ✅ Done | Account deletion request |

#### Authentication
| Feature | Status | Description |
|---------|--------|-------------|
| Magic Link Login | ✅ Done | Email → magic link → session |
| Login Sent Page | ✅ Done | Konfirmasi email terkirim |
| Auth Callback | ✅ Done | Handle PKCE flow |
| Session Management | ✅ Done | Cookie-based via @supabase/ssr |
| Middleware Protection | ✅ Done | Redirect unauth ke `/login` |
| Logout | ✅ Done | Sign out + redirect |

#### App Features
| Feature | Status | Description |
|---------|--------|-------------|
| Home Dashboard | ✅ Done | Menu cards (Rekap + Invoice) + subscription info |
| Rekap Sesi | ✅ Done | Date range filter, summary card, session list |
| Invoice Builder | ✅ Done | Form + preview, 3 templates |
| Export CSV | ✅ Done | Client-side CSV generation |
| Export PDF | ✅ Done | html2canvas → jsPDF, 3 templates |
| Subscription Gate | ✅ Done | Free: 1x/bulan, Plus: unlimited |
| Paywall Dialog | ✅ Done | Upsell ke Plus saat quota habis |

### 2.2 Deployment

**Status:** ✅ Done

| Item | Status | Notes |
|------|--------|-------|
| Vercel Account | ✅ Done | Free tier |
| GitHub Repo | ✅ Done | `tutorlog-web` |
| Environment Variables | ✅ Done | Supabase URL + anon key |
| Custom Domain | ✅ Done | `tutorlog.id` |
| DNS Setup | ✅ Done | CNAME ke Vercel |
| SSL Certificate | ✅ Done | Vercel auto-managed |

**Deployment Info:**
- Platform: Vercel Free tier
- Repo: GitHub `tutorlog-web`
- Domain: `tutorlog.id`
- Auto-deploy: Push ke `main` branch → automatic build & deploy

### 2.3 Quality Assurance

| Test Type | Result | Details |
|-----------|--------|---------|
| Responsive Sweep | ✅ 65/65 | 50 public + 15 protected routes |
| Visual Diff | ✅ 12/12 | Intentional differences documented |
| Accessibility | ✅ 13/13 | axe-core + keyboard navigation |
| TypeScript | ✅ Clean | No errors |
| ESLint | ✅ Clean | No warnings |

**Tested Viewports:**
- Mobile: 320px, 390px
- Tablet: 768px
- Desktop: 1024px, 1440px

---

## 3. Arsitektur

### 3.1 Tech Stack Detail

```
┌─────────────────────────────────────────────────────┐
│                    Frontend                          │
│  Next.js 16 (App Router) + React 19 + TypeScript    │
│  Tailwind CSS v4 + Custom Design Tokens             │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                    Backend                           │
│  Next.js Server Actions + API Routes                │
│  Supabase Auth (Magic Link)                         │
│  Supabase PostgreSQL (shared with mobile app)       │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                    Deployment                        │
│  Vercel Free Tier ✅                                 │
│  Domain: tutorlog.id ✅                              │
│  Auto-deploy: push to main → build & deploy         │
└─────────────────────────────────────────────────────┘
```

### 3.2 Component Architecture

**Shared Components (15):**
- `SkipLink.tsx` — Skip navigation for keyboard users
- `AppTopBar.tsx` — Desktop top navigation
- `TabBar.tsx` — Mobile bottom tab bar
- `Navbar.tsx` — Public page navigation
- `Footer.tsx` — Mobile + desktop footer
- `HamburgerMenu.tsx` — Mobile overlay menu
- `MenuToggle.tsx` — Hamburger toggle logic
- `Button.tsx` — Reusable button component
- `Input.tsx` — Form input with error association
- `Card.tsx` — Card container component
- `Modal.tsx` — Accessible dialog (role=dialog, Esc key)
- `PricingCards.tsx` — Pricing cards for `/harga` and `/app`
- `PaywallDialog.tsx` — Paywall for free tier users
- `RekapContent.tsx` — Session recap content
- `ScrollReveal.tsx` — IntersectionObserver animations

**Invoice Components:**
- `invoice/TplKlasik.tsx` — Classic template (header besar + tabel)
- `invoice/TplModern.tsx` — Modern template (logo kiri, striped tabel)
- `invoice/TplMinimal.tsx` — Minimal template (monospace, clean)
- `invoice/A4Page.tsx` — A4 wrapper + watermark

### 3.3 Auth Flow

```
User enters email
       │
       ▼
┌─────────────────┐
│ sendMagicLink   │ (Server Action)
│ server action   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Supabase Auth   │
│ sends email     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ User clicks     │
│ magic link      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ /auth/callback  │ (PKCE flow)
│ creates session │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Session stored  │
│ in cookies      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Middleware       │
│ protects /app/* │
└─────────────────┘
```

### 3.4 Data Flow

**Supabase Tables (shared with mobile app):**
- `student_locations` — Student data (nama, mata pelajaran, lokasi)
- `sessions` — Teaching sessions (tanggal, durasi, siswa, tarif)
- `user_profiles` — User data + subscription plan
- `user_feature_usage_events` — Export quota tracking

**RPC Functions:**
- `get_user_access_status` — Check user plan (free/plus)
- `record_feature_usage_event` — Record export event

---

## 4. Route Map

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

---

## 5. Post-MVP Roadmap

Ide untuk iterasi mendatang (v1.1+):

### Priority 1 — Revenue
- [ ] Payment gateway (Midtrans/Xendit) untuk Plus subscription
- [ ] Webhook handler untuk payment confirmation
- [ ] Invoice numbering auto-increment

### Priority 2 — Engagement
- [ ] WhatsApp notification (sesi baru, invoice terkirim)
- [ ] Google Calendar integration
- [ ] Email reminder sebelum sesi

### Priority 3 — Scale
- [ ] Multi-tutor / team management
- [ ] Dashboard analytics (pendapatan, siswa aktif)
- [ ] Export ke Excel (.xlsx)
- [ ] Bulk invoice generation

### Priority 4 — Polish
- [ ] Interactive landing product demo — alur HP tiga state dengan data statis terkurasi
- [ ] Dark mode
- [ ] PWA support (installable)
- [ ] Offline mode (service worker)
- [ ] Multi-language (EN/ID)

---

## Appendix

### A. Design Tokens

**Colors:**
- Primary: `#006C53` (hijau teal)
- Primary Soft: `#8CF6D2` (mint)
- Secondary: `#635880` (ungu)
- Background: `#F4FAFD` (light blue-gray)
- Surface: `#FFFFFF`

**Typography:**
- Title: Courier Prime 700 (monospace)
- Body: Source Serif 4 (serif)

**Radius:**
- Card: 32px (desktop), 24px (mobile)
- Button: 999px (full)
- Input: 16px

### B. File Structure

```
tutorlog-web/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   ├── globals.css          # Global styles
│   ├── login/               # Auth pages
│   ├── auth/callback/       # Supabase callback
│   ├── fitur/               # Features page
│   ├── harga/               # Pricing page
│   ├── panduan/             # Guide page
│   ├── privacy/             # Privacy policy
│   ├── terms/               # Terms of service
│   ├── account/             # Account deletion
│   ├── kontak/              # Contact page
│   └── app/                 # Protected routes
│       ├── layout.tsx       # App shell
│       ├── page.tsx         # Home dashboard
│       ├── rekap/           # Session recap
│       └── invoice/         # Invoice builder
├── components/              # Shared components
├── css/                     # Design tokens
├── design/                  # Omelette artboards
├── lib/                     # Supabase clients
├── tests/                   # Playwright tests
└── docs/                    # Documentation
```

### C. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJxxxxxxx
```

### D. Deployment Checklist

- [x] Connect GitHub repo ke Vercel
- [x] Set environment variables
- [x] Add custom domain `tutorlog.id`
- [x] Update DNS (CNAME)
- [x] Verify SSL certificate
- [x] Test all routes
- [x] Monitor error logs
