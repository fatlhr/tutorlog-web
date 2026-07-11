import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import { PublicProductProof } from "@/components/PublicProductRail";
import { PublicStoryLayout } from "@/components/PublicStoryLayout";

export const metadata: Metadata = {
  title: "TutorLog - Fitur",
  description: "Catat sesi dan revisi riwayat di mobile, lalu cek rekap, export, dan invoice dari data TutorLog yang sama.",
};

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

export default function FiturPage() {
  return (
    <PublicStoryLayout
      className="tls-features"
      eyebrow="Fitur TutorLog"
      title="Data les bergerak dari HP ke rekap."
      subtitle="Mobile dipakai saat mengajar. Web dipakai saat data itu perlu dibaca, diarsipkan, atau dikirim."
      withRail={false}
      closing={(
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
      )}
    >
      <section className="tls-feature-row" data-feature-row="mobile" aria-labelledby="feature-catat">
        <div className="tls-feature-copy">
          <h2 id="feature-catat">Catat sesi di HP.</h2>
          <p>Selesai mengajar, tutor cukup menyimpan materi, durasi, murid, dan nominal dari mobile.</p>
        </div>
        <div className="tls-feature-row-divider" aria-hidden="true" />
        <PublicProductProof id="mobile" annotation />
      </section>

      <section className="tls-feature-row" data-feature-row="history" aria-labelledby="feature-riwayat">
        <div className="tls-feature-copy">
          <h2 id="feature-riwayat">Buka riwayat dan revisi catatan.</h2>
          <p>Riwayat menyimpan sesi yang sudah selesai. Dari HP, buka detailnya untuk membaca atau memperbarui catatan bila ada yang perlu dikoreksi.</p>
        </div>
        <div className="tls-feature-row-divider" aria-hidden="true" />
        <PublicProductProof id="history" annotation />
      </section>

      <section className="tls-feature-row" data-feature-row="recap" aria-labelledby="feature-rekap">
        <div className="tls-feature-copy">
          <h2 id="feature-rekap">Rekap dan export dari perangkat yang kamu pakai.</h2>
          <p>Pilih rentang dan murid, lalu cek sesi yang terkumpul. Rekap serta export PDF atau CSV tersedia di mobile dan web.</p>
        </div>
        <div className="tls-feature-row-divider" aria-hidden="true" />
        <PublicProductProof id="recap" annotation />
      </section>

      <section className="tls-feature-row" data-feature-row="invoice" aria-labelledby="feature-invoice">
        <div className="tls-feature-copy">
          <h2 id="feature-invoice">Buat invoice di web.</h2>
          <p>Pilih sesi yang akan ditagihkan, atur template dan warna, lalu export PDF yang siap dikirim ke wali murid.</p>
        </div>
        <div className="tls-feature-row-divider" aria-hidden="true" />
        <PublicProductProof id="invoice" annotation />
      </section>
    </PublicStoryLayout>
  );
}
