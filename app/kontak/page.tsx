import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell";
import { KontakContent } from "@/components/content/kontak-content";

export const metadata: Metadata = {
  title: "TutorLog - Kontak",
  description: "Hubungi TutorLog untuk pertanyaan, saran, laporan masalah, atau permintaan penghapusan akun.",
};

const faqs = [
  {
    question: "Bagaimana cara masuk ke TutorLog Web?",
    answer: "Pilih Masuk, isi email yang sama dengan akun di aplikasi, lalu buka tautan yang kami kirim ke emailmu.",
  },
  {
    question: "Apakah data sesi otomatis muncul di web?",
    answer: "Ya. Sesi yang dicatat di aplikasi akan muncul di web TutorLog setelah sinkron dan masuk dengan email yang sama.",
  },
  {
    question: "Bagaimana cara berlangganan TutorLog Plus?",
    answer: "Buka halaman Harga, lalu pilih paket yang sesuai. Informasi pembayaran akan ditampilkan pada langkah berikutnya.",
  },
  {
    question: "Apakah bisa menghapus akun?",
    answer: "Bisa. Kirim email dengan subjek Hapus akun TutorLog dan sertakan email login kamu.",
  },
];

export default function KontakPage() {
  return (
    <PublicShell
      compact
      eyebrow="Kontak TutorLog"
      title="Ada yang ingin ditanyakan?"
      subtitle="Kirim pertanyaan, saran, laporan masalah, atau permintaan penghapusan akun lewat email."
      icon={null}
    >
      <section className="tl-article-layout tl-public-motion" aria-label="Kontak TutorLog">
        <KontakContent />
        <aside className="tl-margin-notes" aria-label="Catatan respons">
          <p><strong>Waktu respons</strong></p>
          <p>Biasanya kami membalas dalam 1 sampai 2 hari kerja.</p>
          <p>Permintaan penghapusan akun diproses maksimal 7 hari setelah verifikasi.</p>
        </aside>
      </section>

      <section className="tl-article-accordion tl-public-motion" aria-labelledby="contact-faq-title">
        <h2 id="contact-faq-title">Pertanyaan umum</h2>
        {faqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>
    </PublicShell>
  );
}
