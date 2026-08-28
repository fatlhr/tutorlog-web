# Checklist: turunkan CPU Worker (Error 1102)

Branch: `perf/worker-cpu-budget`. Belum di-push, belum di-deploy.

## Akar masalah

`.open-next/worker.js:39` melakukan `await import()` bundle server **di dalam** `fetch()` handler.
Biaya parse + eval modul ditagihkan ke request yang mendarat pertama di isolate dingin. Plan Free
membatasi CPU 10ms/request dan tidak bisa dikonfigurasi.

Pengukuran production (`wrangler tail --format json`):

| jenis request | cpuTime |
|---|---|
| redirect saja | 1–4ms |
| RSC render, hangat | 3–4ms |
| RSC render, dingin | 26–35ms |
| dokumen penuh, hangat | ~30ms |
| dokumen penuh, dingin | 92–616ms |
| aset `/_next/static/*` | Worker tidak dipanggil |

Warm sudah lolos 10ms. Cold tidak akan pernah lolos. Target: **1102 jadi jarang, bukan nol.**
Yang menghapus kelas masalah ini sepenuhnya cuma Workers Paid ($5/bulan).

## Progres bundle

| tahap | bundle | delta |
|---|---|---|
| baseline sesi | 8.236.995 | — |
| Tier 1 | 8.200.701 | −36 KB |
| Tier 3.1 | 8.200.948 | ±0 (fix runtime) |
| Tier 2.1 GSAP | 7.843.120 | −358 KB |
| Tier 2.2 + 3.2 + 4 | 7.857.643 | +14 KB |

Total **−379 KB (4,6%)**.

## Temuan yang membatalkan sebagian rencana awal

Diukur di production, `/harga` (dinamis) vs `/fitur` (static), sampel diselang-seling:

| route | tipe | cpuTime | median |
|---|---|---|---|
| `/harga` | dinamis | 24, 25, 281 | **25ms** |
| `/fitur` | static | 229, 458 | 344ms |

Halaman static **tidak lebih murah**. `/harga` dinamis justru menyentuh 24ms warm, lebih rendah
dari sampel static mana pun (`/privacy` 92–114ms, `/panduan` 348ms, `/fitur` 220–458ms).

Konsekuensinya untuk strategi: yang menentukan bukan static-vs-dinamis, juga bukan seberapa berat
render satu halaman, melainkan **berapa banyak invokasi Worker** yang terjadi — karena tiap
invokasi berpeluang membayar cold start eval bundle. Jadi prioritaskan mengurangi jumlah request,
bukan mengoptimalkan isi render.

---

## Selesai

- [x] **1.1** Analytics berhenti nembak `/api/analytics` (route tidak pernah ada, 404).
      8 call-site, −1 invokasi Worker masing-masing. `fee40eb`
- [x] **1.2** `revalidatePath` di server action, buang `router.refresh()` kedua.
      Simpan nama: 2 render `/app` → 1. `73dad7e`
- [x] **3.1** Hoist 8 formatter `Intl` ke module scope.
      ~253 konstruksi per render `/app` → 8 per isolate. Output terbukti identik. `9a346b3`
- [x] **2.1** GSAP keluar dari bundle server. 3 salinan → 0 byte. `be14be4`

- [x] **3.2** `React.cache()` pada `lib/supabase/server.ts`. Satu `GET /app` tadinya membangun
      7 server client terpisah. Aman diuji di route handler, server component, dan middleware. `92a8e74`
- [x] **2.2 (sebagian)** Supabase hilang dari JS klien halaman publik. PublicNav dan HamburgerMenu
      memuat supabase-js hanya untuk menentukan label nav, diganti cek cookie; signOut jadi server
      action. **Target aslinya gagal**: 5 chunk duplikat di server bundle tidak berkurang, karena
      tiap chunk memuat `createServerClient` DAN `createBrowserClient` — duplikasinya dari
      chunking per route oleh Turbopack, bukan per situs import. `fc62868`
- [x] **4** `prefetch={false}` pada 7 link footer, plus `loading.tsx` untuk `/app/profil` yang
      sebelumnya dirender penuh saat di-prefetch dari TabBar. `7487598`

## Dicoba lalu dibatalkan

- **`/harga` jadi static** — berhasil secara teknis (`ƒ` → `○` hanya dengan menghapus
  `cookies()`), tapi pengukuran menunjukkan halaman static tidak lebih murah (lihat tabel di
  atas). Ongkosnya nyata: harga ter-bake saat build, dan CTA berkedip sebelum hydration. Dibatalkan.

## Belum

- [ ] **2.3** Runtime client-router Next — 558.925 byte, 5 salinan @111.785. Terverifikasi masih
      ada. Akar sama dengan 2.2 (chunking per route), jadi kemungkinan **tidak** bisa diperbaiki
      dari kode aplikasi.
- [ ] **2.4** Ikon Phosphor — ~100–150 KB. 12 file masih barrel import, 20 sudah `/dist/ssr`.
      Turbopack sudah tree-shake cukup baik, prioritas terendah.
- [ ] **3.3** `/app` menarik daftar sesi bulan lalu lengkap hanya untuk 3 angka
      (`app/app/page.tsx:66` → dipakai di `:273-281`).
- [ ] **3.4** `RekapContent` menerima dataset penuh sebagai props — dirender jadi HTML lalu
      diserialisasi lagi ke payload RSC.
- [ ] **TabBar prefetch** — 4 link ke route dinamis, selalu di viewport, di tiap halaman `/app`.
      Belum disentuh karena ini navigasi utama; matikan prefetch di sini akan terasa lambat.
      Ukur dulu berapa invokasi yang sebenarnya dihemat.

## Kesimpulan sementara

Sisa item di Tier 2 dan 3 kemungkinan besar hasilnya kecil: 2.3 di luar kendali kode aplikasi, dan
3.3/3.4 mengoptimalkan isi render — padahal pengukuran menunjukkan isi render bukan biaya dominan.

Yang masih punya ruang nyata cuma **mengurangi jumlah invokasi Worker**. Setelah itu habis, yang
tersisa adalah Workers Paid ($5/bulan), yang menaikkan batas dari 10ms ke 30 detik dan menghapus
kelas masalah ini seluruhnya.

## Diserahkan ke L9 (retire legacy gateway)

- [ ] **1.3** Polling `/pembayaran/[purchaseId]` 10 menit, worst-case 9 subrequest per poll,
      plus poll ekstra tiap tab di-fokus.
- [ ] **3.5** `getCatalog()` jalan dua kali per render `/checkout`.

## Perlu diverifikasi manual

Dua hal yang tidak bisa saya cek sendiri:

- [ ] Simpan nama di `/app` (dialog first-user) dan `/app/profil` (edit inline) — nama harus
      muncul di topbar tanpa `router.refresh()`. Kalau tidak, kembalikan refresh-nya.
- [ ] Animasi hero di landing. Uji A/B membuktikan bukan regresi (kode asli menghasilkan state
      tersangkut yang identik), tapi penyebabnya rAF beku di Browser pane tersembunyi — bukan
      bukti positif bahwa animasinya jalan.

## Cara ukur

```bash
./node_modules/.bin/wrangler tail tutorlog-web --format json > /tmp/probe.json &
# curl route yang diuji beberapa kali berturut-turut, bandingkan cpuTime request ke-1 vs ke-3
```

Bundle: `stat -f "%z" .open-next/server-functions/default/handler.mjs`, atribusi per-paket lewat
`handler.mjs.meta.json`.

Metrik terpenting bukan ukuran bundle, tapi **jumlah invokasi Worker per flow** — jalankan tail,
lakukan satu flow, hitung event-nya.

Deploy: `./node_modules/.bin/opennextjs-cloudflare build` dulu, baru `wrangler deploy`.
`npm run build` saja tidak cukup — wrangler mengirim `.open-next/` yang lama.
