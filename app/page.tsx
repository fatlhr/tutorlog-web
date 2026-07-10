import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import { PublicProductProof } from "@/components/PublicProductRail";
import { PublicStoryLayout } from "@/components/PublicStoryLayout";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

export default function Home() {
  return (
    <PublicStoryLayout
      className="tls-landing"
      eyebrow="Untuk tutor privat Indonesia"
      title="Rekap dan invoice untuk tutor privat."
      subtitle="Catat sesi di HP, rapikan rekap dan invoice di web dengan akun yang sama."
      railLabel="Bukti produk TutorLog untuk tutor privat"
      actions={
        <>
          <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
            <Play size={18} weight="fill" />
            <span>Mulai Gratis</span>
          </a>
          <Link className="tls-secondary-link" href="/fitur">
            Lihat fitur <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </>
      }
    >
      <div className="tls-mobile-proof"><PublicProductProof id="mobile" /></div>

      <section className="tls-story-section" aria-labelledby="landing-problem">
        <h2 id="landing-problem">Yang biasanya tercecer, kini terkumpul.</h2>
        <p>TutorLog menyatukan catatan sesi, murid, durasi, tarif, dan lokasi dalam data yang sama.</p>
        <div className="tls-mobile-proof"><PublicProductProof id="recap" /></div>
      </section>

      <section className="tls-story-section tls-price-cue" aria-labelledby="landing-price">
        <h2 id="landing-price">Mulai gratis, upgrade kalau cocok.</h2>
        <p>Paket mengikuti kebutuhan setelah alur catat dan rekap mulai terasa membantu.</p>
        <div className="tls-price-ledger">
          <div><strong>Free</strong><span>Catat sesi</span></div>
          <div><strong>Plus</strong><span>Rekap, invoice, dan export</span></div>
        </div>
        <Link className="tls-inline-link" href="/harga">Lihat detail harga <ArrowRight size={16} aria-hidden="true" /></Link>
        <div className="tls-mobile-proof"><PublicProductProof id="invoice" /></div>
      </section>

      <section className="tls-story-section tls-hover-quote" aria-labelledby="landing-proof">
        <blockquote>
          <p id="landing-proof">“Data murid, jadwal, catatan, sampai pembayaran akhirnya <span>ada di satu tempat.</span>”</p>
          <footer><strong>Miss Binar</strong><span>Guru les privat</span></footer>
        </blockquote>
      </section>

      <section className="tls-story-section tls-final-action" aria-labelledby="landing-action">
        <span>Mulai gratis</span>
        <h2 id="landing-action">Mulai dari satu sesi dulu.</h2>
        <p>Rekap dan invoice berikutnya mengikuti data yang sudah kamu catat.</p>
        <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
          <Play size={18} weight="fill" />
          <span>Mulai Gratis</span>
        </a>
      </section>
    </PublicStoryLayout>
  );
}
