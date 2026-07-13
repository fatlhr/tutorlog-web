# Audit, Review & Saran Redesign — TutorLog App Dashboard

> Konteks: Review menyeluruh halaman `/app/` dan sub-routes (`/app/rekap`, `/app/invoice`).
> Target audience: tutor privat individu. Tumpukan: Next.js 16, React 19, Tailwind, Supabase, CSS custom properties.

---

## 1. Home Page (`/app`) — Content & Navigation

### Current
- Greeting "Halo, {name}" + 2 nav cards (Rekap Sesi, Buat Invoice)
- Pricing plans inline (Free / Plus / Plus Bulanan)
- Promotional banner Play Store

### Issues & Fixes

| # | Issue | Fix | File | Effort |
|---|---|---|---|---|
| 1a | **Home terlalu kosong** — cuma 2 nav card, tidak ada data overview | Tambah **quick stats dashboard**: total sesi bulan ini, total jam, total revenue, jumlah murid. Reuse data dari `fetchRekapDataByRange()` dengan default range "bulan ini". Tampilkan di atas nav cards. | `app/app/page.tsx` + component baru `StatsOverview` | Sedang (4-6h) |
| 1b | **Pricing plans inline** — memakan ~40% viewport, user sudah login tidak perlu lihat pricing tiap buka dashboard | Pindahkan pricing ke halaman terpisah `/app/langganan` atau modal yang muncul saat user butuh upgrade. Di home cukup tampilkan compact status subscription: "Free — 1/1 export terpakai" dengan link upgrade. | `app/app/page.tsx` + `app/app/langganan/page.tsx` | Sedang (6-8h) |
| 1c | **Promo banner tidak kontekstual** — Play Store link di web desktop tidak relevan | Sembunyikan di desktop. Ganti dengan value prompt kontekstual: "Sudah 12 sesi bulan ini. Download rekap PDF?" saat ada data, atau "Mulai catat les pertamamu" saat kosong. | `app/app/page.tsx` | Kecil (1-2h) |
| 1d | **Tidak ada recent activity** — user harus klik ke rekap dulu baru lihat data | Tambah **Recent Sessions** list (3-5 sesi terakhir) di bawah nav cards. Data dari `sessions` table, limit 5, order by date DESC. | `app/app/page.tsx` + component `RecentSessions` | Kecil (2-3h) |
| 1e | **Tidak ada shortcut aksi cepat** — user klik 2x untuk mulai | Tambah tombol "Lanjutkan Invoice Sebelumnya" jika ada draft. Atau 3rd nav card untuk aksi cepat. | `app/app/page.tsx` | Kecil (1-2h) |

---

## 2. Rekap Page (`/app/rekap`) — Data & UX

### Current
- Stat cards: total sesi, jam, revenue, student count
- Filter by student (segmented chips)
- Date range picker (from/to)
- Mini bar chart (DUMMY DATA — hardcoded Jan-Jun)
- Session detail table
- Export CSV/PDF with quota (1x/30 days)

### Issues & Fixes

| # | Issue | Fix | File | Effort |
|---|---|---|---|---|
| 2a | **Mini bar chart pakai dummy data** — incomplete feature | Hitung `monthlyHours` dari data sesi riil. Group sessions by bulan, sum duration. Data sudah di `fetchRekapDataByRange()`. Ganti `DUMMY_BARS` dengan computed value. | `components/RekapContent.tsx` | Kecil (1-2h) |
| 2b | **Date range picker UX** — from/to input saja, tidak ada shortcut untuk use case umum (Bulan Ini, Bulan Lalu) | Tambah **preset chips**: `[ Bulan Ini ] [ Bulan Lalu ] [ 3 Bulan Terakhir ]`. Saat diklik, isi from/to input. User tetap bisa override manual. Ganti ke **native `<input type="date">`** untuk UX mobile. Tambah **range summary label**: "📅 15 Juni – 15 Juli 2026 (31 hari, 12 sesi)". Opsional: **boundary snap buttons** `[<<]` [>>]` untuk snap ke awal/akhir bulan. | `components/RekapContent.tsx` | Kecil (2-3h) |
| 2c | **Stat cards tidak punya konteks perubahan** — angka absolut tanpa indikator trending | Tambah **delta indicator**: bandingkan total bulan ini vs bulan lalu dengan durasi sama. ↑ hijau, ↓ merah/amber. | `components/RekapContent.tsx` | Kecil (2-3h) |
| 2d | **Tidak ada summary footer di tabel** | Tambah sticky footer: `Total: 12 sesi · 24 jam · Rp 1.200.000 · 3 murid` | `components/RekapContent.tsx` | Kecil (1-2h) |
| 2e | **Tidak ada search untuk dataset besar** | Search bar di atas tabel: filter by student name, subject, date. Debounced input (`useDebounce` + useEffect). | `components/RekapContent.tsx` | Sedang (4-6h) |
| 2f | **Tidak ada pagination / virtual scroll** | Pagination 50 items/page atau tombol "Load More". | `components/RekapContent.tsx` | Sedang (4-6h) |
| 2g | **Empty state minim** — "Belum ada sesi di bulan ini." tanpa ilustrasi/CTA | Desain empty state dengan ilustrasi + ajakan: "Mulai catat les pertamamu di aplikasi mobile TutorLog." + link ke panduan. | `components/RekapContent.tsx` | Kecil (1-2h) |
| 2h | **Loading state tidak ada** — langsung fallback ke dummy data | Ganti dummy data fallback dengan **skeleton loader** (cards dengan `animate-pulse`). Implementasi sama untuk semua page. | `components/RekapContent.tsx` + global | Kecil (2-3h) |

---

## 3. Invoice Page (`/app/invoice`) — Form & Mobile

### Current
- Multi-section form (period, tutor info, student, sessions, bank, notes)
- Template selector (Klasik/Modern/Minimal) + 7 accent colors
- Live A4 preview panel (desktop)
- Zoom controls
- Export PDF with paywall (1x/30 days)
- **Mobile: blocked by "Buka di Desktop" dialog**

### Issues & Fixes

| # | Issue | Fix | File | Effort |
|---|---|---|---|---|
| 3a | **Mobile block "Buka di Desktop"** — user tidak bisa akses sama sekali | Jangan block. Tawarkan **simplified form tanpa live preview**. Saat submit, generate PDF di server-side (API route) dan trigger download. "Buka di Desktop" jadi **suggestion** bukan blocker. | `app/app/invoice/page.tsx` + API route | Besar (8-12h) |
| 3b | **Tidak ada invoice history** — invoice hilang setelah refresh | Simpan ke Supabase table `invoices: id, user_id, invoice_number, student_name, total_amount, template_type, created_at, pdf_url`. Tambah halaman `/app/invoice/history` atau side panel. User bisa: lihat daftar, download ulang, duplikat, hapus. | `app/app/invoice/history/page.tsx` + Supabase migration | Besar (8-12h) |
| 3c | **Tidak ada draft auto-save** — form hilang saat refresh | Simpan ke localStorage tiap 30 detik (debounced). Restore saat page load dengan notifikasi "Ada draft tersimpan. Lanjutkan?" Clear draft hanya saat sukses generate. | `app/app/invoice/page.tsx` | Sedang (4-6h) |
| 3d | **Template preview kurang informatif** — thumbnail kecil | Bikin preview card lebih besar, mungkin mini-render atau screenshot dengan label perbedaan (Klasik: warna blok header / Modern: strip tipis / Minimal: clean spasi lebar). | `components/invoice/` | Kecil (2-3h) |
| 3e | **Tidak ada share action** — PDF bisa didownload saja | Setelah generate: `[ Download PDF ] [ Bagikan WhatsApp ] [ Bagikan Email ]`. WhatsApp: `wa.me` link dengan pesan pre-filled. | `app/app/invoice/page.tsx` | Sedang (4-6h) |
| 3f | **Tidak ada batch invoice** — harus satu-satu per student | Phase 2: pilih multiple students → generate semua → download ZIP. | — | Besar (12-16h) |
| 3g | **Loading state tidak ada** | Skeleton loader untuk form sections saat fetch students/sessions. | `app/app/invoice/page.tsx` | Kecil (2-3h) |

---

## 4. General App Navigation & Structure

### Current
- Desktop: top bar (Rekap, Invoice, user dropdown)
- Mobile: bottom tab bar (Rekap, Invoice, Lainnya → cuma logout)
- Hanya 3 routes: home, rekap, invoice

### Issues & Fixes

| # | Issue | Fix | File | Effort |
|---|---|---|---|---|
| 4a | **"Lainnya" tab wasted space** — satu tab penuh untuk satu tombol logout | Expand jadi bottom sheet: ⚙️ Pengaturan, 📊 Langganan, ❓ Bantuan & Panduan, 🚪 Keluar. | `components/TabBar.tsx` | Kecil (2-3h) |
| 4b | **Tidak ada Settings/Profile page** — user tidak bisa edit profil, bank account, password | Halaman `/app/pengaturan`: nama, email, nomor HP, bank (nama, no rekening, atas nama), preferensi (format tanggal, mata uang, default tarif/jam), ganti password, hapus akun. Data bank langsung dipakai di invoice form. | `app/app/pengaturan/page.tsx` + `components/SettingsForm.tsx` | Sedang (6-8h) |
| 4c | **Tidak ada Student Management page** — students hanya bisa diakses lewat dropdown invoice | Halaman `/app/murid`: daftar students, tambah/edit/hapus, lihat sesi per student, total jam & tagihan per student. | `app/app/murid/page.tsx` + `components/StudentList.tsx` + Supabase CRUD | Besar (10-16h) |
| 4d | **Navigasi home di mobile kurang jelas** — breadcrumb kecil, mudah terlewat | Ganti breadcrumb dengan back button visible (`← Home`). Atau tambah tab "Home" di tab bar (sekarang cuma Rekap, Invoice, Lainnya). | `components/TabBar.tsx` + layout | Kecil (1-2h) |
| 4e | **Tidak ada notification / badge system** | Badge di tab bar untuk: draft tersimpan, quota export hampir habis. In-app notification banner. | `components/TabBar.tsx` + global state | Sedang (4-6h) |

---

## 5. Visual Design Review

### 5a. Typography

| Aspek | Status | Fix |
|---|---|---|
| Dual-font konsisten | ✅ | — |
| Type scale bertingkat | ✅ | — |
| Body max-width constraint | ⚠️ **Tidak ada** | Tambah `max-w-prose` atau `max-w-[65ch]` untuk body paragraph di dashboard (deskripsi, notes, helper — bukan tabel/form) |
| Font-size data/sheet | ✅ | — |

### 5b. Color — Potensi Issue Kontras

| Kombinasi | Ratio | Target | Fix |
|---|---|---|---|
| `--tw-text-3: #5A6862` on `--tw-bg: #F4FAFD` | ~4.1:1 | 4.5:1 (AA) | **Gelapkan** ke `#4A5A54` atau reuse `--tw-text-2: #3E4944` |
| `--tw-text-2: #3E4944` on `--tw-bg: #F4FAFD` | ~5.8:1 | 4.5:1 (AA) | ✅ Lolos |

**Fix:** Update `--tw-text-3` di `css/tutorlog-web.css` dari `#5A6862` ke `#4A5A54` (atau yang setara ~4.7:1).

### 5c. Interactive States (Missing)

| Aspek | Status | Fix |
|---|---|---|
| Loading states (skeletal) | ❌ Tidak ada | Component `Skeleton` dengan `animate-pulse`. Pasang di rekap (stat cards, tabel, chart) dan invoice (form sections). |
| Empty states | ⚠️ Minimal | Ilustrasi + CTA inviting. Lihat #2g. |
| Error states | ⚠️ Perlu audit | Pastikan semua form sections punya error text visible di bawah input (invoices). Pastikan data fetch gagal ditampilkan dengan toast/banner. |

### 5d. Form Patterns

| Aspek | Status |
|---|---|
| Label above input | ✅ |
| No placeholder-as-label | ✅ |
| Error text below input | ⚠️ Belum terverifikasi |
| Focus ring | ✅ `:focus-visible` dengan `--tw-primary` |

### 5e. Layout & Spacing

| Aspek | Status |
|---|---|
| Desktop nav single-line | ✅ |
| Max content 1200px centered | ✅ |
| Radius konsisten | ✅ Cards 32px, buttons pill, inputs 16px |
| Mobile collapse explicit | ✅ Rekap ✅ / Invoice ❌ (blocked dialog) |

### 5f. Shape Consistency
Radius system: cards 32px, buttons pill, inputs 16px. ✅ Konsisten.

---

## 6. Prioritas & Effort Matrix (untuk implementasi)

### 🔴 Urgent — Impact tinggi, effort rendah-sedang

| # | Item | Effort | Files |
|---|---|---|---|
| 1 | Fix dummy chart → real data | 1-2h | `components/RekapContent.tsx` |
| 2 | Preset date range chips | 2-3h | `components/RekapContent.tsx` |
| 3 | Native date inputs + range summary | 1-2h | `components/RekapContent.tsx` |
| 4 | Home quick stats dashboard | 4-6h | `app/app/page.tsx`, `components/StatsOverview.tsx` |
| 5 | Loading skeleton (global) | 2-3h | All pages, shared `Skeleton` component |
| 6 | Delta indicator stat cards | 2-3h | `components/RekapContent.tsx` |
| 7 | Recent sessions di home | 2-3h | `app/app/page.tsx`, `components/RecentSessions.tsx` |
| 8 | Expand "Lainnya" mobile tab | 2-3h | `components/TabBar.tsx` |
| 9 | Fix `--tw-text-3` kontras | 0.5h | `css/tutorlog-web.css` |

### 🟡 Penting — Impact medium, effort sedang-besar

| # | Item | Effort |
|---|---|---|
| 10 | Mobile invoice access (unblock) | 8-12h |
| 11 | Draft auto-save invoice | 4-6h |
| 12 | Search di rekap | 4-6h |
| 13 | Settings page | 6-8h |
| 14 | Share invoice via WhatsApp | 4-6h |
| 15 | Empty state redesign | 1-2h |

### 🟢 Nice to have — Impact medium, effort besar

| # | Item | Effort |
|---|---|---|
| 16 | Invoice history | 8-12h |
| 17 | Student management page | 10-16h |
| 18 | Pagination di rekap | 4-6h |
| 19 | Batch invoice | 12-16h |
| 20 | Notification/badge system | 4-6h |

---

## Rekomendasi Sesi Eksekusi

### Sesi 1 (immediate — ~10h total)
1. Fix dummy chart (1h)
2. Preset date range + native date input (2.5h)
3. Loading skeleton global (2.5h)
4. Delta indicator stat cards (2h)
5. Fix `--tw-text-3` kontras (0.5h)
6. Recent sessions home (2h)

### Sesi 2 (medium — ~12h total)
7. Home quick stats dashboard (5h)
8. Expand "Lainnya" mobile tab (3h)
9. Search di rekap (4h)

### Sesi 3
10. Mobile invoice access (10h)
11. Draft auto-save (5h)

### Sesi 4+
12. Settings page (7h)
13. Share invoice (5h)
14. Empty states (2h)
15. Invoice history (10h)
16. Student management (14h)
17. Pagination (5h)
18. Batch invoice (14h)
19. Notification system (5h)
