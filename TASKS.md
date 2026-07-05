# TASKS.md — TutorLog Web Backlog

> Backlog eksekusi untuk Coding Agent (`/goal`, `/loop`). Aturan main:
> 1. Kerjakan task **paling atas yang belum dicentang**, satu task per iterasi. Task didesain
>    atomik supaya muat di satu context window — jangan gabung beberapa task sekaligus.
> 2. Sebelum mulai, baca [UI_SPECS.md](UI_SPECS.md) (aturan visual) + [SPEC.md](SPEC.md)
>    (aturan konversi & keputusan varian). Markup source of truth: `design/*.jsx`.
> 3. Selesai task → verifikasi DoD → centang `[x]` di file ini → satu commit
>    (`<type>: <description>`, branch `feat/...`). Lihat [GIT_STRATEGY.md](GIT_STRATEGY.md).
> 4. DoD "tanpa horizontal scroll" artinya: `document.documentElement.scrollWidth <=
>    document.documentElement.clientWidth` pada lebar viewport yang disebut.
> 5. Server verifikasi: `npm run dev` (Next.js dev server) dari repo root.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + custom design tokens (`--tw-*`)
- **Database:** Supabase (PostgreSQL) — shared with mobile app
- **Auth:** Supabase Auth (Magic Link) — sudah di-setup di mobile
- **PDF Export:** Client-side (`html2canvas` + `jsPDF`)
- **Deployment:** Vercel Free → SumoPod VPS (saat scale up)
- **Components:** Custom (mengikuti pattern TutorPlis, tanpa component library)
- **Responsive:** Dual viewport (vp-mobile + vp-desktop) via media query
- **Git:** Trunk-based development — lihat [GIT_STRATEGY.md](GIT_STRATEGY.md)

## Route Map

| # | Route | Mobile | Desktop | Status |
|---|---|---|---|---|
| 1 | `/` (landing) | ⬜ | ⬜ | HTML done, convert pending |
| 2 | `/login` | ⬜ | ⬜ | Auth required |
| 3 | `/login/sent` | ⬜ | ⬜ | Auth required |
| 4 | `/fitur` | ⬜ | ⬜ | Static |
| 5 | `/harga` | ⬜ | ⬜ | Static |
| 6 | `/panduan` | ⬜ | ⬜ | Static |
| 7 | `/privacy` | ⬜ | ⬜ | Static |
| 8 | `/terms` | ⬜ | ⬜ | Static |
| 9 | `/account` | ⬜ | ⬜ | Static |
| 10 | `/kontak` | ⬜ | ⬜ | Static |
| 11 | `/app/rekap` | ⬜ | ⬜ | Protected |
| 12 | `/app/invoice` | ⬜ | ⬜ | Protected |
| 13 | `/app/langganan` | ⬜ | ⬜ | Protected |

---

## Phase 0 — Stack Migration (Next.js)

- [ ] **0.1 Init Next.js project**
  - `npx create-next-app@latest . --typescript --tailwind --app --eslint`
  - Setup Tailwind v4 dengan `@theme inline` di `globals.css` (mirror `--tw-*` dari tutorlog-web.css)
  - Setup font: Courier Prime + Source Serif 4 via `next/font/google`
  - Setup `.env.local` untuk Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  - _DoD: `npm run dev` jalan, halaman kosong render dengan font + warna benar_

- [ ] **0.2 Migrate CSS foundation**
  - Import `css/tutorlog-web.css` + `css/tutorlog-web-mobile.css` + `css/site.css` via `@import` di `globals.css`
  - Design tokens tetap sebagai CSS custom properties `var(--tw-*)`, BUKAN convert ke Tailwind utilities
  - Tailwind hanya dipakai untuk layout utility (flex, grid, padding), bukan mengganti design CSS
  - _DoD: Landing page HTML bisa render benar di Next.js dengan semua CSS design_

- [ ] **0.3 Setup Supabase client**
  - Install `@supabase/supabase-js` + `@supabase/ssr`
  - Buat `lib/supabase/server.ts` (server client untuk API routes)
  - Buat `lib/supabase/client.ts` (browser client untuk client components)
  - Buat `middleware.ts` (refresh session)
  - _DoD: Supabase client ter-setup, bisa connect ke project_

- [ ] **0.4 Setup root layout & shared components**
  - Buat `app/layout.tsx` (root layout + fonts + metadata)
  - Buat shared components: `components/Button.tsx`, `components/Input.tsx`, `components/Card.tsx`, `components/Modal.tsx`
  - _DoD: Components bisa dipakai di halaman mana saja_

---

## Phase 1 — Landing & Public Pages (UI Only)

> Catatan: HTML static sudah ada. Task ini convert ke Next.js components.
> Selalu preview dengan `npm run dev` setiap perubahan.
> Dual viewport: tetap pakai vp-mobile + vp-desktop via media query.

- [ ] **1.1 Migrate Landing page**
  - Convert `index.html` → `app/page.tsx`
  - Dual viewport markup (vp-mobile + vp-desktop) dalam satu component
  - Wire links ke routes baru (`/login`, `/fitur`, `/harga`, dll)
  - _DoD: Landing page identik dengan versi static, route `/` jalan_

- [ ] **1.2 Shared layout components**
  - Buat `components/Navbar.tsx` (desktop topbar + mobile nav)
  - Buat `components/Footer.tsx` (mobile + desktop variants)
  - Buat `components/TabBar.tsx` (mobile bottom tab bar)
  - Buat `components/HamburgerMenu.tsx` (overlay menu)
  - _DoD: Semua navigation components reusable di semua halaman_

- [ ] **1.3 Cleanup static files**
  - Hapus file HTML static yang sudah ter-convert (index.html, css/main.css, dll)
  - Pertahankan: `design/`, `css/tutorlog-web*.css`, `css/site.css`, `assets/`, docs
  - _DoD: Tidak ada HTML static yang konflik dengan Next.js routes_

---

## Phase 2 — Public Pages (Fitur, Harga, Panduan, Legal)

> Catatan: Halaman ini BELUM ada sebagai HTML. Build dari scratch menggunakan
> `design/web-mobile-screens.jsx` (mobile) + `design/web-screens.jsx` (desktop).
> Preview `npm run dev` setiap perubahan.

- [ ] **2.1 Fitur page** — `app/fitur/page.tsx`
- [ ] **2.2 Harga page** — `app/harga/page.tsx`
- [ ] **2.3 Panduan page** — `app/panduan/page.tsx`
- [ ] **2.4 Privacy page** — `app/privacy/page.tsx`
- [ ] **2.5 Terms page** — `app/terms/page.tsx`
- [ ] **2.6 Account Deletion page** — `app/account/page.tsx`
- [ ] **2.7 Kontak page** — `app/kontak/page.tsx`
  - _DoD setiap page: identik artboard desain, responsive, link resolve_

---

## Phase 3 — Auth (Login flow)

- [ ] **3.1 Login UI** — `app/login/page.tsx`
  - Form email input + "Kirim Magic Link" CTA
  - Mobile + Desktop layout
  - _DoD: Form render sesuai desain_

- [ ] **3.2 Login Sent UI** — `app/login/sent/page.tsx`
  - Email badge dari query param
  - "Buka Gmail" + "Kirim ulang" + "Ganti email"
  - _DoD: Email badge terisi dari `?email=`_

- [ ] **3.3 Supabase Auth wiring**
  - Buat `app/auth/callback/route.ts` (handle magic link callback)
  - Server action untuk `signInWithEmail`
  - Email template sudah di-setup di Supabase dashboard (mobile)
  - _DoD: Magic Link email terkirim, user bisa login_

- [ ] **3.4 Auth middleware**
  - Buat `middleware.ts` — cek session untuk `/app/*` routes
  - Redirect ke `/login` jika belum auth
  - _DoD: `/app/rekap` accessible setelah login, redirect ke `/login` jika tidak_

---

## Phase 4 — App Shell & Rekap

- [ ] **4.1 App shell layout** — `app/app/layout.tsx`
  - Top bar (desktop) + Tab bar (mobile)
  - Auth check + user avatar
  - _DoD: App shell render dengan navigation_

- [ ] **4.2 Rekap UI** — `app/app/rekap/page.tsx`
  - Month picker, summary card, filter chips, session list
  - Desktop: tabel. Mobile: card list
  - _DoD: UI sesuai desain, data masih dummy_

- [ ] **4.3 Rekap data wiring**
  - **Blocker:** User harus provide schema/tables dari Supabase project mobile
  - Query sessions dari Supabase (shared with mobile app)
  - Month filter, student filter
  - Summary aggregation (total sesi, jam, pendapatan)
  - **Catatan:** Data dummy di desain (Rina Novianti, Bintang Wijaya) mungkin bukan data real dari mobile
  - _DoD: Data real muncul, filter berfungsi_

- [ ] **4.4 Export CSV**
  - Client-side CSV generation dari Supabase data
  - Download file
  - _DoD: Export CSV berfungsi_

---

## Phase 5 — Invoice Builder

- [ ] **5.1 Invoice UI (mobile)** — `app/app/invoice/page.tsx`
  - Dialog "Buka di Desktop" (mobile only)
  - _DoD: Mobile view sesuai desain_

- [ ] **5.2 Invoice Builder UI (desktop)**
  - Form panel: student, date, template picker, color picker, bank details, notes
  - Preview panel: A4 render dengan 3 templates (Klasik, Modern, Minimal)
  - Zoom control
  - _DoD: Builder render sesuai desain, template switching berfungsi_

- [ ] **5.3 Invoice templates**
  - Buat `components/invoice/TplKlasik.tsx`
  - Buat `components/invoice/TplModern.tsx`
  - Buat `components/invoice/TplMinimal.tsx`
  - Buat `components/invoice/A4Page.tsx` (wrapper + watermark)
  - _DoD: 3 templates render benar dengan sample data_

- [ ] **5.4 Invoice data wiring**
  - Load student data dari Supabase
  - Auto-fill dari rekap session
  - Save draft ke Supabase
  - _DoD: Invoice bisa diisi dari data real_

- [ ] **5.5 PDF export (client-side)**
  - Install `html2canvas` + `jsPDF`
  - Convert A4 preview → canvas → PDF
  - Download PDF
  - _DoD: Download PDF invoice berfungsi_

- [ ] **5.6 Paywall dialog**
  - Dialog component (hidden by default)
  - "Export PDF" button membuka paywall (Free tier)
  - "Nanti saja" / Esc menutup
  - _DoD: Paywall berfungsi_

---

## Phase 6 — Langganan

- [ ] **6.1 Langganan UI** — `app/app/langganan/page.tsx`
  - Current plan card (Free)
  - Plus plan card (dark, Rp 39rb, CTA)
  - Bank transfer info
  - _DoD: UI sesuai desain_

- [ ] **6.2 Subscription state**
  - Check user plan dari Supabase
  - Gate features: export limit (Free: 1×/bulan), invoice templates
  - _DoD: Free user terbatas, Plus user unlimited_

---

## Phase 7 — QA & Ship

- [ ] **7.1 Responsive sweep** — semua routes di 320/390/768/1024/1440
  - _DoD: tanpa horizontal scroll, viewport yang benar tampil_

- [ ] **7.2 Visual diff vs canvas** — screenshot tiap route, bandingkan dengan artboard
  - _DoD: Selisih yang disengaja terdokumentasi_

- [ ] **7.3 A11y pass** — focus-visible, aria, alt text, prefers-reduced-motion
  - _DoD: Keyboard-only bisa navigasi semua halaman_

- [ ] **7.4 Vercel deployment (Free tier)**
  - Connect GitHub repo ke Vercel
  - Setup environment variables
  - Custom domain (web.tutorlog.id)
  - _DoD: Deploy ke Vercel, semua routes jalan_
  - _Catatan: Migrasi ke SumoPod VPS (Rp 60rb/bulan) saat scale up. App code tidak berubah, hanya deployment workflow._

- [ ] **7.5 Update docs** — sinkronkan SPEC.md + TASKS.md + README
  - _DoD: Dokumen up-to-date_
