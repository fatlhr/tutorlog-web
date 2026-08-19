# Template email TutorLog

Template email autentikasi Supabase. File di folder ini adalah **source of truth**, tapi Supabase hosted menyimpan template di dashboard, bukan di repo. Setiap kali file di sini diubah, hasilnya harus di-paste ulang ke dashboard.

## File

| File | Dipakai untuk |
|---|---|
| `confirm-signup.html` | Template **Confirm signup**. Dipicu saat email belum terdaftar. |
| `magic-link.html` | Template **Magic Link**. Dipicu saat user sudah terdaftar. |
| `_preview.html` | Preview lokal. Tidak dipasang ke Supabase. |

Kenapa dua-duanya perlu ada: [`app/login/actions.ts`](../../app/login/actions.ts) memanggil `signInWithOtp` tanpa `shouldCreateUser: false`, jadi nilainya default `true`. User baru dapat Confirm signup, user lama dapat Magic Link. Kalau cuma satu yang digarap, separuh user tetap menerima email polos.

## Cara pasang

Supabase Dashboard → **Authentication** → **Emails** → **Templates**.

Paste isi file ke template yang sesuai, lalu set subjeknya:

| Template | Subject |
|---|---|
| Confirm signup | `Konfirmasi email kamu di TutorLog` |
| Magic Link | `Tautan masuk TutorLog` |

## Variabel Supabase

Hanya dua yang dipakai, dan keduanya tersedia di kedua template:

- `{{ .ConfirmationURL }}` — tautan aksi. Dipakai dua kali: di `href` tombol dan sebagai teks fallback yang bisa disalin manual.
- `{{ .Email }}` — alamat penerima, ditampilkan di footer supaya penerima tahu kenapa dia dikirimi email.

## Preview lokal

Buka `_preview.html` di browser lewat file server, bukan `file://` langsung, karena preview memuat kedua template lewat `<iframe>`:

```bash
npx serve supabase/email-templates -l 4100 --no-clipboard
```

Lalu buka `http://localhost:4100/_preview.html`.

Untuk cek satu template saja, `confirm-signup.html` dan `magic-link.html` bisa dibuka langsung lewat `file://` tanpa server.

## Batasan yang disengaja

**Layout pakai `<table>` dan CSS inline.** Bukan preferensi gaya. Outlook memakai mesin render Word yang tidak mendukung flexbox atau grid, dan sebagian klien membuang blok `<style>`. Blok `<style>` di file ini hanya berisi penyesuaian mobile dan boleh gagal tanpa merusak apa pun.

**Tidak ada gambar sama sekali.** Header memakai wordmark teks, bukan file logo. Gmail memblokir gambar remote secara default untuk pengirim yang belum dikenal, jadi logo gambar sering muncul sebagai kotak kosong justru di email pertama, saat kepercayaan paling dibutuhkan. Efek samping yang menguntungkan: tidak perlu hosting aset, dan tidak ada yang bisa rusak.

**Webfont tidak dimuat.** Gmail mengabaikan webfont, jadi memuatnya hanya menambah berat tanpa hasil. Font stack langsung jatuh ke `monospace` (pengganti Courier Prime) dan `Georgia` (pengganti Source Serif 4). Keduanya cukup dekat untuk menjaga karakter mono-serif produk.

**Warna ditulis eksplisit di setiap elemen**, termasuk `background-color` pada `<body>` dan wrapper. Tanpa itu, klien dark mode meminjam warna dari host dan hasilnya tidak bisa diprediksi.

## Sumber token desain

Nilai diambil dari [`css/tutorlog-foundation.css`](../../css/tutorlog-foundation.css) dan [`css/tutorlog-web.css`](../../css/tutorlog-web.css). Kalau brand berubah, sinkronkan manual — file ini tidak membaca CSS variable karena email tidak mendukungnya.

| Peran | Nilai |
|---|---|
| Brand / tombol | `#006c53` |
| Teks utama | `#161D1F` |
| Teks sekunder | `#3E4944` |
| Teks redup | `#5A6862` |
| Garis | `#B8CBC4` |
| Latar halaman | `#F4FAFD` |
| Latar kartu | `#FFFFFF` |
| Latar callout | `#EDF7F3` |
| Radius kartu | `14px` |
| Radius tombol | `10px` |

## Yang belum diuji

Preview di browser hanya membuktikan struktur dan lebar. Tiga hal ini cuma bisa diuji lewat email sungguhan:

1. **Dark mode** di Gmail mobile. Ini tempat template email paling sering rusak.
2. **Preheader** di daftar inbox sebelum email dibuka.
3. **Tautan tombol** benar-benar membentuk session lewat `/auth/callback`.
