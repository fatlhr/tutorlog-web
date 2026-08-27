import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import LandingTimetableCanvas from "@/components/LandingTimetableCanvas";
import PublicMotion from "@/components/PublicMotion";
import PublicNav from "@/components/PublicNav";
import { AppFooter } from "@/components/ui/footer";
import { PublicProductProof } from "@/components/PublicProductRail";
import { MarketingButton } from "@/components/public-ui/marketing-button";
import { WorkflowCanvas } from "@/components/public-ui/product-evidence/workflow-canvas";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

export default function Home() {
  return (
    <main className="tl-public tl-landing-standard">
      <PublicMotion />
      <PublicNav />

      <section className="tl-landing-hero" aria-labelledby="landing-title">
        <LandingTimetableCanvas />
        <div className="tl-landing-hero-copy">
          <p className="tl-kicker">Untuk tutor privat Indonesia</p>
          <h1 id="landing-title">Rekap dan invoice untuk tutor privat.</h1>
          <p>Catat sesi di HP, lalu cek rekap dan buat invoice di web dengan akun yang sama.</p>
          <div className="tl-landing-hero-actions">
            <MarketingButton
              href={playStoreUrl}
              target="_blank"
              rel="noopener"
              leadingIcon={<Play size={18} weight="fill" />}
            >
              Mulai gratis
            </MarketingButton>
          </div>
        </div>
        <div className="tl-landing-hero-proof tl-landing-mobile-proof">
          <figure className="tl-landing-hero-side-shot" aria-hidden="true">
            <Image
              src="/images/tutorlog-clean-history.png"
              alt=""
              width={1080}
              height={2337}
              sizes="(max-width: 1199px) 132px, 164px"
            />
          </figure>
          <PublicProductProof id="mobile" interactive={false} />
        </div>
      </section>

      <section className="tl-landing-transition" aria-labelledby="landing-transition-title">
        <h2 id="landing-transition-title">Catatan sesi masih tersebar? Rekap jadi harus dihitung ulang.</h2>
        <p>Catat sekali di HP. Data yang sama langsung siap dipakai untuk rekap dan membuat invoice di web.</p>
      </section>

      <div className="tl-landing-feature-rows">
        <WorkflowCanvas />
      </div>

      <section className="tl-landing-next" aria-labelledby="landing-next-title">
        <p id="landing-next-title">Mulai dengan Paket Free. Aktifkan Plus saat kamu perlu mengekspor rekap tanpa batas atau mengunduh PDF invoice.</p>
        <nav aria-label="Jelajahi TutorLog">
          <Link href="/fitur">Lihat fitur <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/harga">Bandingkan paket <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/panduan">Ikuti panduan <ArrowRight size={16} aria-hidden="true" /></Link>
        </nav>
      </section>

      <section className="tl-landing-partner" aria-labelledby="landing-partner-title">
        <p id="landing-partner-title">Cari murid baru?</p>
        <a
          href="https://tutorplis.id"
          target="_blank"
          rel="noopener"
          aria-label="TutorPlis, direktori tutor privat Indonesia (buka di tab baru)"
        >
          TutorPlis <span aria-hidden="true">— direktori tutor privat Indonesia</span>
        </a>
      </section>

      <div className="tl-landing-closing">
        <section className="tls-hover-quote" aria-labelledby="landing-proof">
          <blockquote>
            <p id="landing-proof">“Data murid, jadwal, catatan, sampai pembayaran akhirnya <span>ada di satu tempat.</span>”</p>
            <footer><strong>Miss Binar</strong><span>Guru les privat</span></footer>
          </blockquote>
        </section>

        <section className="tls-final-action" aria-labelledby="landing-action">
          <span>Mulai gratis</span>
          <h2 id="landing-action">Mulai dari satu sesi dulu.</h2>
          <p>Rekap dan invoice berikutnya mengikuti data yang sudah kamu catat.</p>
          <MarketingButton
            href={playStoreUrl}
            target="_blank"
            rel="noopener"
            leadingIcon={<Play size={18} weight="fill" />}
          >
            Mulai gratis
          </MarketingButton>
        </section>
      </div>

      <AppFooter context="public" />
    </main>
  );
}
