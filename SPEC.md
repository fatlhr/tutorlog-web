# SPEC — TutorLog Web Mobile Implementation

> Handoff document. Kalau implementasi belum selesai, AI/dev lain bisa lanjut dari sini.
> Source of truth desain: folder [design/](design/) (di-import dari Claude Design project
> `15f274d1-520c-446f-b5a0-f42966793522`, file "TutorLog Web Mobile.html").

## Goal

Implement TutorLog Web sebagai **static site responsive** (HTML + CSS + minimal JS, tanpa build
system) — konsisten dengan struktur repo yang sudah ada (folder-based routes, GitHub Pages
friendly, semua path **relative**). Dua sumber desain dari project Claude Design yang sama:

- **"TutorLog Web Mobile.html"** → viewport `< 768px` (13 screen, artboard 390px)
- **"TutorLog Web.html"** → viewport `≥ 768px` desktop/tablet (artboard 1440px)

### Pola responsive: dual markup

Tiap halaman punya DUA blok markup di body — `<div class="vp-mobile">` (screen mobile) dan
`<div class="vp-desktop">` (screen desktop). `site.css` menampilkan salah satu via media query
breakpoint **768px**. Konten duplikat memang disengaja: markup kedua desain beda struktur
(bottom tab bar vs topbar, mob-hero vs hero-v2 grid), media-query-morphing satu markup bakal
rusak dua-duanya.

## Design source files (design/)

| File | Peran |
|---|---|
| `TutorLog Web Mobile.html` | Canvas entry — daftar 13 artboard + section. Ada script injeksi `data-omelette-injected` (abaikan, itu tooling canvas) |
| `web-mobile-screens.jsx` | **Spec utama** — markup 13 screen dalam React JSX + dummy data |
| `web-shared.jsx` | Icon SVG paths (`Icons.*`), `Btn`, `Field`, brand mark |
| `tutorlog-web.css` | Design tokens (`--tw-*`, `--f-*`, `--r-*`), `.btn`, `.input`, `.chip`, keyframes, glass-card (`gc-*`), particles |
| `tutorlog-web-mobile.css` | Semua class `mob-*` untuk 13 screen |
| `TutorLog Web.html` | Canvas entry desktop — 13 screen unik (1440px) + varian |
| `web-screens.jsx` | **Spec utama desktop** — Screen* components + dummy data |
| `tutorlog-web-invoices.css` / `web-invoices.jsx` | Invoice builder desktop: template Klasik/Modern/Minimal + `A4Page` + `sampleInvoice` |
| `tutorlog-logo.png` | Logo otter (juga ada di `/Users/fatih/Code/Playground/TutorLog/assets/brand/`) |

Cara re-fetch design: `DesignSync` tool (butuh `/design-login` di session interaktif), atau
buka `https://claude.ai/design/p/15f274d1-520c-446f-b5a0-f42966793522` di browser login-ed dan
POST ke `/design/anthropic.omelette.api.v1alpha.OmeletteService/GetFile` `{projectId, path}` →
`{content: base64}`.

## Route map (13 routes × 2 viewport)

| # | Route | Mobile (`vp-mobile`) | Desktop (`vp-desktop`) | Status M | Status D |
|---|---|---|---|---|---|
| 1 | `index.html` | `MobScreenLanding` | `ScreenLanding` | ⬜ | ⬜ |
| 2 | `login/` | `MobScreenLogin` | `ScreenLogin` | ⬜ | ⬜ |
| 3 | `login/sent/` | `MobScreenLoginSent` | `ScreenLoginSent` | ⬜ | ⬜ |
| 4 | `fitur/` | `MobScreenFitur` | `ScreenFitur` | ⬜ | ⬜ |
| 5 | `harga/` | `MobScreenHarga` | `ScreenHarga` | ⬜ | ⬜ |
| 6 | `panduan/` | `MobScreenPanduan` | `ScreenPanduan` | ⬜ | ⬜ |
| 7 | `privacy/` (replace lama) | `MobScreenPrivacy` | `ScreenPrivacyPolicy` | ⬜ | ⬜ |
| 8 | `terms/` (baru) | `MobScreenTerms` | `ScreenTerms` | ⬜ | ⬜ |
| 9 | `account/` (replace lama) | `MobScreenAccountDeletion` | `ScreenAccountDeletion` | ⬜ | ⬜ |
| 10 | `kontak/` (baru) | `MobScreenKontak` | `ScreenKontak` | ⬜ | ⬜ |
| 11 | `app/rekap/` (demo) | `MobScreenRekap` | `ScreenRekapWeb` | ⬜ | ⬜ |
| 12 | `app/invoice/` (demo) | `MobScreenInvoiceBuilder` | `ScreenInvoiceBuilder` | ⬜ | ⬜ |
| 13 | `app/langganan/` (demo) | `MobScreenLangganan` | `ScreenLangganan` | ⬜ | ⬜ |

Update kolom Status (⬜ → ✅) setiap page selesai + verified.

`app/*` = **demo statis** dengan dummy data persis dari desain (Rina Novianti, Juni 2026, dst).
Belum ada auth/backend — wiring Supabase di luar scope task ini.

### Keputusan varian desktop (canvas punya beberapa varian per screen)

- **App shell**: pakai **`AppShellH` (horizontal top bar)** — bukan sidebar. Alasan: degrade
  lebih baik di lebar tablet 768–1024 (sidebar 260px makan sepertiga layar), dan nav-atas
  konsisten dengan pola mobile. Varian sidebar tetap ada di design/ sebagai referensi.
- **Invoice builder**: render template **Klasik**, aksen hijau `#006C53` (brand). Picker
  template/warna tampil sesuai desain tapi statis (state "on" di Klasik + hijau).
  Interaktivitas ganti template = enhancement nanti, bukan scope ini.
- **Paywall dialog**: markup ada di `app/invoice/`, hidden by default; muncul saat tombol
  "Export PDF" diklik (`js/site.js`, `data-paywall-open`/`data-paywall-close`). Persis
  artboard "Invoice Builder + Paywall".
- **Layout fluid**: `.web-page` 1440px fixed → `width:100%; max-width:1440px; margin:auto`.
  Deviasi responsive (extrapolasi): `feature-grid` 4→2 kolom `<1100px`; hero visual
  disembunyikan `<1000px`; grid 2-kolom halaman legal → 1 kolom `<900px`; padding horizontal
  96px → `clamp()`. Semua di `site.css`.

## File layout hasil implementasi

```
css/tutorlog-web.css          # copy verbatim dari design/ (tokens + base)
css/tutorlog-web-mobile.css   # copy verbatim dari design/ (mob-*)
css/site.css                  # OVERRIDES + additions (lihat bawah)
css/main.css                  # legacy — masih dipakai redirect stubs lama; jangan dihapus dulu
js/site.js                    # hamburger menu + login demo flow + copy-link
assets/tutorlog-logo.png
```

## Aturan konversi JSX → HTML

1. `className` → `class`; style object → inline `style="..."` (camelCase → kebab-case).
2. Icon `<Icons.xxx size={n}/>` → inline `<svg width=n height=n viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="..."/></svg>`. Path data ada di `design/web-shared.jsx` baris 14–41. `sw` prop = stroke-width.
3. `<Btn variant="x" size="y" icon={...}>Label</Btn>` → `<button class="btn btn-x btn-y">SVG<span>Label</span></button>` (iconRight = svg setelah span).
4. `.map()` list → tulis manual semua item (data dummy dipertahankan persis).
5. `React.Fragment` → langsung children.
6. Semua halaman: `<!doctype html><html lang="id">`, viewport meta, Google Fonts (Courier Prime 400,700 + Source Serif 4 400..700), title `TutorLog — <Nama>`.
7. Path relative: depth-1 pakai `../`, depth-2 pakai `../../`.

## site.css — deviasi sadar dari artboard (WAJIB dipertahankan)

Design css menarget artboard fixed 390×844. Untuk web asli:

```css
.mob-page { width: 100%; max-width: 480px; margin: 0 auto; min-height: 100svh; }
.mob-login-full, .mob-app-shell { min-height: 100svh; }  /* bukan 844px */
.mob-tab-bar { position: fixed; max-width: 480px; left: 50%; transform: translateX(-50%); }
.mob-dialog-scrim { position: fixed; }
body { background: #E8EFF1; }  /* frame di luar 480px, sama dgn canvas */
```

Tambahan yang TIDAK ada di desain (extrapolasi, konsisten token):
- **Hamburger menu overlay** (`.mob-menu`) — desain cuma punya tombol ☰ tanpa spec menu.
  Overlay fullscreen: links Fitur/Harga/Panduan/Kontak + CTA Masuk. Toggle via `js/site.js`.
- **Login demo flow**: submit form → redirect `sent/` (query `?email=` diisi ke badge via JS).
- **"Salin Link"** di app/invoice: `navigator.clipboard.writeText('https://web.tutorlog.id')`.
- Link wiring: footer links → routes; `Masuk`/CTA → `login/`; tab bar → `../rekap/` dll;
  "Kembali ke Rekap" → `../rekap/`; trust-row/demo link landing → `#` biarkan.

## Konten

Semua copywriting, dummy data, angka (Rp 5.9jt, 32 sesi, 48,5 jam, INV-2026/06-014, BCA 7712 3456 789,
a/n Kalilinux Studio, email tutorlog.admin@gmail.com, dst) ambil **persis** dari
`design/web-mobile-screens.jsx`. Jangan improvisasi copy.

Catatan konten lama: `privacy/index.html` + `account/index.html` lama berisi konten legal versi
sebelumnya (email kontak sama). Desain baru = pemadatan konten itu; pakai versi desain.
Redirect stubs `privacy-policy.html` + `account-deletion.html` di root JANGAN dihapus.

## Git flow

- Branch: `feature/web-mobile-ui` (dari `develop`; `develop` baru dibuat dari `main`).
- Commit convention: `<type>(<scope>): <desc>` imperative ≤72 char.
- Selesai → push, PR ke `develop`.

## Verifikasi

`python3 -m http.server` dari repo root (site statis murni). Cek tiap route di viewport 390×844,
bandingkan dengan screenshot canvas di Claude Design. Perhatikan: font serif/mono kebaca,
dark hero gradients, tab bar nempel bawah, dialog scrim menutupi layar.
