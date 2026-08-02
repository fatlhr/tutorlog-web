import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";
import { MarketingButton } from "@/components/public-ui/marketing-button";
import { MobileGuideEvidence, WebGuideEvidence } from "@/components/public-ui/product-evidence/workflow-canvas";

export const metadata: Metadata = {
  title: "TutorLog - Panduan",
  description: "Panduan singkat mencatat sesi di HP, melihat rekap, dan membuat invoice di web TutorLog.",
};

const mobileSteps = [
  ["Pasang aplikasi di HP.", "Daftar dengan email yang sama untuk aplikasi dan web TutorLog."],
  ["Isi murid dan tarif.", "Nama, tingkat pendidikan, tipe tagihan, dan tarif menjadi dasar rekap berikutnya."],
  ["Simpan sesi les.", "Pilih murid, mulai timer, lalu simpan saat kelas selesai."],
] as const;

const webSteps = [
  ["Masuk ke web dengan email yang sama.", "Kami mengirim tautan masuk ke emailmu agar catatan dari aplikasi bisa dibuka di web."],
  ["Lihat rekap bulanannya.", "Sesi, durasi, dan murid sudah terkumpul untuk dicek ulang."],
  ["Buat invoice.", "Pilih murid dan periode, periksa draft, lalu unduh PDF saat Plus aktif."],
] as const;

function PhaseSection({
  title,
  description,
  steps,
  stepOffset = 0,
  evidence,
}: {
  title: string;
  description: string;
  steps: readonly (readonly [string, string])[];
  stepOffset?: number;
  evidence: ReactNode;
}) {
  return (
    <section className="tl-guide-phase">
      <div className="tl-guide-phase-copy">
        <div className="tl-guide-phase-header">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <ol className="tl-guide-steps">
          {steps.map(([stepTitle, stepBody], idx) => (
            <li className="tl-guide-step" key={stepTitle}>
              <span className="tl-guide-step-badge" aria-hidden="true">{String(idx + stepOffset + 1).padStart(2, "0")}</span>
              <div className="tl-guide-step-body">
                <h3>{stepTitle}</h3>
                <p>{stepBody}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="tl-guide-inline-proof">{evidence}</div>
    </section>
  );
}

export default function PanduanPage() {
  return (
    <PublicShell
      className="tl-public-guide"
      eyebrow="Panduan TutorLog"
      title="Catat di HP, buat invoice di web."
      subtitle="Ikuti alur dari mencatat sesi di HP sampai membuat invoice di web."
      icon={null}
      showBackLink
    >
      <div className="tl-guide-phases">
        <PhaseSection
          title="Di HP."
          description="Gunakan aplikasi di HP saat mencatat sesi mengajar."
          steps={mobileSteps}
          stepOffset={0}
          evidence={<MobileGuideEvidence />}
        />
        <PhaseSection
          title="Di web."
          description="Buka web saat ingin mengecek rekap atau membuat invoice."
          steps={webSteps}
          stepOffset={3}
          evidence={<WebGuideEvidence />}
        />
      </div>

      <section className="tl-guide-closing" aria-labelledby="guide-action">
        <span>Butuh bantuan?</span>
        <h2 id="guide-action">Masih ada yang belum jelas?</h2>
        <p>Hubungi TutorLog kalau ada pertanyaan saat memasang aplikasi atau membuat invoice pertama.</p>
        <div className="tl-guide-closing-actions">
          <MarketingButton
            href="/kontak"
            trailingIcon={<ArrowRight size={18} />}
          >
            Hubungi TutorLog
          </MarketingButton>
        </div>
      </section>
    </PublicShell>
  );
}
