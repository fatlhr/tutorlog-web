# Route-aware Loading Layouts Design

## Tujuan

Menambah ruang vertikal antara header dan summary Beranda, lalu membuat loading Beranda, Rekap, dan Invoice mengikuti susunan konten masing-masing tanpa menutup dekorasi route.

## Akar Masalah

`PageMain` memakai grid gap yang sama sebesar 32px untuk seluruh blok. Beranda memerlukan jarak hero yang lebih longgar antara header dan summary, tetapi menaikkan gap global akan mengubah semua route.

Loading header saat ini memakai `LoadingState shape="form"` selebar area konten. Pada Beranda, panel opaque tersebut berada di `PageMain` dengan z-index lebih tinggi daripada `homeDecoration`, sehingga bookmark tertutup. Header final tidak menutupnya karena copy hanya memakai sisi kiri dengan lebar maksimum 560px.

## Desain

### Beranda

- Bungkus `PageHeader` dan summary dalam stack lokal Beranda.
- Gunakan gap 48px pada desktop dan tablet, serta 28px pada mobile.
- Pertahankan gap `PageMain` untuk jarak summary ke section berikutnya.
- Loading header mengikuti lebar copy final dan tidak membuat panel penuh di area bookmark.
- Loading setelah summary mengikuti workspace dua kolom: daftar sesi di kiri dan kartu kontekstual di kanan. Pada mobile susunannya menjadi satu kolom.
- Tambahkan skeleton closing rail agar tinggi dan alur halaman loading mendekati Beranda final.

### Rekap

- Loading header menampilkan placeholder copy di kiri dan dua placeholder action di kanan.
- Area filter memakai blok tersendiri yang mengikuti filter periode dan filter murid.
- Summary tetap tiga kolom dengan density compact.
- Daftar sesi memiliki placeholder section heading sebelum skeleton rows.
- Pada mobile, action header disembunyikan dan filter direpresentasikan sebagai satu trigger, mengikuti layout final.

### Invoice

- Loading header menampilkan placeholder copy di kiri dan satu action di kanan.
- Desktop mempertahankan dua kolom form dan preview A4.
- Pada lebar yang menyembunyikan preview final, skeleton preview ikut disembunyikan.
- Mobile menampilkan placeholder handoff ringkas yang mengikuti layar awal "Buat invoice di laptop"; skeleton editor desktop disembunyikan sampai layout desktop tersedia.

## Struktur Implementasi

- Tambahkan helper loading khusus protected routes di `app/app/route-loading.tsx` dan CSS Module pendamping.
- Helper hanya mengatur skeleton header dan section heading. Data loading tetap memakai `LoadingState` yang sudah ada.
- Ubah `app/app/loading.tsx`, `app/app/rekap/loading.tsx`, dan `app/app/invoice/loading.tsx` untuk menyusun skeleton sesuai route.
- Tambahkan wrapper hero lokal pada `app/app/page.tsx` dan styling-nya di `app/app/home.module.css`.
- Jangan mengubah API shared `LoadingState`, business logic, data query, route, atau export Invoice/PDF.

## Verifikasi

- Contract test memastikan setiap loading route memakai preset yang sesuai dan Beranda memiliki hero spacing lokal.
- Verifikasi Chrome pada final state dan loading state yang direproduksi lewat client navigation.
- Periksa ketiga route pada desktop dan viewport 1024px; Invoice juga diperiksa pada viewport mobile karena memiliki handoff khusus.
- Jalankan focused contract, `git diff --check`, dan review status Git.
- Full suite, accessibility sweep, visual regression suite, dan PDF export tetap tidak dijalankan kecuali diminta.
