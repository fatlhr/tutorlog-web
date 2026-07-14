import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell";
import { KontakContent } from "@/components/content/kontak-content";

export const metadata: Metadata = {
  title: "TutorLog - Kontak",
  description: "Hubungi TutorLog untuk pertanyaan, saran, bug report, atau request penghapusan akun.",
};

const faqs = [
  {
    question: "Bagaimana cara masuk ke TutorLog Web?",
    answer: "Klik Masuk, isi email yang sama dengan akun mobile, lalu buka link yang kami kirim ke emailmu.",
  },
  {
    question: "Apakah data sesi otomatis muncul di web?",
    answer: "Ya. Sesi yang dicatat di mobile akan muncul di companion web setelah sinkron dan login dengan email yang sama.",
  },
  {
    question: "Bagaimana cara berlangganan TutorLog Plus?",
    answer: "Buka halaman Langganan di web app, lalu pilih pembayaran melalui Lynk.id atau transfer manual.",
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
      title="Ada yang perlu dicek?"
      subtitle="Kirim pertanyaan, saran, bug report, atau permintaan penghapusan akun lewat email."
      icon={null}
    >
      <section className="tl-article-layout tl-public-motion" aria-label="Kontak TutorLog">
        <KontakContent />
        <aside className="tl-margin-notes" aria-label="Catatan respons">
          <p><strong>Waktu respons</strong></p>
          <p>Kami berusaha membalas dalam 1 sampai 2 hari kerja.</p>
          <p>Request penghapusan akun diproses maksimal 7 hari setelah verifikasi.</p>
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
