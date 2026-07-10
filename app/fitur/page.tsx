import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import { PublicProductProof } from "@/components/PublicProductRail";
import { PublicStoryLayout } from "@/components/PublicStoryLayout";

export const metadata: Metadata = {
  title: "TutorLog - Fitur",
  description: "Catat sesi dari mobile, baca rekap, lalu siapkan invoice dari data TutorLog yang sama.",
};

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

export default function FiturPage() {
  return (
    <PublicStoryLayout
      className="tls-features"
      eyebrow="Fitur TutorLog"
      title="Data les bergerak dari HP ke rekap."
      subtitle="Mobile dipakai saat mengajar. Web dipakai saat data itu perlu dibaca, diarsipkan, atau dikirim."
      railLabel="Bukti fitur TutorLog"
    >
      <section className="tls-story-section tls-feature-chapter" aria-labelledby="feature-catat">
        <h2 id="feature-catat">Catat sesi di HP.</h2>
        <p>Selesai mengajar, tutor cukup menyimpan materi, durasi, murid, dan nominal dari mobile.</p>
        <div className="tls-mobile-proof"><PublicProductProof id="mobile" /></div>
      </section>

      <section className="tls-story-section tls-feature-chapter" aria-labelledby="feature-rekap">
        <h2 id="feature-rekap">Baca rekap di web.</h2>
        <p>Saat butuh melihat pola bulanan, sesi, jam mengajar, dan murid sudah terkumpul dalam rekap yang sama.</p>
        <div className="tls-mobile-proof"><PublicProductProof id="recap" /></div>
      </section>

      <section className="tls-story-section tls-feature-chapter" aria-labelledby="feature-invoice">
        <h2 id="feature-invoice">Siapkan invoice dan export.</h2>
        <p>Pilih murid, cek sesi yang masuk, lalu buat invoice dan arsip PDF dari catatan yang sudah tersedia.</p>
        <div className="tls-mobile-proof"><PublicProductProof id="invoice" /></div>
      </section>

      <section className="tls-story-section tls-final-action" aria-labelledby="feature-action">
        <span>Mulai gratis</span>
        <h2 id="feature-action">Lihat alurnya dari satu sesi.</h2>
        <p>Mulai dari mobile, lalu pakai web saat rekap atau invoice dibutuhkan.</p>
        <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
          <Play size={18} weight="fill" />
          <span>Mulai Gratis</span>
        </a>
        <Link className="tls-inline-link" href="/panduan">Baca panduan <ArrowRight size={16} aria-hidden="true" /></Link>
      </section>
    </PublicStoryLayout>
  );
}
