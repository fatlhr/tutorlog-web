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
- **PDF Export:** Client-side (`jsPDF`, native drawing)
- **Deployment:** Vercel Free → SumoPod VPS (saat scale up)
- **Components:** Custom (mengikuti pattern TutorPlis, tanpa component library)
- **Responsive:** Dual viewport (vp-mobile + vp-desktop) via media query
- **Git:** Trunk-based development — lihat [GIT_STRATEGY.md](GIT_STRATEGY.md)

## Route Map

| # | Route | Mobile | Desktop | Status |
|---|---|---|---|---|---|
| 1 | `/` (landing) | ✅ | ✅ | Done |
| 2 | `/login` | ✅ | ✅ | Done |
| 3 | `/login/sent` | ✅ | ✅ | Done |
| 4 | `/fitur` | ✅ | ✅ | Static |
| 5 | `/harga` | ✅ | ✅ | Static |
| 6 | `/panduan` | ✅ | ✅ | Static |
| 7 | `/privacy` | ✅ | ✅ | Static |
| 8 | `/terms` | ✅ | ✅ | Static |
| 9 | `/account` | ✅ | ✅ | Static |
| 10 | `/kontak` | ✅ | ✅ | Static |
| 11 | `/app` (home) | ⬜ | ⬜ | Protected |
| 12 | `/app/rekap` | ✅ | ✅ | Protected |
| 13 | `/app/invoice` | ✅ | ⬜ | Protected |
| 14 | `/checkout` | ✅ | ✅ | Protected |
| 15 | `/pembayaran/[purchaseId]` | ✅ | ✅ | Protected |

---

## Phase 0 — Stack Migration (Next.js)

- [x] **0.1 Init Next.js project**
  - `npx create-next-app@latest . --typescript --tailwind --app --eslint`
  - Setup Tailwind v4 dengan `@theme inline` di `globals.css` (mirror `--tw-*` dari tutorlog-web.css)
  - Setup font: Courier Prime + Source Serif 4 via `next/font/google`
  - Setup `.env.local` untuk Supabase (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  - _DoD: `npm run dev` jalan, halaman kosong render dengan font + warna benar_

- [x] **0.2 Migrate CSS foundation**
  - Import `css/tutorlog-web.css` + `css/tutorlog-web-mobile.css` + `css/site.css` via `@import` di `globals.css`
  - Design tokens tetap sebagai CSS custom properties `var(--tw-*)`, BUKAN convert ke Tailwind utilities
  - Tailwind hanya dipakai untuk layout utility (flex, grid, padding), bukan mengganti design CSS
  - _DoD: Landing page HTML bisa render benar di Next.js dengan semua CSS design_

- [x] **0.3 Setup Supabase client**
  - Install `@supabase/supabase-js` + `@supabase/ssr`
  - Buat `lib/supabase/server.ts` (server client untuk API routes)
  - Buat `lib/supabase/client.ts` (browser client untuk client components)
  - Buat `middleware.ts` (refresh session)
  - _DoD: Supabase client ter-setup, bisa connect ke project_

- [x] **0.4 Setup root layout & shared components**
  - Buat `app/layout.tsx` (root layout + fonts + metadata)
  - Buat shared components: `components/Button.tsx`, `components/Input.tsx`, `components/Card.tsx`, `components/Modal.tsx`
  - _DoD: Components bisa dipakai di halaman mana saja_

---

## Phase 1 — Landing & Public Pages (UI Only)

> Catatan: HTML static sudah ada. Task ini convert ke Next.js components.
> Selalu preview dengan `npm run dev` setiap perubahan.
> Dual viewport: tetap pakai vp-mobile + vp-desktop via media query.

- [x] **1.1 Migrate Landing page**
  - Convert `index.html` → `app/page.tsx`
  - Dual viewport markup (vp-mobile + vp-desktop) dalam satu component
  - Wire links ke routes baru (`/login`, `/fitur`, `/harga`, dll)
  - _DoD: Landing page identik dengan versi static, route `/` jalan_

- [x] **1.2 Shared layout components**
  - Buat `components/Navbar.tsx` (desktop topbar + mobile nav)
  - Buat `components/Footer.tsx` (mobile + desktop variants)
  - Buat `components/TabBar.tsx` (mobile bottom tab bar)
  - Buat `components/HamburgerMenu.tsx` (overlay menu)
  - _DoD: Semua navigation components reusable di semua halaman_

- [x] **1.3 Cleanup static files**
  - Hapus file HTML static yang sudah ter-convert (index.html, css/main.css, dll)
  - Pertahankan: `design/`, `css/tutorlog-web*.css`, `css/site.css`, `assets/`, docs
  - _DoD: Tidak ada HTML static yang konflik dengan Next.js routes_

- [x] **1.4 Landing polish** (goal 2026-07-05)
  - CTA "Cek di Play Store" (mobile primary + desktop primary, link com.tutorlog.app)
  - Dedup tombol Masuk desktop: login hanya via nav; hero = Play Store + Lihat demo
  - Mobile: CTA kolom penuh (.cta-col), hero 100svh center, elemen invoice dihapus
  - Desktop: glass card flow-relative (hack marginRight dihapus), koordinat stat node diperbaiki, h1 clamp()
  - Tablet <1000px: features-head & footer stack (inline style → class site.css)
  - ScrollReveal (IntersectionObserver, once) + MenuToggle (hamburger hidup, Esc, scroll lock)
  - Footer restructured: links on top, logo+copyright side by side, centered, responsive
  - _DoD: tsc + eslint clean; SSR: 1 tombol Masuk desktop, Play link di 2 viewport, overlay statis hilang_

---

## Phase 2 — Public Pages (Fitur, Harga, Panduan, Legal)

> Catatan: Halaman ini BELUM ada sebagai HTML. Build dari scratch menggunakan
> `design/web-mobile-screens.jsx` (mobile) + `design/web-screens.jsx` (desktop).
> Preview `npm run dev` setiap perubahan.

- [x] **2.1 Fitur page** — `app/fitur/page.tsx`
- [x] **2.2 Harga page** — `app/harga/page.tsx`
- [x] **2.3 Panduan page** — `app/panduan/page.tsx`
- [x] **2.4 Privacy page** — `app/privacy/page.tsx`
- [x] **2.5 Terms page** — `app/terms/page.tsx`
- [x] **2.6 Account Deletion page** — `app/account/page.tsx`
- [x] **2.7 Kontak page** — `app/kontak/page.tsx`
  - _DoD setiap page: identik artboard desain, responsive, link resolve_

---

## Phase 3 — Auth (Login flow)

- [x] **3.1 Login UI** — `app/login/page.tsx`
  - Form email input + "Kirim Magic Link" CTA
  - Mobile + Desktop layout (+ tablet single-column dengan background constellation)
  - _DoD: Form render sesuai desain_ ✓ (390/768–1199/1440, tanpa horizontal scroll, tsc+eslint clean)

- [x] **3.2 Login Sent UI** — `app/login/sent/page.tsx`
  - Email badge dari query param
  - "Buka Gmail" + "Kirim ulang" + "Ganti email"
  - _DoD: Email badge terisi dari `?email=`_ ✓ (fallback nama@email.com tanpa param, tsc+eslint clean)

- [x] **3.3 Supabase Auth wiring**
  - Buat `app/auth/callback/route.ts` (handle magic link callback: PKCE `?code=` + OTP `?token_hash=`)
  - Server action `sendMagicLink` (`app/login/actions.ts`) — dipakai form login (2 viewport) + tombol "Kirim ulang link"
  - Migrasi `lib/supabase/*` ke `@supabase/ssr` (cookie-based session)
  - Email template sudah di-setup di Supabase dashboard (mobile)
  - _DoD: Magic Link email terkirim ✓; klik link dari inbox → session kebentuk, redirect `/` ✓ (verified manual 2026-07-06); callback invalid → /login?error=auth ✓_
  - _Catatan: PKCE — link harus diklik di browser yang sama dengan pengirim request. Redirect URLs prod (`https://tutorlog.id/auth/callback`) masih perlu ditambah di dashboard saat deploy_

- [x] **3.4 Auth middleware**
  - Buat `proxy.ts` (Next 16 rename dari `middleware.ts` — convention lama deprecated) — cek session untuk `/app/*` routes via `supabase.auth.getUser()`
  - Redirect ke `/login` jika belum auth
  - Placeholder `app/app/rekap/page.tsx` (UI penuh = Task 4.2)
  - _DoD: redirect unauth ✓ (`/app/rekap` & `/app/invoice` → 307 `/login`); `/app/rekap` accessible setelah login ✓ (verified manual 2026-07-06)_

- [x] **3.5 Logout**
  - Tombol logout di AppTopBar (desktop) + hamburger menu (mobile)
  - Panggil `supabase.auth.signOut()` → redirect ke `/login`
  - _DoD: User bisa logout dari app shell, session terhapus, redirect ke login_

- [x] **3.6 Redirect after login**
  - User yang sudah login lalu akses `/login` → redirect ke `/app/rekap`
  - _DoD: Login page tidak bisa diakses oleh user authenticated_

---

## Phase 4 — App Shell & Rekap

- [x] **4.1 App shell layout** — `app/app/layout.tsx`
  - Top bar desktop (`components/AppTopBar.tsx`, varian AppShellH per SPEC) + Tab bar mobile (`components/TabBar.tsx`, active via usePathname)
  - Auth check (`supabase.auth.getUser()`, redirect `/login`) + user avatar (initials dari user_metadata/email)
  - _DoD: App shell render dengan navigation ✓ (390 + 1440, tab bar fixed bottom, topbar brand+nav+avatar; unauth tetap 307 → /login; tsc+eslint clean)_

- [x] **4.2 Rekap UI** — `app/app/rekap/page.tsx`
  - Month picker, summary card, filter chips, session list
  - Desktop: tabel. Mobile: card list
  - _DoD: UI sesuai desain, data masih dummy_

- [x] **4.3 Rekap data wiring**
  - **Blocker:** User harus provide schema/tables dari Supabase project mobile
  - Query sessions dari Supabase (shared with mobile app)
  - Month filter, student filter
  - Summary aggregation (total sesi, jam, pendapatan)
  - **Catatan:** Data dummy di desain (Rina Novianti, Bintang Wijaya) mungkin bukan data real dari mobile
  - _DoD: Data real muncul, filter berfungsi ✓ (schema dari mobile app code, fallback ke dummy)_

- [x] **4.4 Export CSV**
  - Client-side CSV generation dari Supabase data
  - Download file
  - _DoD: Export CSV berfungsi_

- [x] **4.5 Export quota gating**
  - Cek user plan dari Supabase (`get_user_access_status` RPC)
  - Free plan: 1 PDF + 1 CSV per rolling 30 hari
  - Record export events ke `user_feature_usage_events` via `record_feature_usage_event` RPC
  - Kalau quota habis → tampilkan dialog paywall "Fitur Premium" dengan CTA ke langganan
  - Plus plan: unlimited export
  - _DoD: Free user dibatasi 1×/30 hari, Plus user unlimited, event tercatat_

---

## Phase 5 — Invoice Builder

- [x] **5.1 Invoice UI (mobile)** — `app/app/invoice/page.tsx`
  - Dialog "Buka di Desktop" (mobile only)
  - _DoD: Mobile view sesuai desain_

- [x] **5.2 Invoice Builder UI (desktop)**
  - Form panel: student, date, template picker, color picker, bank details, notes
  - Preview panel: A4 render dengan 3 templates (Klasik, Modern, Minimal)
  - Zoom control
  - _DoD: Builder render sesuai desain, template switching berfungsi_

- [x] **5.3 Invoice templates**
  - Buat `components/invoice/TplKlasik.tsx` (header besar + tabel + ringkasan bawah)
  - Buat `components/invoice/TplModern.tsx` (logo kiri, info kanan, tabel striped, total badge)
  - Buat `components/invoice/TplMinimal.tsx` (monospace, clean lines)
  - Buat `components/invoice/A4Page.tsx` (wrapper + watermark "Generated by TutorLog")
  - Setiap template support field `lembaga` opsional, warna header + aksen via CSS var
  - _DoD: 3 templates render benar dengan sample data, watermark muncul di semua template_

- [x] **5.4 Invoice data wiring**
  - Load student data dari `student_locations` (hanya yang aktif, `deleted_at IS NULL`)
  - Auto-fill dari rekap session (pilih siswa + rentang tanggal → auto itemize)
  - Simpan logo URL + info rekening ke localStorage
  - Upload logo ke Supabase Storage bucket `user-assets` (opsional, fallback localStorage)
  - _DoD: Invoice bisa diisi dari data real, localStorage persistence berfungsi_

- [x] **5.5 PDF export (client-side)**
  - Render template final dengan html2canvas → jsPDF
  - Preview selalu template Klasik (default); user pilih template di akhir sebelum export
  - Download PDF
  - _DoD: Download PDF invoice berfungsi, template yang dipilih user yang di-export_

- [x] **5.6 Paywall dialog**
  - Dialog component (hidden by default)
  - "Export PDF" button membuka paywall (Free tier: 1x/bulan, watermark)
  - Paywall shows: "Upgrade ke PLUS — Rp 149.000 sekali bayar" + "Bulanan Rp 19.000/bulan"
  - "Nanti saja" / Esc menutup
  - _DoD: Paywall berfungsi_

---

## Phase 6 — Home Dashboard & Langganan

> Desain: setelah login user masuk ke home (`/app`) dengan 2 card menu + langganan + CTA download.
> Tab "Langganan" dihapus dari TabBar & TopBar. Konten langganan pindah ke home.
> Lihat `docs/superpowers/specs/` untuk detail desain.

- [x] **6.0 Sticky topbar + mobile branding**
  - AppTopBar desktop: `position: sticky; top: 0; z-index: 30`
  - Mobile brand bar: logo + "TutorLog" di kiri, sticky top
  - Hapus "← Home" link di halaman invoice mobile (redundan)
  - _DoD: Branding tetap terlihat saat scroll di desktop & mobile_

- [x] **6.1 Home page** — `app/app/page.tsx`
  - Section 1: Menu cards — 2 card navigasi (Rekap Sesi + Buat Invoice), klik → halaman masing-masing
  - Section 2: Langganan — tampil hanya jika user Free (full konten: plan card, PLUS, bank, cara aktivasi)
  - Section 3: CTA Download — "Download TutorLog di Play Store" (selalu tampil, link Play Store)
  - Dual viewport (mobile + desktop)
  - _DoD: Home render dengan 3 section, conditional langganan, CTA download_

- [x] **6.2 Remove langganan tab**
  - Hapus tab "Langganan" dari `TabBar.tsx` (mobile: Rekap | Invoice | Lainnya)
  - Hapus nav "Langganan" dari `AppTopBar.tsx` (desktop: Rekap Sesi | Invoice Builder)
  - Hapus `app/app/langganan/page.tsx`
  - _DoD: Tab bar 3 item, topbar 2 nav item, route /app/langganan hilang_

- [x] **6.3 Update redirects**
  - Login callback (`app/auth/callback/route.ts`) redirect → `/app`
  - Login page (`app/login/page.tsx`) redirect → `/app`
  - _DoD: Setelah login user masuk ke home dashboard_

- [x] **6.4 Subscription state wiring**
  - Check user plan dari Supabase (`get_user_access_status` RPC)
  - Gate features: Free (PDF 1×/bulan, invoice preview watermark, tampil langganan di home) vs PLUS (unlimited PDF, 3 template, no watermark, home tanpa langganan section)
  - _DoD: Free user lihat langganan di home, Plus user tidak_

- [x] **6.5 Langganan content in home**
  - Current plan card (Free)
  - PLUS card (dark, Rp 149.000 sekali bayar / Rp 19.000/bulan)
  - Bank transfer info
  - Cara aktivasi
  - _DoD: Konten langganan tampil di home untuk user Free, UI sesuai desain_

- [x] **6.6 Back to Home links**
  - Tombol "← Home" di halaman Rekap (mobile + desktop) → `/app`
  - Tombol "← Home" di halaman Invoice (mobile + desktop) → `/app`
  - _DoD: Klik "Home" dari Rekap/Invoice → redirect ke `/app`_

- [x] **6.7 Fixes & shared components**
  - Date range replaces month picker pada Rekap (fetch by range, URL-based)
  - Fix PaywallDialog link `/app/langganan` → `/app`
  - Shared `PricingCards` component untuk `/app` dan `/harga`
  - Konfirmasi Pembayaran via WhatsApp di home
  - _DoD: Date range berfungsi, harga page konsisten, konfirmasi link berfungsi_

---

## Phase 7 — Payment Integration & Provider Activation

> **Ringkasan:** Phase 7 membangun seluruh sistem billing dari nol — database, API, UI, dan
> payment gateway. Semua payment call sudah ada di codebase tapi di-gate oleh
> `BILLING_PAYMENT_PROVIDER_ENABLED=false`. Duitku sandbox memerlukan IP whitelisting
> untuk callbacks (production: `182.23.85.8`-`103.177.101.190`).
>
> Lihat `docs/superpowers/specs/2026-07-20-duitku-migration-design.md` untuk detail Duitku.
> Lihat `docs/superpowers/specs/2026-07-16-pricing-paywall-payment-design.md` untuk design spec.

### 7.1 Integration/Data — DONE ✓

> **Apa ini:** Fondasi database dan backend untuk seluruh sistem billing. Semua sudah di-apply
> ke Supabase production. Termasuk tabel, RPC functions, dan provider adapter placeholder.

- [x] **I0** Capture live DB & merchant evidence — verifikasi schema mobile + sandbox
  - _Apa yang dilakukan:_ Cek bahwa Supabase production sudah punya tabel-tabel billing yang benar
  - _Kenapa penting:_ Memastikan fondasi data sudah siap sebelum mulai build
  - _DoD: DB live verified, screenshot evidence tersimpan_ ✓
- [x] **I1** Freeze shared billing contract — `lib/billing/contracts.ts`, `lib/billing/errors.ts`
  - _Apa yang dilakukan:_ Buat "kontrak" (interface TypeScript) yang mendefinisikan tipe data billing — product, purchase, payment, access
  - _Kenapa penting:_ Semua komponen (UI, API, provider) punya satu sumber kebenaran untuk tipe data
  - _DoD: Contract test pass, `lib/billing/contracts.test.ts` green_ ✓ (commit `9bb02f4`)
- [x] **I2** Billing schema, catalog, RLS — 4 Supabase migrations
  - _Apa yang dilakukan:_ Buat SQL migration: tabel billing_products, billing_purchases, billing_payments, billing_entitlements + RLS policies + seed data
  - _Kenapa penting:_ Database punya struktur untuk menyimpan produk, pembelian, pembayaran, dan hak akses user
  - `202607160001_billing_schema`: 6 tabel + RLS + seed
  - `202607160002_billing_functions`: 10 RPC functions (billing_status, start_purchase, record_payment, grant_access, dll)
  - `202607160003_billing_purchase_functions`: purchase flow functions
  - `202607160004_billing_webhook_functions`: webhook processing + authorization functions
  - _DoD: Migrations applied ke live Supabase_ ✓ (verified via API)
- [x] **I2A** Entitlement grant provenance — legacy + billing grant coexistence
  - _Apa yang dilakukan:_ Pastikan sistem entitlement lama (dari mobile app) bisa hidup berdampingan dengan sistem baru
  - _Kenapa penting:_ User lama tidak kehilangan akses saat migrasi
  - _DoD: Legacy grants preserved_ ✓ (commit `d91d459`)
- [x] **I3** Atomic billing authorization — `billing_access_status_for_user`, `authorize_feature_export`
  - _Apa yang dilakukan:_ Buat fungsi SQL yang cek "apakah user ini boleh export PDF?" tanpa UI harus tahu logikanya
  - _Kenapa penting:_ Authorization logic di database, bukan di client — lebih aman dan konsisten
  - _DoD: Authorization functions live_ ✓ (commit `c2c1eca`, verified via API)
- [x] **I4** iPaymu provider adapter — `lib/billing/providers/ipaymu.ts`, `ipaymu-signature.ts`
  - _Apa yang dilakukan:_ Buat adapter iPaymu (placeholder, belum functional — throws `providerNotReady()`)
  - _Kenapa penting:_ Provider interface punya implementasi awal, bisa di-swap ke Duitku nanti
  - _DoD: Provider implements PaymentProvider interface_ ✓ (commit `aa7159f`)
- [x] **I5** Billing purchase APIs — 6 route handlers + 6 RPC functions
  - _Apa yang dilakukan:_ Buat API endpoint untuk beli paket, cek status pembayaran, dan grant akses
  - _Kenapa penting:_ Frontend bisa berinteraksi dengan sistem billing
  - Routes: `/api/products`, `/api/quotes`, `/api/purchases`, `/api/payments`, `/api/billing/status`
  - RPC: `billing_status_for_user`, `billing_start_purchase`, `billing_record_payment`, `billing_grant_access`, `billing_list_user_purchases`, `billing_user_access_status`
  - _DoD: All endpoints functional_ ✓ (commit `36bf713`, verified via API)
- [x] **I6** Webhook processing — `process_billing_provider_event` + callback route
  - _Apa yang dilakukan:_ Buat webhook handler + RPC function untuk terima notifikasi dari payment gateway
  - _Kenapa penting:_ Server bisa terima notifikasi saat pembayaran berhasil/gagal (tanpa user harus refresh)
  - `app/api/webhooks/ipaymu/route.ts` (to be replaced with Duitku)
  - _DoD: Webhook processing live_ ✓ (commit `d3592d9`)

### 7.2 UI/Product — DONE ✓

> **Apa ini:** Semua halaman dan komponen UI yang terkait billing — dari melihat paket hingga
> melihat status pembayaran. Checkout flow complete: catalog → checkout → payment status.

- [x] **U1** View models, fixtures, browser client — `ui-model.ts`, `fixtures.ts`, `client.ts`
  - _Apa yang dilakukan:_ Ubah data DB → data UI, buat data dummy untuk development, dan browser client
  - _Kenapa penting:_ UI punya data layer yang terpisah dari database, bisa di-test
  - _DoD: Billing UI data layer ready_ ✓ (commit `caaf985`)
- [x] **U2** Pricing catalog UI — `components/billing/pricing-catalog.tsx`
  - _Apa yang dilakukan:_ Tampilkan 2 paket (Plus bulanan Rp 19rb + Plus sekali bayar Rp 149rb) + info transfer bank
  - _Kenapa penting:_ User bisa melihat paket yang tersedia di halaman `/harga`
  - _DoD: Catalog renders, "Coming Soon" badge visible_ ✓ (commit `1072c42`)
- [x] **U3** Safe login return — `lib/auth/safe-next.ts` + auth callback update
  - _Apa yang dilakukan:_ Simpan URL yang ingin dituju user sebelum login, kembalikan setelah login
  - _Kenapa penting:_ Setelah login, user dikembalikan ke halaman yang tadinya dibuka (misal `/checkout`)
  - _DoD: Login preserves return URL_ ✓ (commit `dd995a9`)
- [x] **U4** Checkout panel UI — `components/billing/checkout-panel.tsx`
  - _Apa yang dilakukan:_ Tampilkan info transfer bank, link WhatsApp untuk konfirmasi, dan status "Coming Soon"
  - _Kenapa penting:_ User bisa melihat detail pembayaran sebelum transfer
  - _DoD: Checkout renders with disabled state_ ✓ (commit `96a1a79`)
- [x] **U5** Payment status & recovery — `components/billing/payment-status-panel.tsx`
  - _Apa yang dilakukan:_ Auto-polling setiap 5 detik, max 120 kali, cleanup timer
  - _Kenapa penting:_ User bisa melihat status pembayaran real-time (pending → paid)
  - _DoD: Payment status UI berfungsi_ ✓ (commits `fec810f`+`df5983e`+`8d7086a`)
- [x] **U6** Access, latest payment, paywall — `AccessSummaryCard`, `LatestPaymentCard`, `PaywallDialog`
  - _Apa yang dilakukan:_ Buat komponen untuk melihat status langganan, pembayaran terakhir, dan dialog upgrade
  - _Kenapa penting:_ User bisa tau status akses mereka dan kapan harus upgrade
  - _DoD: Access surfaces wired_ ✓ (commit `3a48e39`)
- [x] **U7** Server export authorization — `authorizeFeatureExport` wiring (di integration branch)
  - _Apa yang dilakukan:_ Wire `authorizeFeatureExport` ke server — export PDF di-gate oleh server (bukan client)
  - _Kenapa penting:_ Lebih aman karena authorization logic tidak bisa di-bypass dari client
  - _DoD: Export gated via server-side authorization_ ✓ (commit `c2c1eca`)
- [x] **U8** Route wiring — `/harga`, `/checkout`, `/pembayaran/[purchaseId]`, analytics
  - _Apa yang dilakukan:_ Buat routes + analytics events (paywall_shown, checkout_started, dll)
  - _Kenapa penting:_ Semua halaman billing bisa diakses user
  - Routes: `app/harga/page.tsx`, `app/checkout/page.tsx`, `app/pembayaran/[purchaseId]/page.tsx`
  - Analytics: `lib/billing/analytics-client.ts`
  - _DoD: All routes functional_ ✓ (commit `8636b07`)
  - _Test: billing UI test fixtures aligned_ ✓ (commits `c86051c`+`c703f09`+`6b07065`)

### 7.3 Fallback Catalog & Gateway Gate — DONE ✓

> **Apa ini:** Sementara payment gateway belum aktif, pricing tetap terlihat tapi checkout
> disabled. Seperti "jalan tengang" — user bisa lihat paket, tapi belum bisa beli.

- [x] **FG1** Fallback catalog — `lib/billing/fallback-catalog.ts`
  - _Apa yang dilakukan:_ Product catalog hardcoded tanpa dependensi provider
  - _Kenapa penting:_ Catalog bisa render meskipun tidak ada koneksi ke payment gateway
  - _DoD: Catalog renders tanpa provider_ ✓ (commit `4ae1e7b`)
- [x] **FG2** Payment gateway gate — `isPaymentProviderEnabled()`
  - _Apa yang dilakukan:_ Cek env var `BILLING_PAYMENT_PROVIDER_ENABLED` — semua payment call di-gate oleh flag ini
  - _Kenapa penting:_ Bisa diaktifkan kapan saja tanpa ubah code
  - _DoD: Checkout disabled, pricing visible_ ✓
- [x] **FG3** Checkout `paymentReady` flag — `CheckoutPanelProps.checkoutStatus`
  - _Apa yang dilakukan:_ Tambah prop `checkoutStatus` ke CheckoutPanel — "coming_soon" atau "ready"
  - _Kenapa penting:_ Checkout button disabled dengan badge "Coming Soon" saat gateway belum aktif
  - _DoD: Checkout shows "Coming Soon" state_ ✓

### 7.4 Duitku Provider Migration — ⬜ BELUM

> **Apa ini:** Ganti payment provider dari iPaymu (yang belum functional) ke Duitku. Duitku
> sudah punya BI license, sandbox, dan API docs. QRIS fee 0.7%. Tidak ada cancel API —
> rely on expiry. Callback format: `x-www-form-urlencoded` (bukan JSON).
>
> Dependency graph: D1 → D2 → D3 → D4 → D5 → D7 → D8 (D6独立, bisa kapan saja)

- [x] **D1** Duitku signature module — `lib/billing/providers/duitku-signature.ts`
  - _Apa yang dilakukan:_ Buat module HMAC-SHA256 signing untuk Duitku API requests dan callback verification
  - _Kenapa penting:_ Duitku butuh signature di setiap request API — tanpa ini tidak bisa authenticate
  - _DoD: Signature tests pass, cross-verified with openssl_ ✓ (commit `e884f2a`)
- [ ] **D2** Duitku provider adapter — `lib/billing/providers/duitku.ts`
  - _Apa yang dilakukan:_ Implement `PaymentProvider` interface untuk Duitku — `createPayment()`, `getPaymentStatus()`, `cancelPayment()`, `verifyCallback()`
  - _Kenapa penting:_ Provider bisa buat pembayaran, cek status, dan verifikasi callback dari Duitku
  - _DoD: Adapter functional, signature verified_
- [ ] **D3** Duitku webhook route — `app/api/webhooks/duitku/route.ts`
  - _Apa yang dilakukan:_ Buat POST handler untuk terima callback `x-www-form-urlencoded` dari Duitku, validasi signature, process callback
  - _Kenapa penting:_ Server bisa terima notifikasi pembayaran dari Duitku saat user bayar
  - _DoD: Webhook route functional_
- [ ] **D4** Update provider factory + contracts — `providers/index.ts`, `contracts.ts`
  - _Apa yang dilakukan:_ Update provider factory — pilih Duitku atau iPaymu berdasarkan env var `DUITKU_MERCHANT_CODE`
  - _Kenapa penting:_ Bisa switch provider tanpa ubah code lain — tinggal set env var
  - _DoD: Provider selection functional_
- [ ] **D5** Server payment processing updates — `server/payments.ts`, `server/purchases.ts`
  - _Apa yang dilakukan:_ Tambah `processDuitkuCallback()`, update env var reads untuk Duitku
  - _Kenapa penting:_ Payment processing support Duitku — callback bisa diproses dengan benar
  - _DoD: Payment processing functional_
- [ ] **D6** Environment config — `.env.local`
  - _Apa yang dilakukan:_ Setup env vars: `DUITKU_MERCHANT_CODE`, `DUITKU_API_KEY`, `DUITKU_BASE_URL`, `DUITKU_CALLBACK_URL`, `DUITKU_RETURN_URL`
  - _Kenapa penting:_ App bisa connect ke Duitku API
  - _DoD: Env vars configured_
- [ ] **D7** Duitku sandbox verification — `scripts/test-duitku-sandbox-flow.mjs`
  - _Apa yang dilakukan:_ Buat script test end-to-end: inquiry → redirect → callback → verification di Duitku sandbox
  - _Kenapa penting:_ Buktikan seluruh flow jalan di Duitku sandbox sebelum production
  - _DoD: Sandbox flow passes_
- [ ] **D8** iPaymu cleanup — delete `ipaymu.ts`, `ipaymu-signature.ts`, legacy webhook route
  - _Apa yang dilakukan:_ Hapus file iPaymu yang sudah tidak dipakai
  - _Kenapa penting:_ Tidak ada dead code, codebase bersih
  - _DoD: iPaymu files removed, no dead code_

### 7.5 Post-MVP — ⬜ DEFERRED

> **Apa ini:** Tasks penting tapi tidak mendesak. Dikerjakan setelah Duitku verified di
> production. Butuh production data untuk validasi.

- [ ] **I7** Reconciliation & refund — reconcile stale pending payments
  - _Apa yang dilakukan:_ Cek pembayaran yang stuck di "pending" terlalu lama, sync dengan data Duitku
  - _Kenapa di-defer:_ Butuh production data untuk validasi
  - _DoD: Stale payments reconciled_
- [ ] **I8** Analytics + Resend confirmation email — funnel events + transactional email
  - _Apa yang dilakukan:_ Buat analytics dashboard + kirim email konfirmasi via Resend
  - _Kenapa di-defer:_ Butuh production data untuk tau funnel mana yang perlu diperbaiki
  - _DoD: Analytics dashboard functional, emails sent_
- [ ] **U9** Legal copy — terms, refund policy, contact info
  - _Apa yang dilakukan:_ Tulis syarat & ketentuan, kebijakan refund, info kontak
  - _Kenapa di-defer:_ Menunggu input dari user tentang kebijakan bisnis
  - _DoD: Legal copy complete_
- [ ] **U10** UI verification & handoff — final QA
  - _Apa yang dilakukan:_ Verifikasi semua payment UI berfungsi
  - _Kenapa di-defer:_ Dilakukan setelah semua task lain selesai
  - _DoD: All payment UI verified_

---

## Phase 8 — QA & Ship

- [x] **8.1 Responsive sweep** — semua routes di 320/390/768/1024/1440
  - _DoD: tanpa horizontal scroll, viewport yang benar tampil_ ✓ (65/65 tests passed: 50 public + 15 protected)

- [x] **8.2 Visual diff vs canvas** — screenshot tiap route, bandingkan dengan artboard
  - _DoD: Selisih yang disengaja terdokumentasi_ ✓ (12/12 routes compared, intentional differences documented)

- [x] **8.3 A11y pass** — focus-visible, aria, alt text, prefers-reduced-motion
  - _DoD: Keyboard-only bisa navigasi semua halaman_ ✓ (13/13 axe-core + keyboard tests passed)

- [ ] **8.4 Vercel deployment (Free tier)**
  - Connect GitHub repo ke Vercel
  - Setup environment variables
  - Custom domain (tutorlog.id)
  - _DoD: Deploy ke Vercel, semua routes jalan_
  - _Catatan: Migrasi ke SumoPod VPS (Rp 60rb/bulan) saat scale up. App code tidak berubah, hanya deployment workflow._

- [x] **8.5 Update docs** — sinkronkan SPEC.md + TASKS.md + README
  - _DoD: Dokumen up-to-date_ ✓ (SPEC.md rewritten for Next.js, README.md updated, TASKS.md current)
