import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ChartBar,
  CheckCircle,
  CloudArrowDown,
  DeviceMobile,
  FileText,
  Play,
  Wallet,
} from "@phosphor-icons/react/dist/ssr";
import LandingMotion from "@/components/LandingMotion";
import MenuToggle from "@/components/MenuToggle";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

const storyWords = [
  "Sesi",
  "dicatat",
  "di",
  "HP.",
  "Data",
  "yang",
  "sama",
  "dipakai",
  "lagi",
  "di",
  "web",
  "untuk",
  "rekap",
  "dan",
  "invoice.",
];

function Brand({ size = 40 }: { size?: number }) {
  return (
    <Link className="tl-brand" href="/" aria-label="TutorLog">
      <span className="tl-brand-mark" style={{ width: size, height: size }}>
        <Image src="/tutorlog-logo.png" alt="" width={size} height={size} priority />
      </span>
      <span>TutorLog</span>
    </Link>
  );
}

function DesktopNav() {
  return (
    <nav className="tl-nav" aria-label="Navigasi utama">
      <Brand />
      <div className="tl-nav-links">
        <Link href="/fitur">Fitur</Link>
        <Link href="/harga">Harga</Link>
        <Link href="/panduan">Panduan</Link>
      </div>
      <Link className="tl-nav-login" href="/login">
        Masuk
      </Link>
    </nav>
  );
}

function MobileNav() {
  return (
    <nav className="mob-nav mob-nav-dark tl-mobile-nav" aria-label="Navigasi utama">
      <Brand size={32} />
      <MenuToggle />
    </nav>
  );
}

function HeroCopy({ mobile = false, titleId }: { mobile?: boolean; titleId: string }) {
  return (
    <div className="tl-hero-copy">
      <p className="tl-kicker">Untuk tutor privat Indonesia</p>
      <h1 id={titleId}>
        Rekap dan invoice untuk tutor privat.
      </h1>
      <p className="tl-hero-lede">
        Catat sesi di HP, rapikan rekap dan invoice di web dengan akun yang sama.
      </p>
      <div className={mobile ? "tl-cta-row tl-cta-row-mobile" : "tl-cta-row"}>
        <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
          <Play size={18} weight="fill" />
          <span>Mulai Gratis</span>
        </a>
        <Link className="tl-button tl-button-secondary" href="/fitur">
          <span>Lihat Fitur</span>
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

function ProductShot({
  className,
  src,
  alt,
  width,
  height,
  systemBar = false,
}: {
  className: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  systemBar?: boolean;
}) {
  return (
    <figure className={`tl-product-shot ${systemBar ? "tl-has-system-bar" : ""} ${className}`}>
      {systemBar ? (
        <span className="tl-phone-system-bar" aria-hidden="true">
          <span>10:00</span>
          <span className="tl-phone-system-icons">
            <i />
            <i />
          </span>
        </span>
      ) : null}
      <Image src={src} alt={alt} width={width} height={height} sizes="(max-width: 767px) 78vw, 360px" />
    </figure>
  );
}

function ProductStack() {
  return (
    <div className="tl-preview-stack">
      <div className="tl-stack-glow" />
      <ProductShot
        className="tl-shot-home"
        src="/images/tutorlog-clean-home.png"
        alt="Tampilan mobile TutorLog untuk mulai sesi les"
        width={1080}
        height={2400}
        systemBar
      />
      <ProductShot
        className="tl-shot-recap"
        src="/images/tutorlog-clean-recap.png"
        alt="Tampilan mobile TutorLog untuk rekap sesi"
        width={1080}
        height={2400}
        systemBar
      />
      <ProductShot
        className="tl-shot-history"
        src="/images/tutorlog-clean-history.png"
        alt="Tampilan mobile TutorLog untuk riwayat sesi"
        width={1080}
        height={2337}
        systemBar
      />
    </div>
  );
}

function BentoTile({
  className,
  icon,
  title,
  body,
  children,
}: {
  className?: string;
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <article className={`tl-bento-card ${className ?? ""}`}>
      <div className="tl-bento-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </article>
  );
}

function BentoSection() {
  return (
    <section className="tl-section tl-bento-section" aria-labelledby="bento-title">
      <div className="tl-section-head">
        <h2 id="bento-title">Yang biasanya tercecer, mulai saling nyambung.</h2>
        <p>
          TutorLog sengaja menyisakan jejak kecil di tiap layar, biar calon user bisa menebak alurnya sebelum membaca semua detail.
        </p>
      </div>
      <div className="tl-bento-grid">
        <BentoTile
          className="tl-bento-wide"
          icon={<FileText size={22} />}
          title="Invoice terlihat seperti dokumen kerja, bukan catatan dadakan."
          body="Template, warna, rekening, dan item sesi diambil dari data mengajar yang sudah ada."
        >
          <div className="tl-mini-invoice">
            <div className="tl-mini-invoice-head">
              <span>Invoice</span>
              <b>Draft</b>
            </div>
            <strong>Rp 2.72jt</strong>
            <div className="tl-mini-invoice-lines">
              <span>Bintang Wijaya</span>
              <b>Rp 720rb</b>
            </div>
            <div className="tl-mini-invoice-lines">
              <span>Kirana Putri</span>
              <b>Rp 360rb</b>
            </div>
            <div className="tl-mini-invoice-total">
              <span>Siap export</span>
              <CheckCircle size={16} weight="fill" />
            </div>
          </div>
        </BentoTile>
        <BentoTile
          icon={<ChartBar size={22} />}
          title="Rekap bulanan langsung kebaca."
          body="Sesi, jam, murid, dan pendapatan tidak perlu dihitung ulang."
        >
          <ProductShot
            className="tl-bento-shot tl-bento-shot-recap"
            src="/images/tutorlog-clean-recap.png"
            alt="Screenshot rekap sesi TutorLog mobile"
            width={1080}
            height={2400}
          />
        </BentoTile>
        <BentoTile
          icon={<DeviceMobile size={22} />}
          title="HP tetap jadi tempat catat."
          body="Web tidak mengganti flow mobile. Web merapikan setelah sesi selesai."
        >
          <ProductShot
            className="tl-bento-shot tl-bento-shot-start"
            src="/images/tutorlog-clean-home.png"
            alt="Screenshot pencatatan sesi TutorLog mobile"
            width={1080}
            height={2400}
          />
        </BentoTile>
        <BentoTile
          icon={<CloudArrowDown size={22} />}
          title="Export saat butuh arsip."
          body="PDF dan CSV siap dipakai untuk tagihan, arsip pribadi, atau laporan."
        >
          <div className="tl-export-placeholder" aria-label="Placeholder screenshot export PDF dan CSV">
            <div className="tl-export-doc">
              <span>Export</span>
              <strong>PDF</strong>
              <strong>CSV</strong>
            </div>
            <div className="tl-export-sheet">
              <span>Bima</span>
              <b>Rp 80.000</b>
              <small>Siap diganti screenshot export</small>
            </div>
          </div>
        </BentoTile>
        <BentoTile
          icon={<Wallet size={22} />}
          title="Mulai gratis, upgrade kalau cocok."
          body="Free cukup untuk mencoba flow. Plus membuka export invoice tanpa batas."
        >
          <div className="tl-mini-price">
            <div>
              <span>Free</span>
              <strong>Catat sesi</strong>
            </div>
            <div>
              <span>Plus</span>
              <strong>Export invoice</strong>
            </div>
          </div>
        </BentoTile>
      </div>
    </section>
  );
}

function FlowSection() {
  return (
    <section className="tl-section tl-flow-section" aria-labelledby="flow-title">
      <div className="tl-flow-copy">
        <h2 id="flow-title">Catat sekali, pakai lagi saat rekap.</h2>
        <p className="tl-story-text">
          {storyWords.map((word) => (
            <span className="tl-word" key={word}>
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
      <div className="tl-flow-rows">
        <article className="tl-flow-row">
          <div>
            <span>Catat</span>
            <h3>Satu sesi selesai, datanya langsung masuk.</h3>
            <p>Materi, durasi, dan murid dicatat dari mobile.</p>
          </div>
          <ProductShot
            className="tl-flow-shot tl-flow-product"
            src="/images/tutorlog-clean-home.png"
            alt="Tampilan mulai sesi TutorLog mobile"
            width={1080}
            height={2400}
            systemBar
          />
        </article>
        <article className="tl-flow-row">
          <div>
            <span>Rekap</span>
            <h3>Buka web saat perlu lihat bulanan.</h3>
            <p>Sesi dan jam mengajar sudah terkumpul.</p>
          </div>
          <figure className="tl-flow-slot tl-flow-product" aria-label="Slot screenshot rekap TutorLog web">
            <ChartBar size={34} weight="duotone" aria-hidden="true" />
            <figcaption>Screenshot rekap web</figcaption>
          </figure>
        </article>
        <article className="tl-flow-row">
          <div>
            <span>Invoice</span>
            <h3>Invoice tinggal dicek sebelum dikirim.</h3>
            <p>Detail sesi sudah masuk ke preview A4.</p>
          </div>
          <figure className="tl-flow-slot tl-flow-product" aria-label="Slot screenshot invoice TutorLog">
            <FileText size={34} weight="duotone" aria-hidden="true" />
            <figcaption>Screenshot invoice</figcaption>
          </figure>
        </article>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="tl-section tl-proof-section" aria-labelledby="proof-title">
      <p className="tl-proof-kicker">Dari tutor yang mengajar tiap minggu</p>
      <blockquote className="tl-proof-quote">
        <h2 id="proof-title">Bukan aplikasi admin yang terasa jauh dari kelas.</h2>
        <p>
          “Data murid, jadwal, catatan, sampai pembayaran akhirnya <span>ada di satu tempat.</span>”
        </p>
      </blockquote>
      <div className="tl-proof-person">
        <span>B</span>
        <div>
          <strong>Miss Binar</strong>
          <small>Guru les privat</small>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="tl-final-cta" aria-labelledby="final-cta-title">
      <h2 id="final-cta-title">Coba dari satu sesi dulu.</h2>
      <p>Kalau alurnya cocok, rekap dan invoice berikutnya tinggal mengikuti data yang kamu catat.</p>
      <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
        <Play size={18} weight="fill" />
        <span>Mulai Gratis</span>
      </a>
    </section>
  );
}

function Footer() {
  return (
    <footer className="tl-footer">
      <div className="tl-footer-links">
        <Link href="/fitur">Fitur</Link>
        <Link href="/harga">Harga</Link>
        <Link href="/panduan">Panduan</Link>
        <Link href="/privacy">Privasi</Link>
        <Link href="/terms">Syarat</Link>
        <Link href="/account">Hapus Akun</Link>
        <Link href="/kontak">Kontak</Link>
      </div>
      <div className="tl-footer-bottom">
        <Brand size={28} />
        <span>© 2026 TutorLog untuk tutor Indonesia</span>
      </div>
    </footer>
  );
}

function DesktopLanding() {
  return (
    <div className="vp-desktop">
      <main className="tl-landing tl-landing-desktop">
        <DesktopNav />
        <section className="tl-hero" aria-labelledby="home-title">
          <HeroCopy titleId="home-title" />
          <ProductStack />
        </section>
        <BentoSection />
        <FlowSection />
        <TestimonialSection />
        <FinalCta />
        <Footer />
      </main>
    </div>
  );
}

function MobileLanding() {
  return (
    <div className="vp-mobile">
      <main className="mob-page tw tl-landing tl-landing-mobile">
        <MobileNav />
        <section className="tl-hero tl-mobile-hero" aria-labelledby="home-title-mobile">
          <HeroCopy mobile titleId="home-title-mobile" />
          <ProductStack />
        </section>
        <BentoSection />
        <FlowSection />
        <TestimonialSection />
        <FinalCta />
        <Footer />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <LandingMotion />
      <MobileLanding />
      <DesktopLanding />
    </>
  );
}
