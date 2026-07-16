import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import { PublicProductProof } from "@/components/PublicProductRail";
import { PublicStoryLayout } from "@/components/PublicStoryLayout";
import { MarketingButton } from "@/components/public-ui/marketing-button";

export const metadata: Metadata = {
  title: "TutorLog - Fitur",
  description: "Catat sesi dan perbarui riwayat di HP, lalu cek rekap, ekspor data, dan buat invoice di web TutorLog.",
};

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

export default function FiturPage() {
  return (
    <PublicStoryLayout
      className="tls-features"
      eyebrow="Fitur TutorLog"
      title="Catat di HP, lanjutkan rekap di web."
      subtitle="Gunakan HP saat mengajar. Buka web saat perlu mengecek rekap, mengekspor data, atau membuat invoice."
      withRail={false}
      showBackLink
      closing={(
        <section className="tls-story-section tls-final-action" aria-labelledby="feature-action">
          <span>Mulai gratis</span>
          <h2 id="feature-action">Lihat alurnya dari satu sesi.</h2>
          <p>Mulai dari HP, lalu buka web saat kamu perlu mengecek rekap atau membuat invoice.</p>
          <MarketingButton
            href={playStoreUrl}
            target="_blank"
            rel="noopener"
            leadingIcon={<Play size={18} weight="fill" />}
          >
            Mulai Gratis
          </MarketingButton>
          <Link className="tls-inline-link" href="/panduan">Baca panduan <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      )}
    >
      <section className="tls-feature-evidence-group tls-feature-mobile-workspace" data-evidence-group="mobile-workspace" aria-labelledby="feature-mobile-workspace">
        <div className="tls-feature-evidence-item">
          <div className="tls-feature-evidence-copy">
            <p className="tls-feature-platform">Aplikasi HP</p>
            <h2 id="feature-mobile-workspace">Catat sesi di HP.</h2>
            <p>Simpan materi, durasi, murid, tarif, dan lokasi segera setelah kelas selesai.<span className="tls-feature-detail"> Datanya langsung masuk ke rekap.</span></p>
          </div>
          <div className="tls-feature-evidence-proof"><PublicProductProof id="mobile" annotation /></div>
        </div>
        <div className="tls-feature-evidence-item">
          <div className="tls-feature-evidence-copy">
            <p className="tls-feature-platform">Riwayat sesi</p>
            <h2>Buka riwayat dan revisi catatan.</h2>
            <p>Semua sesi yang selesai tersimpan di riwayat, lengkap dengan catatan mengajar dan detail pembayaran.<span className="tls-feature-detail"> Buka dari HP untuk mengecek atau memperbarui informasi saat ada revisi.</span></p>
          </div>
          <div className="tls-feature-evidence-proof"><PublicProductProof id="history" annotation /></div>
        </div>
      </section>

      <section className="tls-feature-evidence-group" data-evidence-group="cross-device-recap" aria-labelledby="feature-rekap">
        <div className="tls-feature-evidence-item">
          <div className="tls-feature-evidence-copy">
            <p className="tls-feature-platform">HP dan web</p>
            <h2 id="feature-rekap">Rekap dan ekspor dari perangkat yang kamu pakai.</h2>
            <p>Lihat sesi, total jam mengajar, pendapatan, dan murid dalam satu rekap.<span className="tls-feature-detail"> Ekspor ke PDF atau CSV dari HP maupun web saat ingin dibagikan atau disimpan.</span></p>
          </div>
          <div className="tls-feature-evidence-proof"><PublicProductProof id="recap" annotation /></div>
        </div>
      </section>

      <section className="tls-feature-evidence-group" data-evidence-group="invoice-output" aria-labelledby="feature-invoice">
        <div className="tls-feature-evidence-item">
          <div className="tls-feature-evidence-copy">
            <p className="tls-feature-platform">Web</p>
            <h2 id="feature-invoice">Buat invoice di web.</h2>
            <p>Pilih sesi yang ingin ditagih, atur tampilan invoice, lalu periksa hasilnya sebelum dikirim.<span className="tls-feature-detail"> Invoice dibuat di web agar detailnya lebih nyaman dicek.</span></p>
          </div>
          <div className="tls-feature-evidence-proof"><PublicProductProof id="invoice" annotation /></div>
        </div>
      </section>
    </PublicStoryLayout>
  );
}
