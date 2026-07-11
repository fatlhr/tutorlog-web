import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PublicProductProof } from "@/components/PublicProductRail";
import { PublicStoryLayout } from "@/components/PublicStoryLayout";

export const metadata: Metadata = {
  title: "TutorLog - Panduan",
  description: "Panduan singkat mencatat sesi di mobile, melihat rekap, dan membuat invoice di TutorLog.",
};

const mobileSteps = [
  ["Pasang aplikasi mobile.", "Daftar dengan email yang sama untuk mobile dan web."],
  ["Isi murid dan tarif.", "Nama, kelas, tipe tagihan, dan tarif menjadi dasar rekap berikutnya."],
  ["Simpan sesi les.", "Pilih murid, mulai timer, lalu simpan saat kelas selesai."],
] as const;

const webSteps = [
  ["Buka web dengan email yang sama.", "Magic link menghubungkan akun web dengan catatan dari mobile."],
  ["Lihat rekap bulanannya.", "Sesi, jam, dan murid sudah terkumpul untuk dicek ulang."],
  ["Buat invoice.", "Pilih murid, cek detail sesi, export PDF, lalu kirim."],
] as const;

function GuideSteps({ steps }: { steps: readonly (readonly [string, string])[] }) {
  return (
    <ol className="tls-guide-step-list">
      {steps.map(([title, body]) => (
        <li className="tls-guide-step" key={title}>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ol>
  );
}

export default function PanduanPage() {
  return (
    <PublicStoryLayout
      className="tls-guide"
      eyebrow="Panduan TutorLog"
      title="Catat di HP, buat invoice di web."
      subtitle="Ikuti alur singkat ini untuk melihat bagaimana mobile app dan web companion memakai data yang sama."
      railLabel="Alur penggunaan TutorLog"
      showBackLink
      closing={(
        <section className="tls-story-section tls-final-action" aria-labelledby="guide-action">
          <span>Butuh bantuan?</span>
          <h2 id="guide-action">Kami bisa bantu mulai dari alurnya.</h2>
          <p>Hubungi TutorLog kalau ada pertanyaan saat memasang aplikasi atau membuat invoice pertama.</p>
          <Link className="tls-inline-link" href="/kontak">Hubungi TutorLog <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      )}
    >
      <section className="tls-story-section tls-guide-phase" aria-labelledby="guide-mobile">
        <h2 id="guide-mobile">Di HP.</h2>
        <p>Mobile dipakai saat kamu dekat dengan sesi mengajar.</p>
        <GuideSteps steps={mobileSteps} />
        <div className="tls-mobile-proof"><PublicProductProof id="mobile" /></div>
      </section>

      <section className="tls-story-section tls-guide-phase" aria-labelledby="guide-web">
        <h2 id="guide-web">Di web.</h2>
        <p>Web dipakai saat data yang sudah terkumpul perlu dibaca, dicek, atau dikirim.</p>
        <GuideSteps steps={webSteps} />
        <div className="tls-mobile-proof"><PublicProductProof id="recap" /></div>
        <div className="tls-mobile-proof"><PublicProductProof id="invoice" /></div>
      </section>
    </PublicStoryLayout>
  );
}
