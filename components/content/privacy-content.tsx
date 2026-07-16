import { LockKey } from "@phosphor-icons/react/dist/ssr";

export function PrivacyContent() {
  return (
    <article className="tl-article-main">
      <div className="tl-article-intro">
        <LockKey size={28} weight="duotone" aria-hidden="true" />
        <p><strong>Ringkasan.</strong> TutorLog membantu tutor privat mencatat sesi les, menyimpan riwayat murid, membuat rekap tagihan, dan mengekspor data ke PDF atau CSV.</p>
      </div>

      <section className="tl-article-section">
        <h2>Data yang dipakai TutorLog</h2>
        <ul className="tl-article-list">
          <li><strong>Data akun:</strong> alamat email dan ID autentikasi.</li>
          <li><strong>Profil tutor:</strong> nama tutor untuk laporan dan ekspor PDF.</li>
          <li><strong>Data murid:</strong> nama, tingkat pendidikan, tipe tagihan, tarif, dan status aktif atau tersembunyi.</li>
          <li><strong>Data lokasi:</strong> lokasi belajar murid dan lokasi sesi saat pengguna menyimpan lokasi murid, memulai sesi tatap muka, atau menyelesaikan sesi.</li>
          <li><strong>Aktivitas sesi:</strong> waktu mulai, waktu selesai, mode ajar, durasi, estimasi tagihan, status sinkronisasi, dan riwayat sesi.</li>
          <li><strong>Data akses premium:</strong> voucher, status akses, tanggal aktif, dan jumlah penggunaan fitur ekspor.</li>
          <li><strong>File hasil ekspor:</strong> PDF atau CSV yang dibuat hanya saat pengguna memilih ekspor atau membagikannya.</li>
        </ul>
      </section>

      <section className="tl-article-section">
        <h2>Penggunaan lokasi</h2>
        <p>TutorLog meminta izin lokasi hanya untuk fungsi yang berkaitan dengan sesi les, yaitu menyimpan lokasi murid, mulai sesi tatap muka di dekat lokasi murid, dan menyimpan titik lokasi saat sesi selesai.</p>
        <p>TutorLog hanya memakai lokasi saat aplikasi sedang digunakan. TutorLog tidak mengakses lokasi saat aplikasi berjalan di latar belakang.</p>
      </section>

      <section className="tl-article-section">
        <h2>Penyimpanan dan keamanan</h2>
        <p>TutorLog menyimpan data aplikasi di Supabase. Data dikirim melalui koneksi HTTPS terenkripsi. Aturan akses membatasi setiap akun agar hanya dapat melihat datanya sendiri.</p>
        <p>File PDF dan CSV dibuat dari data rekap yang dipilih pengguna. Setelah ekspor selesai, pengguna menentukan sendiri tempat file tersebut dibagikan atau disimpan.</p>
      </section>

      <section className="tl-article-section">
        <h2>Retensi dan penghapusan data</h2>
        <p>TutorLog menyimpan data akun, murid, sesi, voucher, dan rekap selama akun aktif agar tutor bisa melihat riwayat dan membuat laporan.</p>
        <p>Untuk pertanyaan privasi atau penghapusan data, kirim email ke <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>.</p>
      </section>
    </article>
  );
}
