# Pricing Fallback and Payment Gateway Gate

## Goal

Halaman harga dan checkout harus terlihat siap untuk direview meskipun katalog
database atau payment gateway belum tersedia. Sistem tidak boleh membuat
payment atau mengarahkan pengguna ke gateway sampai provider diaktifkan.

## Pricing behavior

- `/harga` selalu menampilkan empat paket: Free, Plus 30 Hari, Plus 12 Bulan,
  dan Plus Selamanya.
- Jika katalog database berhasil dimuat, halaman memakai data katalog tersebut.
- Jika katalog database gagal dimuat, halaman memakai launch catalog lokal:
  Free Rp0, Plus 30 Hari Rp19.000, Plus 12 Bulan Rp149.000, dan Plus Selamanya
  Rp249.000.
- Kegagalan katalog tidak mengganti daftar paket dengan error panel.
- CTA Free tetap membuka login atau aplikasi sesuai status autentikasi.
- CTA paket Plus tetap aktif dan membuka `/checkout?package=<package-code>`.
- Plus 12 Bulan memakai badge `Paling hemat`, dekorasi mint dengan aksen hijau,
  dan copy penghematan terhadap pembelian paket 30 hari selama 12 bulan.
- Plus Selamanya memakai badge `Sekali bayar`, dekorasi lavender dengan aksen
  tinta gelap, dan copy `Bayar sekali untuk akses Plus selamanya.`
- Nilai `featured` tidak boleh lagi diterjemahkan menjadi label dan dekorasi
  yang sama untuk kedua paket tersebut.

## Checkout behavior

- Checkout menampilkan link `← Kembali ke harga` di atas panel dan link
  tersebut menuju `/harga`.
- Checkout tetap menampilkan paket, rincian harga, pilihan metode pembayaran,
  dan persetujuan pengguna.
- Kesiapan payment gateway dikirim sebagai state eksplisit ke checkout UI.
- Saat provider belum aktif, tombol final tidak mengirim request pembuatan
  payment dan tidak melakukan redirect.
- Tombol final disabled dengan label `Pembayaran segera tersedia`.
- Server payment API tetap fail-closed jika dipanggil saat provider belum aktif.

## Data and safety

- Launch catalog production tidak mengambil data dari test fixtures.
- Fallback memakai tipe `ProductSummary` dan nilai harga yang sama dengan seed
  billing migration saat ini.
- Fallback hanya untuk presentasi pricing dan checkout. Fallback tidak menjadi
  sumber otoritatif untuk transaksi.
- Tidak ada perubahan schema, migration, payment provider adapter, atau shared
  browser DTO.

## Verification

- Focused contract membuktikan katalog fallback tetap dirender saat
  `getCatalog()` gagal.
- Focused contract membuktikan paid pricing CTA tetap menuju checkout.
- Focused contract membuktikan Plus 12 Bulan dan Plus Selamanya memakai badge,
  copy, dan class dekorasi yang berbeda.
- Focused contract membuktikan tombol final checkout disabled dan tidak
  memanggil payment creation ketika provider belum aktif.
- Focused contract membuktikan checkout menyediakan link kembali ke `/harga`.
- Jalankan focused billing UI dan route contracts serta `git diff --check`.
