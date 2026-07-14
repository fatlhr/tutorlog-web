import { FileText } from "@phosphor-icons/react/dist/ssr";

export function TermsContent() {
  return (
    <article className="tl-article-main">
      <div className="tl-article-intro">
        <FileText size={28} weight="duotone" aria-hidden="true" />
        <p>TutorLog adalah aplikasi pencatat sesi les untuk tutor privat di Indonesia, tersedia melalui aplikasi mobile dan companion web.</p>
      </div>

      <section className="tl-article-section">
        <h2>Penerimaan syarat</h2>
        <p>Dengan menggunakan aplikasi TutorLog, kamu setuju untuk terikat dengan syarat dan ketentuan ini. Jika tidak setuju, jangan gunakan Layanan.</p>
      </section>

      <section className="tl-article-section">
        <h2>Deskripsi layanan</h2>
        <p>Layanan mencakup pencatatan sesi, rekap tagihan, export PDF atau CSV, dan invoice builder melalui aplikasi mobile dan companion web.</p>
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
          <li>Mengexport data sesi dalam format PDF atau CSV.</li>
        </ul>
      </section>

      <section className="tl-article-section">
        <h2>Langganan dan pembayaran</h2>
        <ul className="tl-article-list">
          <li>Beberapa fitur, seperti export PDF tanpa batas dan invoice builder, memerlukan langganan TutorLog Plus.</li>
          <li>Pembayaran diproses melalui Lynk.id atau transfer manual.</li>
          <li>Langganan berlaku per bulan dan tidak diperpanjang otomatis.</li>
          <li>Pembayaran yang sudah dilakukan tidak dapat dikembalikan.</li>
        </ul>
      </section>

      <section className="tl-article-section">
        <h2>Batasan tanggung jawab</h2>
        <p>TutorLog disediakan sebagaimana adanya. Kami tidak menjamin Layanan selalu tersedia, bebas error, atau memenuhi semua kebutuhan spesifik kamu. TutorLog tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan Layanan.</p>
      </section>

      <section className="tl-article-section">
        <h2>Perubahan ketentuan</h2>
        <p>TutorLog dapat memperbarui syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui aplikasi atau email. Penggunaan Layanan setelah perubahan berarti kamu menyetujui ketentuan yang diperbarui.</p>
        <p>Untuk pertanyaan tentang syarat dan ketentuan ini, hubungi <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>.</p>
      </section>
    </article>
  );
}
