import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell";
import { TermsContent } from "@/components/content/terms-content";

export const metadata: Metadata = {
  title: "TutorLog - Syarat dan Ketentuan",
  description: "Syarat dan ketentuan penggunaan TutorLog, aplikasi pencatat sesi les untuk tutor privat.",
};

export default function TermsPage() {
  return (
    <PublicShell
      compact
      eyebrow="Syarat"
      title="Syarat dan Ketentuan"
      subtitle="Terakhir diperbarui: 3 Juni 2026"
      icon={null}
    >
      <section className="tl-article-layout tl-public-motion" aria-label="Syarat dan ketentuan TutorLog">
        <TermsContent />
        <aside className="tl-margin-notes" aria-label="Ringkasan syarat">
          <p><strong>Akun</strong></p>
          <p>Gunakan email dan link masuk hanya untuk akun sendiri.</p>
          <p><strong>Plus</strong></p>
          <p>Fitur premium mengikuti paket yang dipilih saat pembayaran.</p>
        </aside>
      </section>
    </PublicShell>
  );
}
