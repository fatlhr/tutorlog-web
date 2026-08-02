# Login Submit Loading Design

## Tujuan

Mencegah pengiriman magic link ganda saat pengguna menekan tombol submit lebih dari sekali, sekaligus memberi tanda bahwa permintaan sedang diproses.

## Scope

- Tambahkan Client Component kecil khusus tombol submit login.
- Baca pending state form melalui `useFormStatus()`.
- Saat pending, gunakan state `loading` milik `MarketingButton` dengan label `Mengirim link...`.
- Biarkan field email tetap tampil dan dapat dibaca selama request berlangsung.
- Jangan mengubah Server Action, validasi email, redirect, atau konfigurasi Supabase.

## Struktur

`LoginSubmitButton` menjadi child dari form yang memakai `sendMagicLink`. Komponen ini membaca status form terdekat dan meneruskan `pending` ke `MarketingButton`. Primitive tombol yang sudah ada menangani spinner, `disabled`, dan `aria-busy`, sehingga tampilan dan accessibility state tetap mengikuti shared public UI.

## Perilaku

1. Kondisi awal menampilkan ikon pesawat dan teks `Kirim link masuk`.
2. Setelah submit valid dimulai, tombol berubah menjadi spinner dan teks `Mengirim link...`.
3. Selama pending, tombol dinonaktifkan sehingga klik berikutnya tidak membuat submit kedua.
4. Server Action tetap menentukan hasil akhir: redirect ke halaman link terkirim atau kembali ke login dengan pesan error.

## Pengujian

- Tambahkan focused contract yang gagal jika tombol tidak memakai `useFormStatus()`.
- Pastikan pending state diteruskan ke prop `loading` dan label loading sesuai desain.
- Pastikan halaman login memakai komponen submit baru di dalam form.
- Jalankan contract tersebut dan `git diff --check`.

## Di Luar Scope

- Mengunci seluruh form atau field email.
- Mengubah copy selain label loading.
- Mengubah auth workflow, rate limit, atau behavior magic link.
- Responsive sweep, accessibility sweep penuh, dan visual regression penuh kecuali diminta terpisah.
