import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ChartBar,
  Desktop,
  DownloadSimple,
  EnvelopeSimple,
  FileText,
  Timer,
  UserPlus,
} from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "TutorLog - Panduan",
  description: "Dari download aplikasi sampai invoice pertama, panduan singkat pakai TutorLog.",
};

const steps = [
  {
    verb: "Download",
    title: "Pasang aplikasi mobile.",
    body: "Daftar dengan email yang sama untuk mobile dan web.",
    phase: "Mobile",
    icon: <DownloadSimple size={20} />,
  },
  {
    verb: "Tambah",
    title: "Isi murid dan tarif.",
    body: "Nama, kelas, tipe tagihan, dan tarif jadi dasar rekap berikutnya.",
    phase: "Mobile",
    icon: <UserPlus size={20} />,
  },
  {
    verb: "Catat",
    title: "Mulai sesi les.",
    body: "Pilih murid, mulai timer, lalu simpan saat kelas selesai.",
    phase: "Mobile",
    icon: <Timer size={20} />,
  },
  {
    verb: "Masuk",
    title: "Buka web dengan email yang sama.",
    body: "Magic link menghubungkan akun web dengan catatan dari mobile.",
    phase: "Web",
    icon: <EnvelopeSimple size={20} />,
  },
  {
    verb: "Rekap",
    title: "Lihat bulanannya.",
    body: "Sesi, jam, dan murid sudah terkumpul untuk dicek ulang.",
    phase: "Web",
    icon: <ChartBar size={20} />,
  },
  {
    verb: "Kirim",
    title: "Buat invoice.",
    body: "Pilih murid, cek detail sesi, export PDF, lalu kirim.",
    phase: "Web",
    icon: <FileText size={20} />,
  },
];

function GuideRail() {
  return (
    <div className="tl-guide-rail">
      <figure className="tl-guide-phone tl-public-product">
        <Image src="/images/tutorlog-clean-home.png" alt="Mulai sesi di TutorLog mobile" width={1080} height={2400} priority />
      </figure>
      <figure className="tl-guide-web-slot tl-public-product">
        <Desktop size={34} weight="duotone" aria-hidden="true" />
        <figcaption><strong>Screenshot web companion</strong><span>Slot untuk layar rekap atau invoice.</span></figcaption>
      </figure>
    </div>
  );
}

export default function PanduanPage() {
  return (
    <PublicShell
      eyebrow="Panduan TutorLog"
      title="Catat di HP, lanjutkan di web."
      subtitle="Ikuti alur pendek ini kalau ingin melihat bagaimana mobile app dan web companion saling nyambung."
      icon={null}
    >
      <section className="tl-guide-story" aria-label="Langkah menggunakan TutorLog">
        <aside className="tl-guide-pin">
          <GuideRail />
          <div className="tl-guide-intro tl-public-motion">
            <h2>Dua tempat, satu email.</h2>
            <p>
              Mobile dekat dengan sesi mengajar. Web dekat dengan pekerjaan setelahnya: rekap, export, dan invoice.
            </p>
            <Link className="tl-public-button" href="/kontak">Butuh bantuan?</Link>
          </div>
        </aside>
        <div className="tl-guide-steps">
          {steps.map((step) => (
            <article className="tl-guide-step tl-public-motion" key={step.title}>
              <div className="tl-guide-step-meta">
                <span>{step.verb}</span>
                <small>{step.phase}</small>
              </div>
              <span className="tl-guide-step-icon" aria-hidden="true">{step.icon}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
