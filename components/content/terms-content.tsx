import { FileText } from "@phosphor-icons/react/dist/ssr";

export function TermsContent() {
  return (
    <article className="tl-article-main">
      <div className="tl-article-intro">
        <FileText size={28} weight="duotone" aria-hidden="true" />
        <p>TutorLog adalah aplikasi pencatat sesi les untuk tutor privat di Indonesia, tersedia melalui aplikasi di HP dan web TutorLog.</p>
      </div>

      <section className="tl-article-section">
        <h2>Penerimaan syarat</h2>
        <p>Dengan menggunakan aplikasi TutorLog, kamu setuju untuk terikat dengan syarat dan ketentuan ini. Jika tidak setuju, jangan gunakan Layanan.</p>
      </section>

      <section className="tl-article-section">
        <h2>Deskripsi layanan</h2>
        <p>Layanan mencakup pencatatan sesi, rekap tagihan, ekspor PDF atau CSV, dan pembuatan invoice melalui aplikasi di HP dan web TutorLog.</p>
      </section>

      <section className="tl-article-section">
        <h2>Akun pengguna</h2>
        <ul className="tl-article-list">
          <li>Kamu bertanggung jawab menjaga kerahasiaan email dan link yang dipakai untuk masuk.</li>
          <li>Satu akun hanya boleh digunakan oleh satu orang tutor.</li>
          <li>TutorLog berhak menonaktifkan akun yang melanggar ketentuan ini.</li>
        </ul>
      </section>

      <section className="tl-article-section">
        <h2>Penggunaan yang diperbolehkan</h2>
        <ul className="tl-article-list">
          <li>Mencatat dan mengelola sesi les privat.</li>
          <li>Membuat rekap dan tagihan untuk murid atau orang tua murid.</li>
          <li>Mengekspor data sesi dalam format PDF atau CSV.</li>
        </ul>
      </section>

      <section className="tl-article-section">
        <h2>Langganan dan pembayaran</h2>
        <ul className="tl-article-list">
          <li>Beberapa fitur, seperti ekspor rekap tanpa batas dan unduh invoice, memerlukan akses TutorLog Plus yang aktif.</li>
          <li>TutorLog menyediakan Plus Bulanan dan Plus Beli Putus. Masa akses mengikuti paket yang dipilih.</li>
          <li>Informasi pembayaran akan ditampilkan sebelum pengguna menyelesaikan pembelian.</li>
          <li>Paket Plus Bulanan tidak diperpanjang otomatis.</li>
          <li>Pembayaran yang sudah dilakukan tidak dapat dikembalikan.</li>
        </ul>
      </section>

      <section className="tl-article-section">
        <h2>Batasan tanggung jawab</h2>
        <p>TutorLog disediakan sebagaimana adanya. Kami tidak menjamin Layanan selalu tersedia, bebas gangguan, atau memenuhi semua kebutuhan spesifik kamu. TutorLog tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan Layanan.</p>
      </section>

      <section className="tl-article-section">
        <h2>Perubahan ketentuan</h2>
        <p>TutorLog dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui aplikasi atau email. Penggunaan Layanan setelah perubahan berarti kamu menyetujui ketentuan yang diperbarui.</p>
        <p>Untuk pertanyaan tentang syarat dan ketentuan ini, hubungi <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>.</p>
      </section>
    </article>
  );
}
