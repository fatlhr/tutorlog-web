# UI_SPECS.md — TutorLog Web

> Source of Truth visual untuk Coding Agent. Diekstrak dari desain Claude Design project
> `15f274d1-520c-446f-b5a0-f42966793522` — canvas `TutorLog Web.html` (desktop 1440px) dan
> `TutorLog Web Mobile.html` (mobile 390px). File CSS/JSX asli desain ada di [design/](design/)
> dan sudah disalin verbatim ke `css/tutorlog-web.css` + `css/tutorlog-web-mobile.css`.
>
> **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS v4.
> Lihat [TASKS.md](TASKS.md) untuk tech stack lengkap.
>
> **Strategi CSS:** Design CSS (`tutorlog-web.css`, `tutorlog-web-mobile.css`, `site.css`) tetap
> dipakai apa adanya via `@import`. Design tokens tetap `var(--tw-*)` (CSS custom properties).
> Tailwind dipakai untuk layout utility baru (flex, grid, spacing), BUKAN mengganti class
> `.btn`, `.card`, `.mob-*` dll yang sudah ada di design CSS.
> Aturan di file ini MUTLAK. Kalau ragu, cek `design/*.jsx` — itu spesifikasi markup final.

Nama tema: **"Kawaii Comfort"** — serif hangat + monospace, hijau teal pekat, aksen mint.

---

## 1. Design Tokens

Semua token sudah terdefinisi sebagai CSS custom properties di `css/tutorlog-web.css` `:root`.
SELALU pakai `var(--…)`, JANGAN hardcode hex di markup/CSS baru (kecuali nilai yang memang
literal di desain, mis. gradient constellation).

### 1.1 Warna — Brand & Semantic

| Token | Hex | Pakai untuk | Tailwind approx |
|---|---|---|---|
| `--tw-primary` | `#006C53` | CTA solid, link, ikon aktif, harga | `emerald-800` custom |
| `--tw-primary-dark` | `#00523F` | Hover state primary | — |
| `--tw-primary-soft` | `#8CF6D2` | CTA di atas dark bg, teks aksen dark hero | `teal-200` custom |
| `--tw-primary-container` | `#5EC9A7` | Container aksen | — |
| `--tw-secondary` | `#635880` | Aksen ungu sekunder | — |
| `--tw-secondary-soft` | `#D7F4EA` | Bg ikon fitur, chip, hero soft, callout | — |
| `--tw-secondary-container` | `#DED0FF` | Ikon "lav" variant | — |
| `--tw-tertiary` | `#805346` | Aksen tanah (template Minimal) | — |
| `--tw-tertiary-soft` | `#FFDBD1` | Ikon "warm" variant, chip error bg | — |
| `--tw-error` | `#D9706A` | Error | — |
| `--tw-warning` | `#8A5A00` | Teks quota/warning | — |
| `--tw-warning-soft` | `#FFE3A3` | Bg badge quota (mis. "1×" / "1 tersisa") | — |
| `--tw-info` / `--tw-info-soft` | `#235C8F` / `#D7E9FF` | Info chip; juga aksen template Modern | — |

### 1.2 Warna — Surface & Teks (light)

| Token | Hex | Pakai untuk |
|---|---|---|
| `--tw-bg` | `#F4FAFD` | Background halaman |
| `--tw-surface` | `#FFFFFF` | Kartu, nav, footer |
| `--tw-surface-soft` | `#EDF7F3` | Bg blok sekunder (bank block, email badge, mockup stat) |
| `--tw-surface-container` | `#E8EFF1` | Bg frame luar (body di luar kolom konten), preview wrap |
| `--tw-text` | `#161D1F` | Heading, teks utama |
| `--tw-text-2` | `#3E4944` | Body text |
| `--tw-text-3` | `#6D7A74` | Muted/caption/label |
| `--tw-border` / `--tw-divider` | `#B8CBC4` | Semua border 1–2px |
| `--tw-overlay` | `rgba(22,29,31,.4)` | Scrim dialog generik |

### 1.3 Warna — Dark "Constellation" (hero, login, plan card, legal hero band)

Nilai literal (tidak ada token — salin persis):

- Gradient dasar: `linear-gradient(160deg, #0f2920 0%, #143328 35%, #122a22 60%, #0d1f18 100%)`
  + radial overlay `rgba(20,65,50,.9)` / `rgba(30,55,80,.4)` (lihat `.mob-hero`, `.hero-v2`, `.login-right-v2`).
- Grid pattern: 2 `linear-gradient` garis `rgba(140,246,210,.03)` 1px, `background-size` **40px 40px**
  (mobile) / **60px 60px** (desktop) / **48px 48px** (plan card desktop) — via `::before`.
- Teks di dark: heading `#F5EFE4` (cream), body `rgba(245,239,228,.6)`, muted `rgba(245,239,228,.4)`.
- Glass card: bg `rgba(140,246,210,.06)`, border `1px solid rgba(140,246,210,.15)`,
  `backdrop-filter: blur(20px)`, rotate `-2deg`.
- Partikel: dot `--tw-primary-soft`, glow `box-shadow: 0 0 16px 4px rgba(140,246,210,.3)`.

### 1.4 Tipografi

| Token | Font | Fallback |
|---|---|---|
| `--f-title` | **Courier Prime** 700 | `ui-monospace, monospace` |
| `--f-body` | **Source Serif 4** 400/500/600/700 | `'Source Serif Pro', Georgia, serif` |

Load via Google Fonts:
`https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Source+Serif+4:wght@400;500;600;700&display=swap`
dengan `<link rel="preconnect">` ke `fonts.googleapis.com` + `fonts.gstatic.com` (crossorigin).

**Aturan mutlak:** SEMUA heading, angka statistik, harga, nomor rekening, nomor invoice, label
tab = `--f-title` (monospace). SEMUA body/label/caption = `--f-body` (serif). Tidak ada
sans-serif di mana pun.

Type scale (class util sudah ada di `tutorlog-web.css`):

| Class | Size/LH | Font |
|---|---|---|
| `.tw-display-lg/md/sm` | 40/36/32px · 1.1 | title |
| `.tw-headline-lg/md/sm` | 28/24/22px · ~1.2 | title |
| `.tw-title-lg/md/sm` | 20/18/16px · ~1.3 | title |
| `.tw-body-lg/md/sm` | 16/14/12px · 1.45 | body |
| `.tw-label-lg/md/sm` | 14/13/12px · 1.3 · 700 | body |
| `.tw-caption` / `.tw-helper` | 11px / 12px muted | body |

Ukuran spesifik penting: mobile hero h1 **38px/1.06/-1.2px**; desktop hero h1 **62px/1.05/-1.6px**;
app header h1 desktop **32px**, mobile **24px**; letter-spacing heading selalu negatif (-.2 s/d -1.6px).

### 1.5 Radius

| Token | Nilai | Tailwind |
|---|---|---|
| `--r-xs` | 8px | `rounded-lg` |
| `--r-sm` | 12px | `rounded-xl` |
| `--r-md` | 16px | `rounded-2xl` |
| `--r-lg` | 20px | — |
| `--r-xl` | 24px | `rounded-3xl` |
| `--r-xxl` | 32px | — |
| `--r-full` | 999px | `rounded-full` |

Kartu besar = `--r-xxl` (desktop) / `--r-xl`–`--r-xxl` (mobile). Semua button = `--r-full`.
Input = `--r-md`.

### 1.6 Spacing

Token `--s-xxs..--s-xxxl`: 2, 4, 8, 12, 16, 20, 24, 32px; `--s-page: 20px`.
Padding halaman: mobile **20–24px** horizontal; desktop **96px** (landing/features), **64px**
(nav/footer), app main `32px 64px 56px` (max-width 1200 center).

### 1.7 Shadow

| Konteks | Nilai |
|---|---|
| Card hover (light) | `0 0 20px rgba(0,108,83,.08), 0 8px 24px rgba(0,108,83,.06)` |
| Mobile feature card hover | `0 8px 24px rgba(0,108,83,.08)` + border `rgba(0,108,83,.1)` |
| Glass card (dark) | `0 24px 60px rgba(0,0,0,.3), 0 0 80px rgba(140,246,210,.06)` |
| Login card mobile | `0 32px 80px rgba(0,0,0,.3), 0 0 120px rgba(140,246,210,.06)` |
| Dialog putih | `0 24px 60px rgba(0,0,0,.18)` |
| CTA mint di dark | `0 10px 30px rgba(140,246,210,.2), 0 0 60px rgba(140,246,210,.08)` |
| A4 preview | `0 6px 20px rgba(22,29,31,.08)` |

### 1.8 Z-index skala

Konten hero `10` · partikel `2-3` · glass card `3-5` · float nodes `4-8` · tab bar `20` ·
dialog scrim `15` (dalam shell) · paywall scrim `30` · menu overlay `60`.

---

## 2. Component Styling Rules

Class sudah ada di CSS desain — agen TIDAK menulis ulang style ke Tailwind utilities,
cukup pakai class + struktur markup yang benar. Di Next.js, class ini tetap berfungsi
karena CSS di-import via `globals.css`. Tailwind hanya dipakai untuk layout baru yang
tidak ada di design CSS. Referensi markup: `design/web-mobile-screens.jsx` (mobile),
`design/web-screens.jsx` (desktop), `design/web-shared.jsx` (ikon/atom).

### 2.1 Button (`.btn`)

- Base: inline-flex center, gap 10px, **h 48px**, padding `0 24px`, `--r-full`, `--f-body` 700 15px.
- Varian: `.btn-primary` (bg primary, teks putih, hover `--tw-primary-dark`);
  `.btn-secondary` (transparent, border `2px solid --tw-primary`, teks primary);
  `.btn-ghost` (transparent, teks `--tw-text`).
- Size: `.btn-lg` h 56px/pad 32/16px; `.btn-sm` h 40px/pad 18/13px.
- Active: `transform: translateY(1px)` (`.btn`), `scale(.97)` (`.btn-hero` mobile).
- Di atas dark bg: bg `--tw-primary-soft` + teks `--tw-primary-dark` (bukan primary/putih).
- Ikon dalam button: SVG stroke 2, 14–18px, sebelum `<span>` (atau sesudah untuk iconRight).
- Kalau semantiknya navigasi → pakai `<a class="btn …">` (sudah di-reset `text-decoration` di `site.css`).
- Tailwind approx: `inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-full font-bold text-[15px] transition active:translate-y-px`.

### 2.2 Input & Field (`.input`, `.field`)

- `.input`: h **52px** (desktop) / **48px** (mobile login), border `2px solid --tw-border`,
  `--r-md`, padding `0 18px`, font body 15px. Focus/`.focused`: border `--tw-primary`;
  mobile login menambah ring `box-shadow: 0 0 0 4px rgba(0,108,83,.08)`.
- `.field`: kolom gap 8px; `.lbl` = body 700 13px `--tw-text-2`; `.help` = body 12px `--tw-text-3`.
- Placeholder: `--tw-text-3`.

### 2.3 Card (`.card`, `.stat-card`, `.mob-*-card`)

- `.card`: bg surface, `--r-xxl`, padding 28px. `.card-outlined`: + border 1px `--tw-border`.
- `.stat-card` (desktop): `--r-xxl` pad 24, border transparent → hover border `rgba(0,108,83,.15)`
  + shadow (lihat 1.7), `transition border-color .25s ease, box-shadow .25s ease`.
  Struktur: `.lbl` (uppercase 13px muted) → `.val` (title 40px) → `.foot` (13px, `.accent` hijau).
- Mobile summary/stat: `.mob-summary-card` `--r-xxl` pad 20, border `rgba(0,108,83,.08)`,
  shadow `0 4px 20px rgba(0,108,83,.04)`.
- Hover kartu interaktif mobile: `translateY(-2px)` + shadow, `transition .2s/.25s ease`.
- Tailwind approx card: `bg-white rounded-[32px] p-7 border border-transparent hover:border-emerald-900/15 transition-[border-color,box-shadow] duration-250`.

### 2.4 Chip / Badge (`.chip`, `.mob-chip`)

- `.chip`: inline-flex, h 28px, pad `0 12px`, bg `--tw-secondary-soft`, teks primary 700 12px,
  `--r-full`; `.chip-dot` 6px bulat `currentColor`. Varian `-warn/-info/-error` sesuai token 1.1.
- `.mob-chip` (filter murid): h 30px, border `1.5px --tw-border`, bg surface;
  state aktif `.on` = bg primary, teks putih.

### 2.5 Table (`.table` desktop, `.k/m/mn-table` invoice)

- `th`: body 700 12px uppercase ls .5px `--tw-text-3`, border-bottom 1px divider, pad `14px 16px`.
- `td`: 14px pad 16px, border-bottom `--tw-surface-container`; baris terakhir tanpa border.
- Angka/uang: `<span class="mono">` (`--f-title` 700), kolom `.right` align kanan, tagihan warna primary.

### 2.6 Nav

- **Mobile `.mob-nav`**: pad `14px 20px`; brand mark `.mk` 32px kotak `--r-sm` (logo otter 82%),
  wordmark `.wm` title 700 17px primary. `.mob-nav-dark`: wm → primary-soft, mk bg `rgba(140,246,210,.08)`.
  Hamburger 36px, 3 span 20×2px `--tw-text-2` (dark: `rgba(245,239,228,.65)`).
- **Desktop `.nav-top` / `.nav-top-dark`**: pad `20px 64px` (dark hero: `20px 96px`, absolute top);
  links body 700 14px `--tw-text-2` hover primary; CTA "Masuk" = `.btn .btn-primary .btn-sm`
  (di dark: bg primary-soft + teks primary-dark).
- **App topbar `.app-topbar`** (desktop protected): h 64px, bg gradient putih-hijau tipis, border-bottom;
  nav pill `.active` = bg `--tw-secondary-soft` teks primary; avatar `.av` 32px bulat bg primary-soft
  inisial "RN" title 700 12px `--tw-primary-dark`.
- **Tab bar mobile `.mob-tab-bar`**: fixed bottom (site.css), bg `rgba(255,255,255,.88)` +
  `backdrop-filter blur(20px)`, border-top, pad `6px 0 24px` (safe area), 4 tab:
  Rekap/Invoice/Langganan/Lainnya, ikon 18px + label 10px 700; aktif = teks primary +
  `.tab-ic` bg `--tw-secondary-soft` `--r-sm`.

### 2.7 Footer

- Mobile `.mob-footer`: border-top, pad 24, bg surface; links 2 baris gap `8px 20px` body 700 12px.
- Desktop `.landing-footer`: flex space-between, pad `32px 96px`, bg surface, border-top;
  kiri brand + © , kanan 2 grup link dipisah divider 1×20px.

### 2.8 Dark hero & constellation compositing

Urutan layer (mobile `.mob-hero`, desktop `.hero-v2`, login `.login-right-v2`, legal band):
bg gradient → `::before` grid → partikel (z 2-3) → connection lines SVG (`stroke rgba(140,246,210,.04-.08)` 1px)
→ orb blur (`filter: blur(30-40px)`, `orbPulse`) → rings SVG (`stroke rgba(140,246,210,.06)`)
→ glass card → stat nodes/float icons → konten teks (z 10).
Posisi partikel: HARUS salin persis array di JSX (left/top %, size px, `--pd/--po/--pt`).

### 2.9 Dialog & Paywall

- Mobile "Buka di Desktop" (`.mob-dialog-scrim` > `.mob-dialog-card`): scrim `rgba(0,0,0,.35)`
  fixed; kartu putih `--r-xxl` pad `32px 24px` max-w 340 center, ikon monitor 56px kotak
  `--tw-secondary-soft`, url pill `.mob-dialog-url` (ikon lock hijau + `tutorlog.id`),
  aksi kolom: "Salin Link" primary + "Kembali ke Rekap" ghost. Animasi `fadeScale .35s`.
- Desktop paywall (`.paywall-scrim` > `.paywall-dialog`): scrim `rgba(13,31,24,.65)` +
  `backdrop-filter blur(4px)` + partikel dots via `::before`; dialog 420px `--r-xxl`,
  lock 72px bulat `--tw-secondary-soft` + `lockGlow` infinite; feats list check bulat primary;
  aksi: "Lihat Langganan" primary lg + "Nanti saja" ghost sm. Default hidden; muncul saat
  klik "Export PDF" (lihat `js/site.js`).

### 2.10 Invoice A4 (`.a4`, template `.tpl-klasik/modern/minimal`)

- `.a4`: 594px, aspect `1/1.4142`, bg putih, `--r-md`, pad 42px, font body 11px; watermark
  `.wm-gen` "Generated by TutorLog" italic 9px kanan-bawah.
- Aksen template via CSS var `--acc` (Klasik `#006C53`, Modern `#235C8F`, Minimal `#805346`).
- Data sampel WAJIB dari `design/web-invoices.jsx` `sampleInvoice` (INV-2026/06-014, 8 item,
  subtotal **Rp 1.680.000**, total jam **13,5**).

### 2.11 Logo & brand mark

- File: `assets/tutorlog-logo.png` (otter). Selalu dibungkus `.mk` (kotak radius, bg surface/
  soft, border), img 82% `object-fit: contain`. Ukuran mk: 32 (mobile nav), 40 (desktop nav),
  34 (topbar), 24 (footer mobile), 42 (login panel dark).
- Wordmark selalu "TutorLog" — T dan L kapital, `--f-title` 700.

---

## 3. Responsive & Breakpoints

**Breakpoint tunggal: 768px.** (keputusan final, lihat SPEC.md)

| Range | Sumber desain | Perilaku |
|---|---|---|
| 320–767px | Mobile canvas (artboard 390) | Markup `vp-mobile`. Kolom penuh, max-width 480px center, bg luar `#E8EFF1`. Tab bar fixed bottom di halaman app. |
| 768–1099px (tablet) | Desktop canvas, fluid | Markup `vp-desktop`. `.web-page` fluid 100%; `feature-grid` 2 kolom; hero visual (glass card kanan) hidden <1000px; grid 2-kolom konten → 1 kolom <900px; padding 96px → `clamp(24px, 6vw, 96px)`. |
| 1100–1440px+ | Desktop canvas as-is | 4 kolom features, hero 2 kolom `1fr 480px`, app main max-w 1200 center. `.web-page` max-w 1440 center. |

Aturan keras:
- **Dual markup** per halaman: `<div class="vp-mobile">` + `<div class="vp-desktop">`,
  toggle `display` via media query di `site.css`. Jangan coba morph satu markup.
- Tidak boleh ada horizontal scroll di 320, 390, 768, 1024, 1440.
- Elemen dekoratif absolute (stat nodes offset negatif seperti `right:-10%`) harus di dalam
  parent `overflow:hidden` supaya tidak bikin scrollbar.
- Semua ukuran artboard fixed (`width:390px`, `width:1440px`, `min-height:844/900px`) sudah
  di-override di `site.css` — jangan tambah fixed width baru.

---

## 4. Accessibility & Interaction

### 4.1 Kontras & teks

- Body text di light: `--tw-text-2` di atas `--tw-bg`/surface (≥ 7:1). Muted `--tw-text-3`
  hanya untuk caption/label ≥ 11px 700 atau teks sekunder — jangan untuk body panjang.
- Di dark hero: body min `rgba(245,239,228,.6)`; jangan turunkan opacity di bawah desain.
- Teks di atas `--tw-primary`: selalu putih. Di atas `--tw-primary-soft`: selalu `--tw-primary-dark`.

### 4.2 Keyboard & fokus

- Semua kontrol interaktif = elemen native (`<a>`, `<button>`, `<input>`); div onclick dilarang.
- Focus ring global: `:focus-visible { outline: 2px solid var(--tw-primary); outline-offset: 2px }`
  (di dark bg: `outline-color: var(--tw-primary-soft)`).
- Menu overlay & paywall: tombol toggle punya `aria-expanded`; dialog `role="dialog"` +
  `aria-modal="true"` + `aria-labelledby`; Esc menutup; klik scrim menutup paywall.
- Hamburger: `aria-label="Buka menu"` / "Tutup menu".
- Touch target minimal 44×44px (tab bar item, hamburger 36px + padding ok, month-picker button 32px → beri hit area padding).

### 4.3 Motion / micro-interaction (katalog lengkap)

| Nama (keyframes di `tutorlog-web.css`) | Durasi/easing | Dipakai di |
|---|---|---|
| `fadeSlideUp` | .5–.7s ease-out, stagger delay .1–.15s (`.anim-up-d1..d5`) | Entrance hero text, kartu, menu links |
| `fadeScale` | .35–.8s ease-out | Glass card, dialog, login card |
| `fadeIn` / `fadeSlideRight` | .6–.8s | Aksen entrance |
| `particlePulse` | `--pd` 3–6s infinite, opacity `--po`±.2 + scale 1→1.3 | Partikel constellation, kicker dot, caret login |
| `orbPulse` | 5s infinite, scale 1→1.06 | Orb blur hero/login |
| `lockGlow` | 3–4s infinite (glow mint) | Ikon lock paywall, mail sent, monitor icon |
| `floatA/B/C` | 5–7s infinite translateY -8/-14px | Stat nodes, float icons desktop |
| `iconShimmer` | 1.2s on hover | Ikon feature card desktop |
| Card hover | translateY(-2px) + shadow, .2–.25s | Feature/stat cards |
| Btn active | translateY(1px) / scale(.97), .1–.12s | Semua button |

Aturan: entrance animation pakai `both` fill; JANGAN menambah animasi baru di luar katalog;
wajib hormati `prefers-reduced-motion: reduce` → matikan semua infinite animation
(partikel, orb, float, glow) dan entrance jadi opacity-only. (Tambahkan blok ini di `site.css`
kalau belum ada.)

### 4.4 Bahasa & konten

- `<html lang="id">`, title `TutorLog — <Halaman>`, meta description per halaman.
- Copywriting HARUS persis dari JSX desain — jangan parafrase. Email kontak:
  `halo@tutorlog.id`. Rekening demo: BCA `7712 3456 789` a/n Kalilinux Studio.
- Ikon dekoratif: `aria-hidden` via `alt=""`/`focusable="false"`; ikon bermakna diberi label.
