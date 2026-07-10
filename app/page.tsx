import Link from "next/link";
import { ArrowRight, Play } from "@phosphor-icons/react/dist/ssr";
import PublicMotion from "@/components/PublicMotion";
import PublicNav from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicShell";
import { PublicProductProof } from "@/components/PublicProductRail";

const playStoreUrl = "https://play.google.com/store/apps/details?id=com.tutorlog.app";

const proofStories = [
  {
    id: "mobile" as const,
    title: "Catat sesi saat selesai mengajar.",
    body: "Materi, durasi, murid, dan tarif tersimpan dari HP saat detailnya masih dekat.",
  },
  {
    id: "recap" as const,
    title: "Baca rekap tanpa merapikan ulang.",
    body: "Saat waktunya melihat bulanan, sesi dan pendapatan sudah ada dalam satu tampilan web.",
  },
  {
    id: "invoice" as const,
    title: "Siapkan invoice dari sesi yang sama.",
    body: "Pilih sesi, cek detailnya, lalu kirim invoice atau simpan arsip saat dibutuhkan.",
  },
];

export default function Home() {
  return (
    <main className="tl-public tl-landing-standard">
      <PublicMotion />
      <PublicNav />

      <section className="tl-landing-hero" aria-labelledby="landing-title">
        <div className="tl-landing-hero-copy">
          <p className="tl-kicker">Untuk tutor privat Indonesia</p>
          <h1 id="landing-title">Rekap dan invoice untuk tutor privat.</h1>
          <p>Catat sesi di HP, rapikan rekap dan invoice di web dengan akun yang sama.</p>
          <a className="tl-button tl-button-primary" href={playStoreUrl} target="_blank" rel="noopener">
            <Play size={18} weight="fill" />
            <span>Mulai Gratis</span>
          </a>
        </div>
        <div className="tl-landing-hero-proof tl-landing-mobile-proof">
          <PublicProductProof id="mobile" />
        </div>
      </section>

      <section className="tl-landing-intro" aria-labelledby="landing-intro-title">
        <h2 id="landing-intro-title">Catat sekali. Pakai lagi saat waktunya rekap.</h2>
        <p>TutorLog menyimpan jejak sesi yang biasanya tercecer agar pekerjaan setelah kelas tidak dimulai dari nol.</p>
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

      <section className="tl-landing-pricing" aria-labelledby="landing-price">
        <div>
          <h2 id="landing-price">Mulai gratis, upgrade kalau cocok.</h2>
          <p>Paket mengikuti kebutuhan setelah alur catat dan rekap mulai terasa membantu.</p>
        </div>
        <div className="tls-price-ledger">
          <div><strong>Free</strong><span>Catat sesi</span></div>
          <div><strong>Plus</strong><span>Rekap, invoice, dan export</span></div>
        </div>
        <Link className="tls-inline-link" href="/harga">Lihat detail harga <ArrowRight size={16} aria-hidden="true" /></Link>
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
