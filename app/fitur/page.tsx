import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  ChartBar,
  CloudArrowDown,
  Desktop,
  DeviceMobile,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "TutorLog - Fitur",
  description: "Rekap bulanan, export PDF dan CSV, invoice builder, dan sinkronisasi app untuk tutor privat.",
};

const features = [
  {
    icon: <DeviceMobile size={22} />,
    title: "Catat sesi tetap dari HP.",
    body: "Sesi selesai, tutor cukup simpan dari mobile. Materi, durasi, murid, dan nominal ikut terbawa.",
    visual: "phone",
  },
  {
    icon: <ChartBar size={22} />,
    title: "Web membaca bulanannya.",
    body: "Saat butuh melihat pola, buka companion web. Data yang sama berubah jadi rekap murid dan pendapatan.",
    visual: "web",
  },
  {
    icon: <FileText size={22} />,
    title: "Invoice tidak mulai dari nol.",
    body: "Pilih murid, cek sesi yang masuk, lalu export. Detailnya sudah datang dari catatan mengajar.",
    visual: "invoice",
  },
  {
    icon: <CloudArrowDown size={22} />,
    title: "Export disiapkan sebagai arsip.",
    body: "PDF dan CSV tetap ada untuk laporan atau bukti pembayaran. Screenshot export final bisa kamu pasang nanti.",
    visual: "export",
  },
];

const railSteps = ["Catat", "Rekap", "Invoice", "Export"];

function FeatureVisual({ type }: { type: string }) {
  if (type === "phone") {
    return (
      <figure className="tl-strip-phone tl-public-product">
        <Image src="/images/tutorlog-clean-home.png" alt="Tampilan mulai sesi TutorLog mobile" width={1080} height={2400} />
      </figure>
    );
  }

  if (type === "web") {
    return (
      <figure className="tl-strip-slot tl-public-product" aria-label="Slot screenshot rekap TutorLog web">
        <Desktop size={42} weight="duotone" aria-hidden="true" />
        <figcaption><strong>Screenshot rekap web</strong><span>Siap diganti dengan layar rekap unggulan.</span></figcaption>
      </figure>
    );
  }

  if (type === "invoice") {
    return (
      <figure className="tl-strip-slot tl-public-product" aria-label="Slot screenshot invoice TutorLog">
        <FileText size={42} weight="duotone" aria-hidden="true" />
        <figcaption><strong>Screenshot invoice</strong><span>Pasang preview invoice A4 setelah asset tersedia.</span></figcaption>
      </figure>
    );
  }

  return (
    <figure className="tl-strip-slot tl-public-product" aria-label="Slot screenshot export PDF dan CSV">
      <CloudArrowDown size={42} weight="duotone" aria-hidden="true" />
      <figcaption><strong>Screenshot export PDF dan CSV</strong><span>Slot dummy untuk diganti manual.</span></figcaption>
    </figure>
  );
}

function ProductRail() {
  return (
    <div className="tl-product-rail" aria-label="Visual alur TutorLog">
      <div className="tl-rail-path" aria-hidden="true">
        <span>Alur data</span>
        <ol>
          {railSteps.map((step, index) => (
            <li key={step}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <small>{step}</small>
              {index < railSteps.length - 1 ? <ArrowDown size={16} weight="bold" /> : null}
            </li>
          ))}
        </ol>
      </div>
      <figure className="tl-rail-shot tl-rail-shot-main tl-public-product">
        <Image src="/images/tutorlog-clean-history-list.png" alt="Daftar sesi TutorLog mobile" width={1080} height={2400} priority />
      </figure>
      <div className="tl-rail-note tl-rail-note-top">Mobile mencatat sesi</div>
      <div className="tl-rail-note tl-rail-note-bottom">Web merapikan rekap</div>
    </div>
  );
}

export default function FiturPage() {
  return (
    <PublicShell
      eyebrow="Fitur TutorLog"
      title="Data les bergerak dari HP ke rekap."
      subtitle="Mobile dipakai saat mengajar. Web dipakai saat data itu perlu dibaca, diarsipkan, atau dikirim."
      icon={null}
      className="tl-public-features"
    >
      <section className="tl-feature-story" aria-label="Daftar fitur TutorLog">
        <aside className="tl-feature-pin">
          <ProductRail />
          <p>Catatan yang dibuat dekat kelas akan tetap siap dibaca saat pekerjaan administrasi dimulai.</p>
        </aside>
        <div className="tl-feature-strips">
          {features.map((feature, index) => (
            <article className="tl-feature-strip tl-public-motion" key={feature.title}>
              <div className="tl-strip-copy">
                <div className="tl-strip-route" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <ArrowRight size={20} weight="bold" />
                </div>
                <span aria-hidden="true">{feature.icon}</span>
                <h2>{feature.title}</h2>
                <p>{feature.body}</p>
              </div>
              <FeatureVisual type={feature.visual} />
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
