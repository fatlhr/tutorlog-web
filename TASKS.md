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
- **Deployment:** Cloudflare Workers Free + OpenNext → Workers Paid/managed runtime (saat scale up)
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
| 7 | `/legal` | ✅ | ✅ | Static |
| 8 | `/privacy` | ✅ | ✅ | Static |
| 9 | `/terms` | ✅ | ✅ | Static |
| 10 | `/account` | ✅ | ✅ | Static |
| 11 | `/kontak` | ✅ | ✅ | Static |
| 12 | `/app` (home) | ⬜ | ⬜ | Protected |
| 13 | `/app/rekap` | ✅ | ✅ | Protected |
| 14 | `/app/invoice` | ✅ | ⬜ | Protected |
| 15 | `/checkout` | ✅ | ✅ | Protected |
| 16 | `/pembayaran/[purchaseId]` | ✅ | ✅ | Protected |

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
- [x] **2.8 Legal hub** — `app/legal/page.tsx`
  - Tiga kartu link penuh menuju `/privacy`, `/account`, dan `/terms`.
  - Jalur penghapusan akun menjelaskan bahwa permintaan bisa diajukan melalui web
    tanpa membuka aplikasi.
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

## Phase 7 — Lynk.id Checkout & Webhook Activation

> **Keputusan provider (2026-08-24):** Pembayaran Plus dilakukan pada halaman produk
> `https://lynk.id/tutorlog`. TutorLog tidak membuat transaksi, memilih metode pembayaran,
> melakukan inquiry, atau membatalkan pembayaran melalui API provider. TutorLog menerima
> event sukses melalui webhook Lynk.id, memverifikasi `X-Lynk-Signature`, mencocokkan
> produk, nominal, dan email akun, lalu mengaktifkan entitlement di Supabase.
>
> Alur gateway lama tetap fail-closed dan tidak menjadi target implementasi. Source lama
> baru dibersihkan setelah webhook Lynk terbukti di production dan tidak ada data historis
> yang masih membutuhkannya.
>
> Design: `docs/superpowers/specs/2026-08-24-lynk-webhook-integration-design.md`
> Plan: `docs/superpowers/plans/2026-08-24-lynk-webhook-integration.md`

### 7.1 Fondasi billing yang dipakai ulang — DONE ✓

- [x] **I1** Shared billing contract — product, purchase, payment, entitlement, access
  - `lib/billing/contracts.ts`, `lib/billing/errors.ts`
  - _DoD: package code dan access state menjadi kontrak bersama_ ✓
- [x] **I2** Billing schema, catalog, RLS, dan launch price
  - `billing_products`, `billing_prices`, `billing_purchases`, `billing_payments`,
    `billing_entitlement_grants`, dan authorization RPC sudah tersedia di Supabase.
  - _DoD: fondasi database live dan user hanya dapat membaca data miliknya_ ✓
- [x] **I3** Atomic entitlement projection
  - `apply_billing_paid_event`, `billing_access_status_for_user`, dan
    `authorize_feature_export` tetap menjadi authority untuk masa aktif dan akses ekspor.
  - _DoD: term renewal, lifetime, legacy grant, dan server authorization tersedia_ ✓
- [x] **I4** Public catalog dan access surfaces
  - `/harga`, pricing cards, Profile access summary, paywall, dan export gate sudah ada.
  - _DoD: paket dan status akses dapat ditampilkan tanpa provider aktif_ ✓

### 7.2 Produk Lynk.id — PUBLISHED, INTEGRASI BELUM

- [x] **L0** Publikasikan tiga produk di `https://lynk.id/tutorlog`
  - `plus_30d` → `https://lynk.id/tutorlog/q51pn0rykvq9` → Rp19.000
  - `plus_12m` → `https://lynk.id/tutorlog/gjvmgkznjqd6` → Rp149.000
  - `plus_lifetime` → `https://lynk.id/tutorlog/65p8z7ewqj8r` → Rp249.000
  - Deskripsi checkout meminta pembeli memakai email yang sama dengan akun TutorLog.
  - _DoD: ketiga produk tampil publik dengan judul, harga, dan cover yang benar_ ✓
- [ ] **L1** Bekukan kontrak payload webhook dari bukti nyata
  - Deploy endpoint capture-only yang tidak dapat menerbitkan entitlement.
  - Simpan URL webhook dari akun Lynk `@tutorlog`, ambil merchant key, lalu jalankan
    `Test URL`.
  - Catat bentuk nyata `message_id`, `refId`, `grandTotal`, customer email, timestamp,
    dan identitas item. Redact nama, email, telepon, signature, dan merchant key dari fixture.
  - _DoD: fixture payload nyata dan field mapping direview; tidak ada akses yang diberikan_
- [ ] **L2** Signature verification — `lib/billing/providers/lynk-signature.ts`
  - Validasi lower-hex SHA-256 dari `grandTotal + refId + message_id + merchantKey`.
  - Gunakan constant-time comparison dan tolak header hilang, field ambigu, atau signature salah.
  - _DoD: deterministic contract test lulus untuk valid, mismatch, malformed, dan missing secret_
- [ ] **L3** Webhook payload parser — `lib/billing/providers/lynk-webhook.ts`
  - Hanya terima `payment.received` dengan status sukses dari payload yang sudah dibuktikan.
  - Map identitas item stabil ke package code. Jika payload tidak menyediakan item ID stabil,
    gunakan allowlist judul kanonis + nominal dan tandai perubahan sebagai `needs_review`.
  - _DoD: unknown event, unknown product, multi-item, dan amount mismatch tidak mengaktifkan Plus_
- [x] **L4** Atomic webhook inbox dan entitlement processing
  - Tambahkan migration `202608240001_lynk_webhook_flow.sql`.
  - Simpan event sebelum diproses; unique key memakai `message_id` dan/atau `refId` sesuai
    bukti payload. Event duplikat harus menghasilkan satu purchase, satu payment, satu grant.
  - Lookup `auth.users` memakai email ternormalisasi. Email yang tidak ditemukan atau ambigu
    masuk `needs_review`; webhook tidak membuat akun baru.
  - _DoD: processed, duplicate, unmatched user, unknown product, amount mismatch, dan DB retry teruji_
  - _Verified 2026-08-26: migration remote applied; synthetic QA processed, replay by event/ref,
    review outcomes, 30-day entitlement, private inbox access, dan account-deletion cascade lulus.
    Seluruh user dan row QA telah dibersihkan._
- [ ] **L5** Public webhook route — `POST /api/webhooks/lynk`
  - Verifikasi signature sebelum mutasi database.
  - `200` untuk processed/duplicate/needs-review yang sudah tercatat, `400` untuk payload
    malformed, `401` untuk signature invalid, dan `503` untuk kegagalan sementara.
  - Response dan log tidak boleh membocorkan email, telepon, raw payload, atau secret.
  - _DoD: route contract lulus pada Next.js dan runtime Cloudflare preview_
- [x] **L6** Arahkan CTA pricing ke checkout Lynk
  - `/harga` dan paywall memakai URL produk Lynk berdasarkan package code.
  - Tampilkan pengingat untuk menggunakan email akun TutorLog saat checkout.
  - `/checkout` dan `/pembayaran/[purchaseId]` tidak dipakai untuk transaksi Lynk baru.
  - _DoD: seluruh CTA mengarah ke produk yang benar dan tidak ada payment creation internal_ ✓
  - _Verified 2026-08-27: lint, build, test-billing-ui-contract, dan test-lynk-parser-contract
    lulus. Browser QA `/harga` di 390px dan 1440px: ketiga CTA berbayar buka
    `lynk.id/tutorlog/{q51pn0rykvq9,gjvmgkznjqd6,65p8z7ewqj8r}` di tab baru dengan
    `target=_blank rel=noopener noreferrer`, Free tetap ke `/login`, tidak ada overflow
    horizontal, keyboard focus (real Tab key) menunjukkan outline solid terlihat jelas, dan
    klik CTA memicu POST `/api/analytics` (`package_selected`). Ketiga halaman produk publik
    Lynk menampilkan judul dan harga fixed yang benar (Rp19.000/Rp149.000/Rp249.000)._
- [ ] **L7** Environment dan dashboard configuration
  - Cloudflare secret: `LYNK_MERCHANT_KEY`.
  - Runtime flags: `LYNK_WEBHOOK_ENABLED=false` dan `LYNK_WEBHOOK_CAPTURE_ONLY=true`
    saat contract capture; production processing hanya aktif setelah fixture direview.
  - Webhook URL: `https://tutorlog.id/api/webhooks/lynk` pada akun `@tutorlog`.
  - _DoD: secret tidak ada di repo/log dan Test URL tercatat di Webhook History_
- [ ] **L8** End-to-end verification
  - Jalankan transaksi riil paket 30 Hari dengan akun test yang sudah ada di Supabase.
  - Verifikasi purchase/payment/grant, masa aktif 30 hari, Profile, dan export authorization.
  - Replay event yang sama dan pastikan masa aktif tidak bertambah dua kali.
  - Uji email tidak terdaftar serta nominal/produk tidak cocok dan pastikan masuk review.
  - _DoD: satu pembayaran sukses menghasilkan tepat satu entitlement pada production_
- [ ] **L9** Retire legacy gateway path
  - Hapus provider adapter, callback route, env, polling, cancel, dan checkout internal yang
    tidak lagi memiliki consumer setelah data historis diaudit.
  - Pertahankan kemampuan membaca row historis sampai migration/retention diputuskan.
  - _DoD: source runtime tidak memanggil gateway lama dan billing contract tests tetap lulus_

### 7.3 Operasional dan post-MVP — ⬜ DEFERRED

- [ ] **O1** Reconciliation
  - Bandingkan Orders/export Lynk dengan webhook inbox dan billing payments secara berkala.
  - Sediakan retry terkontrol untuk event `needs_review`; retry tetap idempotent.
  - _DoD: missing/mismatched order dapat ditemukan tanpa inquiry API provider_
- [ ] **O2** Refund handling
  - Refund diproses lewat Lynk sesuai kebijakannya, lalu entitlement direview/revoke manual
    sampai Lynk menyediakan event refund yang sudah diverifikasi.
  - _DoD: setiap refund punya evidence reference dan audit trail_
- [ ] **O3** Analytics dan confirmation email
  - Catat checkout outbound, webhook processed, activation success, dan needs-review.
  - Kirim email konfirmasi hanya setelah entitlement berhasil dibuat.
  - _DoD: kegagalan email tidak membatalkan entitlement_
- [ ] **O4** Legal dan support copy
  - Sinkronkan terms, privacy, refund, dan contact dengan Lynk sebagai checkout/payment processor.
  - _DoD: legal copy konsisten dengan produk Lynk dan Data Safety sebelum promosi payment_
- [ ] **O5** Payment UI verification dan handoff
  - Verifikasi CTA, external navigation, status akses, support fallback, dan mobile handoff.
  - _DoD: flow nyata diverifikasi tanpa mengandalkan checkout/status UI lama_

---

## Phase 8 — QA & Ship

- [x] **8.1 Responsive sweep** — semua routes di 320/390/768/1024/1440
  - _DoD: tanpa horizontal scroll, viewport yang benar tampil_ ✓ (65/65 tests passed: 50 public + 15 protected)

- [x] **8.2 Visual diff vs canvas** — screenshot tiap route, bandingkan dengan artboard
  - _DoD: Selisih yang disengaja terdokumentasi_ ✓ (12/12 routes compared, intentional differences documented)

- [x] **8.3 A11y pass** — focus-visible, aria, alt text, prefers-reduced-motion
  - _DoD: Keyboard-only bisa navigasi semua halaman_ ✓ (13/13 axe-core + keyboard tests passed)

- [x] **8.4 Cloudflare Workers deployment (Free tier + OpenNext)**

  > **Keputusan deployment:** TutorLog Web dipindahkan dari target Vercel → SumoPod
  > menjadi Cloudflare Workers sebagai runtime production default. Supabase tetap menjadi
  > database, Auth, RPC, dan Storage karena database tersebut dipakai bersama mobile app.
  > Kita tidak memindahkan schema ke D1 atau object storage ke R2 dalam task ini.

  > **Target arsitektur:** Browser/mobile client → Cloudflare DNS/TLS/CDN → Cloudflare
  > Worker (Next.js melalui `@opennextjs/cloudflare`) → Supabase Auth/Postgres/Storage.
  > Checkout dibuka di Lynk.id dan event transaksi sukses masuk kembali melalui webhook
  > Worker. Halaman public yang statis dilayani sebagai asset; route protected, Server
  > Actions, Route Handlers, dan webhook berjalan sebagai Worker request.

  > **Target biaya awal:** Cloudflare Workers Free, selama penggunaan tetap di bawah
  > 100.000 request/hari dan request dynamic tidak konsisten melewati batas 10 ms CPU.
  > Static asset requests tidak menjadi batas utama. Domain, Supabase, serta fee platform
  > dan transaksi Lynk tetap merupakan komponen terpisah dari biaya Workers.

  #### 8.4.1 Prasyarat dan keputusan scope

  - [x] Pastikan akun Cloudflare aktif dan zone `tutorlog.id` dapat dikelola dari Cloudflare.
  - [x] Pastikan repository GitHub dan branch deploy sudah ditentukan. Branch production
    menggunakan alur repo yang berlaku: feature/fix → `develop` → production setelah
    verifikasi, bukan direct edit pada `develop` untuk application code.
  - [x] ~~Pertahankan Vercel deployment terakhir sebagai rollback target~~ — **N/A,
    tidak ada yang bisa dipertahankan.** Dicek langsung lewat `vercel project ls` /
    `vercel domains inspect tutorlog.id` (CLI ter-autentikasi sebagai `fatlhr`, team
    `fatihs-personal-web`): tidak ada project `tutorlog-web` dan domain `tutorlog.id`
    tidak terdaftar di Vercel manapun yang terlihat dari akun ini. Tidak ada
    `vercel.json`, `.vercel/project.json`, atau commit apapun di branch manapun yang
    pernah menghubungkan repo ini ke project Vercel. Baris ini sebelumnya sempat
    tercentang `[x]` di sesi lain padahal isinya sendiri bilang "belum diverifikasi" —
    kontradiksi itu sekarang diperbaiki. Rollback plan yang beneran ada: lihat 8.4.6
    dan 8.4.8.
  - [x] Tetapkan `tutorlog.id` sebagai custom domain Worker production dan gunakan
    `*.workers.dev` hanya untuk preview/canary.
  - [x] Jangan mengaktifkan pemrosesan webhook hanya karena hosting sudah berpindah.
    Aktivasi entitlement tetap menunggu capture payload, merchant key, signature test,
    dan transaksi end-to-end Lynk yang terverifikasi.

  #### 8.4.2 Tambahkan adapter dan konfigurasi Worker — DONE ✓

  - [x] Tambahkan `@opennextjs/cloudflare` sebagai dependency build dan `wrangler` sebagai
    devDependency pada `package.json`. Next.js dan `eslint-config-next` sekalian dinaikkan
    16.2.10 → 16.2.12 (exact pin dipertahankan) karena peer range `@opennextjs/cloudflare`
    mengecualikan 16.2.10 spesifik (butuh >=16.2.11).
  - [x] Tambahkan `wrangler.jsonc` di root dengan konfigurasi minimal:
    `main: ".open-next/worker.js"`, assets directory `.open-next/assets`, binding
    `ASSETS`, `compatibility_flags: ["nodejs_compat"]`, dan compatibility date yang
    memenuhi minimum OpenNext.
  - [x] Tambahkan `open-next.config.ts` menggunakan `defineCloudflareConfig()`.
  - [x] Tambahkan script yang eksplisit dan dapat diulang:
    - `preview`: build OpenNext lalu jalankan preview dengan runtime `workerd`/Wrangler.
    - `deploy`: build OpenNext lalu deploy ke Worker target.
    - `cf-typegen`: generate type declaration untuk environment/bindings Cloudflare.
  - [x] Pastikan output `.open-next/`, Wrangler artifacts, dan local Worker variables tidak
    masuk commit jika memang bersifat generated atau secret. `.gitignore` ditambah
    `.open-next/`, `.wrangler/`, `.dev.vars`, `cloudflare-env.d.ts`, `.env.deploy.local`.
    `eslint.config.mjs` juga ditambah `.open-next/**` ke ignore, lint sempat nyisir build
    chunk generated di situ.
  - [x] Jangan menambahkan `output: "export"`; route auth, Server Actions, billing API,
    dan webhook memerlukan runtime server. Dikonfirmasi tidak ada di `next.config.ts`.
  - [x] Audit dependency yang hanya dipakai saat development — `proxy.ts`/`middleware.ts`
    dan `lib/supabase/admin.ts` cuma pakai `@supabase/ssr`/`@supabase/supabase-js`, tidak
    ada Node-only API yang kebawa ke runtime Worker.

  **Catatan blocker yang ditemukan dan diperbaiki:** `@opennextjs/cloudflare` (versi
  1.20.2, per Agustus 2026) belum mendukung `proxy.ts` Next.js 16 — build hard-exit
  dengan pesan "Node.js middleware is not currently supported", karena `proxy.ts` di
  Next 16 selalu compile ke Node.js runtime tanpa cara opt-out (`export const runtime`
  di file proxy malah throw error). Ini bug upstream yang masih terbuka
  ([opennextjs-cloudflare#1277](https://github.com/opennextjs/opennextjs-cloudflare/issues/1277),
  fix real di [PR #1309](https://github.com/opennextjs/opennextjs-cloudflare/pull/1309)
  masih open per pengecekan ini). Solusi: file dikembalikan ke nama lama `middleware.ts`
  (fungsi `middleware`, bukan `proxy`) — nama lama itu masih default ke Edge runtime dan
  Next 16 tetap mendukungnya (dengan warning deprecation). Dikonfirmasi maintainer di
  issue yang sama. Ganti balik ke `proxy.ts` begitu adapter Cloudflare rilis dukungan
  Node middleware.

  **Referensi resmi:**
  - Next.js di Workers: `https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/`
  - Automatic configuration: `https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/`

  #### 8.4.3 Siapkan environment variables dan secrets — SEBAGIAN, LYNK BELUM DIINTEGRASIKAN

  - [x] Pisahkan konfigurasi public/build-time dari secret runtime. Token deploy
    (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) disimpan terpisah di
    `.env.deploy.local` (gitignored), bukan campur ke `.env.local` punya app.
  - [x] Build variables — sudah ada di `.env.local`, otomatis ke-inline `next build`:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - [x] `SUPABASE_SERVICE_ROLE_KEY` di-set via `wrangler secret put` ke
    `tutorlog-web-staging`. Diverifikasi: `/api/products` sempat 500 sebelum secret
    ini di-set (admin client gagal init), 200 setelahnya dengan data katalog asli.
  - [ ] `LYNK_MERCHANT_KEY` — belum tersedia; Lynk menampilkannya setelah URL webhook
    disimpan. Masukkan sebagai Cloudflare secret, tidak boleh menjadi build variable.
  - [ ] `LYNK_WEBHOOK_ENABLED=false` dan `LYNK_WEBHOOK_CAPTURE_ONLY=true` — gunakan saat
    contract capture. Pemrosesan entitlement baru boleh aktif setelah Test URL, signature,
    product mapping, dan idempotency lulus.
  - [x] Semua variable yang diperlukan Next.js tersedia di build phase — dikonfirmasi
    lewat `npm run build` sukses lokal sebelum deploy.
  - [x] Tidak ada secret di `wrangler.jsonc`, `vars`, source code — `SUPABASE_SERVICE_ROLE_KEY`
    dikirim lewat stdin ke `wrangler secret put`, bukan argumen CLI (gak nyangkut shell history).

  #### 8.4.4 Deploy preview dan canary — STAGING LIVE, TERVERIFIKASI PENUH

  - [x] Deploy ke Worker preview `tutorlog-web-staging`, tanpa mengubah DNS production.
    Live: `https://tutorlog-web-staging.fatlhr.workers.dev`.
  - [x] `npm run build` (Next.js) dan `opennextjs-cloudflare build` sukses.
  - [x] Smoke test public routes — semua 200 setelah propagasi cold-start awal:
    `/`, `/login`, `/login/sent`, `/fitur`, `/harga`, `/panduan`, `/privacy`, `/terms`,
    `/account`, `/kontak`. Render visual dicek lewat browser, font/warna/gambar tampil benar.
  - [x] Protected route tanpa session — `/app`, `/app/rekap`, `/app/invoice`, `/checkout`
    semua `307` ke `/login?next=...` dengan path yang benar.
  - [x] Protected route dengan session Supabase nyata — dikonfirmasi manual (Fatih):
    login via magic link sukses, `/app/rekap` (dengan filter tanggal) dan `/app/invoice`
    ke-load dengan data asli. `middleware.ts` (lihat 8.4.2) menahan session dengan benar
    di runtime Worker.
  - [x] Server Action `sendMagicLink` — dicoba lewat browser (submit form di `/login`),
    redirect ke `/login/sent` sukses. Server Action konfirmasi jalan di runtime Worker.
  - [x] Magic Link end-to-end — dikonfirmasi manual (Fatih), klik dari email, session kebentuk.
  - [x] Route Handlers saat deployment awal — `/api/products` (200, data katalog asli via
    admin client), callback gateway lama (503 fail-closed), dan `/api/exports/authorize`
    (200, dipakai alur PDF export). Route `/api/webhooks/lynk` belum dibuat.
  - [x] PDF/CSV export — dikonfirmasi manual (Fatih), download PDF invoice sukses dari
    `/app/invoice`.

  **Catatan insiden — Error 1102 (CPU/resource limit) sekali, tidak reproduksi:**
  Satu request sempat kena `Error 1102: Worker exceeded resource limits` tak lama setelah
  redeploy staging (fix logo). Retry langsung berhasil tanpa perubahan apa pun, dan
  `wrangler tail` selama sesi retry menunjukkan seluruh alur (`/app`, `/app/rekap`,
  `/app/invoice`, `/api/exports/authorize`) sukses bersih. Dugaan kuat: cold start —
  request pertama ke isolate V8 yang baru di-deploy harus compile ulang bundle JS, dan
  itu ikut terhitung sebagai CPU time yang bisa nabrak limit 10ms Free plan pas persis di
  request pertama itu. Bukan bug kode; catat sebagai baseline observasi 8.4.7, pantau
  apakah berulang di production.

  **`env.IMAGES binding is not defined` — FIXED ✓.** Ditambahkan `images.binding: "IMAGES"`
  ke `wrangler.jsonc` sesuai [opennext.js.org/cloudflare/howtos/image](https://opennext.js.org/cloudflare/howtos/image).
  Diverifikasi lewat `wrangler tail`: warning hilang total dari request `/_next/image`
  setelah redeploy staging dan production. Cloudflare Images adalah produk billing
  terpisah dari Workers (gratis sampai 5.000 transformasi unik/bulan, lewat itu
  $0.50/1.000) — inventori gambar situs ini kecil (aset marketing statis), jauh di
  bawah ambang itu, jadi tetap di tier gratis tanpa upgrade plan.

  **`www.tutorlog.id` — FIXED ✓.** Redirect 308 ke apex ditambahkan di `next.config.ts`
  (`has: [{ type: "host", value: "www.tutorlog.id" }]`), dikonfirmasi masuk
  `.next/routes-manifest.json`. Diverifikasi hidup: `curl -I https://www.tutorlog.id/fitur`
  → `308` → `https://tutorlog.id/fitur`.

  **Catatan setup yang gak sesuai dugaan awal:** dialog "Connect domain" / "Add Domain"
  di Workers & Pages **gak bisa nerima subdomain sama sekali** ("No zones match
  www.tutorlog.id"), meski DNS record `www` (CNAME → apex, proxied) udah dibuat duluan.
  CNAME proxied ke apex juga sempat dicoba tapi balikin `522` (Cloudflare gagal proxy ke
  origin, karena record apex tipenya "Worker" khusus, bukan A/AAAA biasa yang bisa
  di-chain). Solusi yang jalan: **Workers & Pages → tutorlog-web → Domains → Add Route**
  (bukan Add Domain), ketik `tutorlog.id` dulu di search buat milih zone, lalu field
  pattern terpisah muncul — defaultnya `*.tutorlog.id/*` (wildcard semua subdomain,
  sengaja dipersempit ke `www.tutorlog.id/*` biar subdomain lain di masa depan gak
  ikut ke-route ke Worker ini tanpa sengaja).

  #### 8.4.5 Integrasi Supabase dan Lynk.id

  - [x] Tambahkan redirect URL Supabase untuk staging:
    `https://tutorlog-web-staging.fatlhr.workers.dev/auth/callback`.
  - [x] Tambahkan production redirect URL Supabase setelah custom domain attach (8.4.6):
    `https://tutorlog.id/auth/callback`.
  - Site URL Supabase sekarang `https://tutorlog.id`. Deep link aplikasi mobile
    `tutorlog://login-callback` tetap dipertahankan di Redirect URLs karena project
    Supabase dipakai bersama aplikasi Flutter. Web mengirim `emailRedirectTo` secara
    eksplisit dari `app/login/actions.ts`; perilaku mobile tetap perlu diverifikasi dari
    repo Flutter sebelum konfigurasi redirect diubah lagi.
  - [ ] Uji query Rekap, RPC billing, RLS, upload logo ke bucket `user-assets`, dan
    operasi admin yang memakai `SUPABASE_SERVICE_ROLE_KEY` dari Worker.
  - [ ] Deploy `POST https://tutorlog.id/api/webhooks/lynk` dalam mode capture-only.
  - [ ] Login ke akun Lynk `@tutorlog`, bukan akun personal, lalu simpan URL tersebut pada
    Settings → Integrations → Webhook.
  - [ ] Ambil merchant key setelah URL tersimpan dan masukkan sebagai Cloudflare secret
    `LYNK_MERCHANT_KEY` untuk staging dan production yang relevan.
  - [ ] Jalankan `Test URL`; verifikasi JSON payload nyata, header `X-Lynk-Signature`,
    `message_id`, `refId`, `grandTotal`, customer email, timestamp, dan item identity.
  - [ ] Verifikasi SHA-256, product allowlist, nominal, email lookup, event idempotency,
    redacted logging, dan `needs_review` pada Worker preview.
  - [ ] Jalankan pembelian riil paket 30 Hari dan buktikan satu event menghasilkan tepat
    satu purchase, payment, dan entitlement 30 hari.
  - [ ] Jangan menandai payment flow production selesai hanya dari Test URL. Transaksi riil,
    duplicate replay, unmatched email, dan amount mismatch wajib diverifikasi.

  #### 8.4.6 Custom domain dan cutover production — DONE ✓

  - [x] Worker production `tutorlog-web` di-deploy ke `tutorlog-web.fatlhr.workers.dev`
    (terpisah dari `tutorlog-web-staging`), `SUPABASE_SERVICE_ROLE_KEY` di-set, smoke
    test lolos sebelum custom domain attach.
  - [x] Attach custom domain `tutorlog.id` ke Worker production lewat dashboard
    (Workers & Pages → tutorlog-web → Settings → Domains & Routes), bukan lewat
    `wrangler.jsonc` `routes` — sesuai keputusan supaya titik yang nyentuh DNS zone
    email tetap klik manual yang diawasi, bukan efek samping command rutin.
  - [x] DNS diff dicek sebelum/sesudah lewat `dig`: MX, SPF, DMARC, kedua DKIM record
    (`default._domainkey` milik Mailspace, `resend._domainkey` milik Resend), dan A
    record `mail` — **identik byte-per-byte**, tidak ada yang berubah. Yang nambah cuma
    A+AAAA di apex (IP anycast Cloudflare). `www.tutorlog.id` masih kosong, sesuai
    dugaan bahwa custom domain apex tidak otomatis cover subdomain `www` — di luar
    scope deploy ini.
  - [x] Verifikasi HTTPS: sertifikat valid (`Google Trust Services`, `CN=tutorlog.id`,
    berlaku sampai 17 Nov 2026), diperiksa langsung lewat `openssl s_client`.
  - [x] Smoke test public routes, protected routes, dan API di `https://tutorlog.id`
    — semua identik dengan hasil staging.
  - [x] Redirect URL Supabase production (`https://tutorlog.id/auth/callback`) —
    ditambahkan setelah domain live. Lihat 8.4.5 baris yang sama.
  - [x] Magic Link end-to-end di domain production sungguhan — dikonfirmasi manual
    (Fatih), login di `https://tutorlog.id/login` berhasil.
  - [x] Pantau Worker logs dan error rate pada jam pertama observasi — dipantau aktif
    lewat `wrangler tail` selama redeploy fit-and-finish (images binding, www redirect)
    di sesi ini. Satu `Error 1102` (cold start) sempat terjadi di staging tak lama
    setelah redeploy, tidak reproduksi pada retry — lihat catatan di 8.4.4. Monitoring
    lanjutan pasca-merge tetap disarankan tapi bukan blocker.
  - [x] Rollback Vercel: **sudah diverifikasi, dan jawabannya tidak ada.** Dicek
    lewat `vercel project ls`/`vercel domains inspect tutorlog.id` — tidak ada project
    atau domain Vercel yang cocok di akun manapun yang terlihat dari CLI ini. Konsisten
    dengan fakta bahwa `tutorlog.id` sebelum sesi ini tidak punya A/CNAME apex sama
    sekali — ini kemungkinan besar traffic HTTP pertama yang pernah diarahkan ke domain
    ini, jadi tidak ada "Vercel lama" yang bisa jadi rollback target. Rollback plan
    yang beneran ada dicatat di 8.4.8.

  #### 8.4.7 Batas Free plan dan jalur scale-up

  - [ ] Catat baseline harian untuk dynamic request, CPU time, error 1102, dan error 1027.
  - [ ] Anggap Free plan tidak memenuhi kebutuhan jika request Worker mendekati 100.000/hari,
    dynamic SSR/auth konsisten melewati 10 ms CPU, atau workload melewati batas 50
    subrequests/invocation.
  - [ ] Jika hanya membutuhkan limit compute lebih besar, evaluasi Workers Paid mulai
    dari $5/bulan sebelum memindahkan aplikasi ke VPS.
  - [ ] Jika membutuhkan static egress IP, long-running process, filesystem, atau runtime
    Node penuh, evaluasi kembali opsi managed runtime/VPS. Jangan memaksa semua workload
    masuk ke Worker.
  - [ ] Tetapkan keputusan scale-up berdasarkan metrics nyata, bukan asumsi traffic.

  #### 8.4.8 Rollback dan Definition of Done

  - [x] **Rollback plan (direvisi — Vercel tidak tersedia, lihat 8.4.1 dan 8.4.6):**
    detach custom domain `tutorlog.id` dari Worker `tutorlog-web` lewat Cloudflare
    dashboard (Workers & Pages → tutorlog-web → Settings → Domains & Routes → Remove).
    Itu balikin apex ke kondisi sebelum sesi deploy ini — tidak ada A/AAAA/CNAME apex,
    domain unreachable, tapi `*.workers.dev` tetap hidup untuk debug tanpa terburu-buru.
    Supabase dan data billing tidak tersentuh sama sekali oleh langkah ini, tidak ada
    migrasi schema yang perlu dibalik.
  - [ ] Sebelum rollback endpoint webhook, nonaktifkan atau ganti URL webhook pada akun Lynk
    `@tutorlog` agar transaksi baru tidak dikirim ke endpoint yang sudah tidak tersedia.
  - [x] Jalankan `git diff --check` dan review file config/generated yang ikut berubah.
  - [x] Jalankan lint, TypeScript check, production build, Cloudflare preview, dan smoke
    test pada Worker runtime sesuai approval QA.
  - [ ] DoD deployment:
    - Semua public routes dapat dibuka melalui `tutorlog.id`.
    - Protected routes menolak anonymous request dan menerima Supabase session yang valid.
    - Magic Link callback berhasil membentuk session pada domain production.
    - Rekap, Invoice, CSV, dan client-side PDF tetap berfungsi.
    - Webhook Lynk fail closed saat secret atau processing flag belum siap.
    - Test URL dan transaksi riil Lynk berhasil melewati signature verification, product/email/
      amount validation, idempotency, dan entitlement RPC pada runtime Cloudflare.
    - Tidak ada secret di repository atau response/log yang dapat diakses user.
    - ~~Vercel rollback target masih tersedia~~ — N/A, tidak ada project Vercel yang
      bisa dijadikan target (lihat 8.4.1). Rollback real: detach custom domain dari Worker.

  **Status evidence yang harus dilampirkan pada completion note:**
  - Worker name, environment, deployment URL, dan custom domain.
  - Commit/branch yang dideploy.
  - Hasil build, typecheck, lint, preview, dan smoke test.
  - Hasil verifikasi Supabase Auth redirect serta webhook/transaksi riil Lynk.
  - Snapshot metrics Free plan pada periode observasi awal.

- [x] **8.5 Update docs** — sinkronkan SPEC.md + TASKS.md + README
  - _DoD: Dokumen up-to-date_ ✓ (SPEC.md rewritten for Next.js, README.md updated, TASKS.md current)

- [ ] **8.6 Domain, email, dan transactional mail**

  > Domain `tutorlog.id` sudah dibeli di DomaiNesia, nameserver sudah dipindah ke
  > Cloudflare, dan email dikirim lewat Resend SMTP. Supabase built-in SMTP tidak
  > dipakai karena batasnya 2 email/jam dan hanya ke alamat anggota team project,
  > yang berarti magic link tidak akan sampai ke user manapun di production.

  #### 8.6.1 Domain dan DNS — DONE ✓

  - [x] Registrasi `tutorlog.id` di DomaiNesia (Rp219.000/tahun) + addon Mailspace 2 mailbox.
  - [x] Nameserver dipindah ke Cloudflare (`julian.ns.cloudflare.com`, `nadia.ns.cloudflare.com`).
  - [x] Record email direplikasi ke Cloudflare: MX `mx8.mailspace.id`, SPF root,
        DKIM `default._domainkey`, A record `mail` (DNS only, proxy OFF).
  - [x] Mailbox `halo@tutorlog.id` (publik) dan `admin@tutorlog.id` (privat, tidak
        pernah dipublikasikan) dibuat. Kuota terpakai penuh 2/2.

  #### 8.6.2 Resend transactional mail — DONE ✓

  - [x] Domain `tutorlog.id` terverifikasi di Resend (region Tokyo `ap-northeast-1`).
  - [x] Record Resend di-push ke Cloudflare via auto-configure: DKIM `resend._domainkey`,
        MX + SPF di subdomain `send`. SPF root milik Mailspace tidak tersentuh karena
        Resend memakai subdomain terpisah, jadi tidak perlu digabung.
  - [x] Supabase custom SMTP diarahkan ke `smtp.resend.com:465`. Sender awalnya
        `noreply@tutorlog.id`, lalu diganti ke `halo@tutorlog.id` — lihat 8.6.6.
  - [x] Magic link terverifikasi sampai ke Gmail eksternal dengan TLS.

  #### 8.6.3 Template email — HTML SIAP, BELUM DIPASANG

  - [x] Template dibuat di `supabase/email-templates/` (`confirm-signup.html`,
        `magic-link.html`, `_preview.html`, `README.md`). Table-based, CSS inline,
        wordmark teks tanpa gambar, warna eksplisit untuk menahan auto-dark-invert.
  - [ ] Paste `confirm-signup.html` ke Supabase → Authentication → Emails → Templates
        (**Confirm signup**), subject `Konfirmasi email kamu di TutorLog`.
  - [x] Paste `magic-link.html` ke template **Magic Link**. ✓
        Dua-duanya wajib: `app/login/actions.ts` memakai `signInWithOtp` tanpa
        `shouldCreateUser: false`, jadi user baru memicu Confirm signup dan user lama
        memicu Magic Link.
  - [x] Header email diverifikasi lewat Gmail Show original: `dkim=pass` dengan
        `header.i=@tutorlog.id header.s=resend`, `spf=pass` via `send.tutorlog.id`,
        `dmarc=pass` dengan `header.from=tutorlog.id`. From terbaca
        `TutorLog <halo@tutorlog.id>`, preheader tampil di baris pertama. ✓
  - [ ] Verifikasi dark mode di Gmail mobile.
  - [x] Verifikasi tombol benar-benar membentuk session di production. Localhost tetap
        perlu diverifikasi terpisah pada 8.6.7. ✓

  #### 8.6.4 Ganti alamat kontak di halaman publik — DONE ✓

  - [x] Ganti `tutorlog.admin@gmail.com` → `halo@tutorlog.id` di:
        `components/content/kontak-content.tsx`, `components/content/privacy-content.tsx`,
        `components/content/terms-content.tsx`, `app/account/page.tsx`, dan `UI_SPECS.md`.
  - [x] Semua halaman publik memakai `halo@`. Alamat `admin@` tidak boleh muncul di
        file manapun yang terbit ke web, karena itu jalur recovery akun vendor.
  - Catatan: perubahan menyentuh halaman privacy dan terms dengan persetujuan yang sudah
    diberikan. Isi kalimat tidak berubah, hanya alamat email.

  #### 8.6.5 Pengetatan DMARC — TERTUNDA SENGAJA

  - DMARC sekarang di `p=none` dengan `rua=mailto:admin@tutorlog.id`. Ini disengaja selama
    masa setup supaya misalignment terlihat dulu, bukan langsung membuang email.
  - [ ] Naikkan ke `p=quarantine` setelah Resend dan Mailspace terbukti lolos alignment
        beberapa minggu tanpa insiden, lalu ke `p=reject`.
  - **Abaikan warning DNS di panel DomaiNesia** yang menyuruh kembali ke `p=reject`
        dengan `rua=mailto:dmarc@tutorlog.id`. DomaiNesia tidak lagi mengelola DNS ini
        (NS sudah di Cloudflare), rekomendasinya template statis yang tidak tahu ada
        Resend, dan mailbox `dmarc@tutorlog.id` tidak ada karena kuota sudah 2/2.
        Laporan DMARC ke alamat itu akan hilang.

  #### 8.6.6 Lubang yang belum ditutup

  - [x] **Sender diganti dari `noreply@tutorlog.id` ke `halo@tutorlog.id`** di Supabase →
        Authentication → Emails → SMTP Settings. ✓

    Alasannya: balasan ke `noreply@` bounce tanpa jejak karena alamat itu tidak punya
    mailbox, dan orang tetap membalas email otomatis. Dua jalan keluar lain sudah dicek
    dan dua-duanya buntu:

    - Forwarder `noreply@` → `halo@` **tidak mungkin**. Forwarding di Mailspace adalah
      setelan keluar dari mailbox yang sudah ada (Manage → Forwarding), bukan alat
      membuat alias tanpa mailbox. Kuota sudah 2/2 dan catch-all tidak tersedia.
    - **Reply-To tidak ada** di SMTP settings Supabase. Yang tersedia hanya Sender Email
      dan Sender Name. Reply-To hanya bisa lewat Send Email Auth Hook, yang berarti
      menulis edge function sendiri. Tidak sepadan.

    Autentikasi tidak terpengaruh: Resend memverifikasi domain, bukan alamat individual.
    DKIM `resend._domainkey` menandatangani `d=tutorlog.id`, jadi alignment DMARC tetap lolos.

  - [x] Verifikasi header email melalui Gmail → Show original: `SPF`, `DKIM`, dan
        `DMARC` ketiganya `PASS`. ✓
  - [ ] Akun Cloudflare, Resend, dan DomaiNesia masih terdaftar dengan Gmail pribadi.
        Pindahkan ke `admin@tutorlog.id` setelah zone stabil, satu per satu sambil
        memastikan akses tetap jalan. Jangan lakukan di tengah setup DNS.
  - [ ] Pastikan akun vendor yang menyimpan konfigurasi pembayaran menggunakan jalur recovery
        `admin@tutorlog.id`; email publik/support tetap `halo@tutorlog.id`.
  - Foto profil pengirim di Gmail (BIMI) tidak dikejar. Butuh sertifikat VMC/CMC
        USD 650–1.100 per tahun plus DMARC di enforcement. Tidak sepadan untuk tahap ini.

  #### 8.6.7 URL Configuration dan verifikasi redirect

  Kondisi sekarang di Supabase → Authentication → URL Configuration:

  - Site URL: `https://tutorlog.id`
  - Redirect URLs mencakup `tutorlog://login-callback`,
    `https://tutorlog.id/auth/callback`, `http://localhost:3000/auth/callback`, staging,
    serta wildcard localhost/127.0.0.1 untuk development.

  Satu email tes menunjukkan `redirect_to=tutorlog://login-callback`. Karena Site URL
  sudah mengarah ke web, kemungkinan besar email itu diminta dari aplikasi Flutter yang
  mengirim `emailRedirectTo` sendiri, bukan dari web. Kalau begitu, perilakunya benar.
  Belum dipastikan, dan cara memastikannya ada di langkah verifikasi di bawah.

  Catatan tentang aplikasi mobile: keberadaan `tutorlog://login-callback` di daftar
  Redirect URLs menunjukkan aplikasi Flutter mengirim `emailRedirectTo` secara eksplisit,
  bukan mengandalkan fallback Site URL. Kalau benar, Site URL boleh diarahkan ke web
  tanpa mematikan login mobile. Konfirmasi di repo Flutter sebelum mengandalkan asumsi ini.

  - [x] Tambahkan `http://localhost:3000/auth/callback` ke Redirect URLs. ✓
  - [ ] Jalankan `npm run dev`, minta magic link dari `/login` di browser, lalu periksa
        `redirect_to` di URL email. Harus terbaca `http://localhost:3000/auth/callback`.
  - [ ] Klik tombol, pastikan session terbentuk dan redirect ke `/app` berhasil.

- [ ] **8.7 Halaman legal dan URL untuk Play Store**

  > Semua URL di bawah sudah live di `tutorlog.id` dan diverifikasi 200. Bagian ini
  > mencatat mana yang dipakai di Play Console dan dua celah yang perlu ditutup sebelum
  > submit.

  #### 8.7.1 GitHub Pages lama dimatikan — DONE ✓

  - [x] GitHub Pages sebelumnya aktif dan deploy dari `main` ke
        `https://fatlhr.github.io/tutorlog-web/`. Itu sisa setup lama waktu `main` masih
        berisi legal pages statis — kemungkinan besar itulah "production legal web" yang
        dimaksud dokumen lama. Setelah `main` berisi source Next.js, Pages malah
        me-render `README.md` lewat Jekyll dan menghasilkan halaman tanpa guna.
  - [x] Dimatikan lewat `gh api -X DELETE repos/fatlhr/tutorlog-web/pages`. Dikonfirmasi
        API balik 404. `cname` sebelumnya `null`, jadi tidak pernah menyentuh
        `tutorlog.id` — mematikannya tidak berpengaruh ke production.
  - [x] Efek samping yang hilang: tiap push ke `main` tidak lagi memicu build Pages
        yang sia-sia, dan tidak ada lagi duplikat konten yang bisa terindeks.

  #### 8.7.2 URL untuk Play Console

  Semua diverifikasi `200` pada 2026-08-20:

  | Field Play Console | URL |
  |---|---|
  | Privacy Policy (wajib) | `https://tutorlog.id/privacy` |
  | Account deletion URL (wajib) | `https://tutorlog.id/account` |
  | Terms of Service | `https://tutorlog.id/terms` |
  | Website / Marketing | `https://tutorlog.id` |
  | Support email | `halo@tutorlog.id` |
  | Support website | `https://tutorlog.id/kontak` |

  `/legal` adalah hub legal publik untuk menu aplikasi, bukan pengganti URL langsung
  Privacy Policy atau Account deletion di Play Console.

  Halaman `/fitur`, `/harga`, `/panduan` hidup tapi bukan untuk form Play Console —
  berguna kalau mau ditautkan dari store listing description.

  Isi `/account` sudah memenuhi syarat Google: menyatakan penghapusan permanen, langkah
  pengajuan jelas, daftar eksplisit data yang dihapus, pengecualian retensi untuk
  kewajiban hukum, estimasi maksimal 7 hari, dan bisa diakses tanpa login.

  #### 8.7.3 Store Listing Contact Details — BELUM DIVERIFIKASI

  - [ ] Ganti email Store Listing dari `admin@tutorlog.id` menjadi `halo@tutorlog.id`.
  - [ ] Biarkan field Phone kosong.
  - [ ] Ganti Website dari GitHub Pages lama menjadi `https://tutorlog.id`.
  - [ ] Verifikasi sesudah disimpan bahwa Privacy Policy tetap memakai `/privacy` dan
        Data Safety Account Deletion tetap memakai `/account`.

  #### 8.7.4 Dua celah sebelum submit — BELUM

  - [ ] **Penghapusan akun dari dalam aplikasi.** Sejak 2024 Google tidak cukup dengan
        URL penghapusan; aplikasi yang bisa membuat akun juga wajib menyediakan
        penghapusan akun di dalam aplikasi. Halaman `/account` memenuhi bagian URL-nya,
        tapi kalau app Flutter belum punya menu hapus akun, itu bisa jadi alasan
        penolakan review terpisah. Belum bisa diverifikasi dari repo ini — repo Flutter
        tidak ada di sini. Cek sebelum submit.
  - [ ] **Konsistensi privacy policy dengan Data Safety form.** `/privacy` punya 4
        bagian (data yang dipakai, penggunaan lokasi, penyimpanan dan keamanan, retensi
        dan penghapusan) tapi belum menyebut eksplisit berbagi data ke pihak ketiga:
        Supabase sebagai penyimpanan, dan Lynk sebagai checkout/pemroses pembayaran. Data Safety
        form di Play Console menanyakan itu, dan idealnya isinya konsisten dengan
        privacy policy. Belum mendesak karena payment belum aktif (lihat 8.4.3), tapi
        wajib disamakan sebelum `BILLING_PAYMENT_PROVIDER_ENABLED=true`.

---

## Phase 9 — Post-MVP Landing Conversion — ⬜ DEFERRED

> Mulai setelah MVP saat ini selesai diluncurkan dan landing baseline sudah stabil.
> Phase ini tidak memblokir payment, deployment, atau launch MVP.

- [ ] **9.1 Interactive product demo in landing hero**
  - _Apa yang dilakukan:_ Ganti proof HP statis menjadi mini-demo inline yang stateful dengan alur `sesi hari ini → sesi tersimpan → rekap dan invoice siap`.
  - _Interaction contract:_ Maksimal dua klik untuk mencapai hasil; semua control yang terlihat harus bekerja; primary CTA tetap menuju Google Play dan secondary CTA memfokuskan demo.
  - _Data contract:_ Gunakan fixture public terkurasi yang sudah ada. Jangan memakai auth, Supabase, API, data user, iframe, atau sandbox aplikasi penuh.
  - _Visual contract:_ Pertahankan warna, typography, dan playful editorial direction TutorLog. Ambil pola interaksi dari Blume tanpa menyalin visual brand atau membuat bezel/notch HP palsu.
  - _Technical direction:_ React client component lokal, CSS Module, existing GSAP hanya jika motion membantu menjelaskan perubahan state, tanpa dependency baru.
  - _Accessibility:_ Seluruh interaksi tersedia lewat keyboard, memiliki focus-visible, status perubahan diumumkan secara wajar, dan menghormati `prefers-reduced-motion`.
  - _Responsive contract:_ Tidak ada horizontal scroll pada 320, 375, 414, 768, dan 1440 px; demo tetap dapat dipahami pada layar kecil.
  - _Out of scope:_ Live app embedding, editable form lengkap, auth flow, data persistence, backend mutation, dan reproduksi tampilan Blume.
  - _Estimated effort:_ 1,5–2,5 hari development termasuk focused contract test dan visual QA setelah test/QA diapprove.
  - _Planning gate:_ Buat implementation plan baru saat Phase 9 diaktifkan agar mengikuti struktur landing, token, dan component ownership terbaru.
  - _DoD:_ User dapat menyelesaikan demo dua klik dengan mouse atau keyboard, melihat hubungan sesi ke rekap/invoice, lalu memilih CTA Google Play tanpa dead control atau perubahan business logic.
