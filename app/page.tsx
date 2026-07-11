import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import LandingDemoDialog from "@/components/LandingDemoDialog";
import LandingTimetableCanvas from "@/components/LandingTimetableCanvas";
import PublicMotion from "@/components/PublicMotion";
import PublicNav from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicShell";
import { PublicProductProof } from "@/components/PublicProductRail";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

const proofStories = [
  {
    id: "mobile" as const,
    title: "Catat sesi setelah mengajar.",
    body: "Simpan materi, durasi, murid, tarif, dan lokasi dari HP selagi detailnya masih dekat.",
  },
  {
    id: "recap" as const,
    title: "Buka rekap saat dibutuhkan.",
    body: "Sesi, jam, pendapatan, dan murid sudah tersusun untuk dibaca atau diekspor dari mobile maupun web.",
  },
  {
    id: "invoice" as const,
    title: "Buat invoice dari sesi yang sama.",
    body: "Pilih sesi dan periksa invoice di web sebelum disimpan atau dikirim.",
  },
];

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
          <p>Catat sesi di HP, rapikan rekap dan invoice di web dengan akun yang sama.</p>
          <div className="tl-landing-hero-actions">
            <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
              <Play size={18} weight="fill" />
              <span>Mulai Gratis</span>
            </a>
            <LandingDemoDialog />
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
          <PublicProductProof id="mobile" />
        </div>
      </section>

      <section className="tl-landing-transition" aria-labelledby="landing-transition-title">
        <h2 id="landing-transition-title">Catatan sesi tersebar. Rekap harus dihitung ulang.</h2>
        <p>Catat sekali di HP. Data yang sama langsung siap dipakai untuk rekap dan membuat invoice di web.</p>
      </section>

      <section className="tl-landing-feature-rows" aria-label="Alur produk TutorLog">
        {proofStories.map((story) => (
          <article className="tl-landing-proof-story" key={story.id}>
            <div className="tl-landing-proof-copy">
              <h2>{story.title}</h2>
              <p>{story.body}</p>
            </div>
            <PublicProductProof id={story.id} annotation />
          </article>
        ))}
      </section>

      <section className="tl-landing-next" aria-labelledby="landing-next-title">
        <p id="landing-next-title">Mulai gratis. Upgrade saat kamu membutuhkan export dan invoice tanpa batas.</p>
        <nav aria-label="Jelajahi TutorLog">
          <Link href="/fitur">Lihat fitur <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/harga">Bandingkan paket <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href="/panduan">Ikuti panduan <ArrowRight size={16} aria-hidden="true" /></Link>
        </nav>
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
          <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
            <Play size={18} weight="fill" />
            <span>Mulai Gratis</span>
          </a>
        </section>
      </div>

      <PublicFooter />
    </main>
  );
}
