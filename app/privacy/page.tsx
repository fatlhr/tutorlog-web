import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell";
import { PrivacyContent } from "@/components/content/privacy-content";

export const metadata: Metadata = {
  title: "TutorLog - Kebijakan Privasi",
  description: "Kebijakan privasi TutorLog, data yang dipakai, penyimpanan, dan hak pengguna.",
};

export default function PrivacyPage() {
  return (
    <PublicShell
      compact
      eyebrow="Privasi"
      title="Kebijakan Privasi"
      subtitle="Terakhir diperbarui: 3 Juni 2026"
      icon={null}
    >
      <section className="tl-article-layout tl-public-motion" aria-label="Kebijakan privasi TutorLog">
        <PrivacyContent />
        <aside className="tl-margin-notes" aria-label="Ringkasan privasi">
          <p><strong>Lokasi</strong></p>
          <p>Hanya dipakai saat app digunakan untuk kebutuhan sesi.</p>
          <p><strong>Export</strong></p>
          <p>File dibuat hanya saat kamu memilih export atau share.</p>
        </aside>
      </section>
    </PublicShell>
  );
}
