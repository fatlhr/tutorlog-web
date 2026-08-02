import type { Metadata } from "next";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "TutorLog - Hapus akun",
  description: "Panduan penghapusan akun TutorLog, data yang dihapus, cara mengajukan, dan estimasi proses.",
};

const steps = [
  { title: "Kirim email", body: <>Kirim email ke <a href="mailto:tutorlog.admin@gmail.com">tutorlog.admin@gmail.com</a>.</> },
  { title: "Gunakan subjek yang benar", body: <>Gunakan subjek <strong>Hapus akun TutorLog</strong>.</> },
  { title: "Sertakan email login", body: "Sertakan email yang dipakai untuk login TutorLog." },
  { title: "Tulis konfirmasi", body: "Tulis konfirmasi singkat bahwa kamu ingin akun dan data TutorLog dihapus." },
];

export default function AccountPage() {
  return (
    <PublicShell
      compact
      eyebrow="Hapus akun"
      title="Penghapusan akun TutorLog"
      subtitle="Terakhir diperbarui: 3 Juni 2026"
      icon={null}
    >
      <section className="tl-article-layout tl-public-motion" aria-label="Penghapusan akun TutorLog">
        <article className="tl-article-main">
          <p className="tl-article-alert"><Warning size={22} weight="fill" aria-hidden="true" />Penghapusan akun bersifat <strong>permanen</strong>. Semua data akan dihapus dan tidak bisa dikembalikan.</p>

          <section className="tl-article-section">
            <h2>Cara mengajukan penghapusan</h2>
            <ol className="tl-delete-steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span aria-hidden="true">{index + 1}</span>
                  <div><h3>{step.title}</h3><p>{step.body}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section className="tl-article-section">
            <h2>Data yang akan dihapus atau dianonimkan</h2>
            <ul className="tl-article-list">
              <li>Akun autentikasi TutorLog.</li>
              <li>Profil tutor.</li>
              <li>Data murid dan lokasi belajar.</li>
              <li>Riwayat sesi dan kehadiran.</li>
              <li>Data paket Plus, voucher, dan jumlah penggunaan fitur.</li>
              <li>Catatan dukungan terkait permintaan, jika sudah tidak dibutuhkan.</li>
            </ul>
            <p>Jika ada data yang wajib disimpan untuk keamanan, pencegahan penyalahgunaan, atau kewajiban hukum, TutorLog hanya akan menyimpan data yang memang diperlukan.</p>
          </section>

          <section className="tl-article-section">
            <h2>Verifikasi dan estimasi proses</h2>
            <p>Untuk menjaga keamanan akun, TutorLog akan memverifikasi bahwa permintaan berasal dari email yang sama dengan akun TutorLog.</p>
            <p>Permintaan yang sudah terverifikasi diproses maksimal 7 hari setelah verifikasi selesai.</p>
          </section>
        </article>
        <aside className="tl-margin-notes" aria-label="Catatan penghapusan akun">
          <p><strong>Estimasi proses</strong></p>
          <p>Maksimal 7 hari setelah email dan kepemilikan akun terverifikasi.</p>
        </aside>
      </section>
    </PublicShell>
  );
}
