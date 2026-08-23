import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  LockKey,
  Trash,
} from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "TutorLog - Legal dan privasi",
  description:
    "Pusat dokumen legal TutorLog untuk kebijakan privasi, penghapusan akun, serta syarat dan ketentuan.",
};

const legalLinks = [
  {
    href: "/privacy",
    title: "Kebijakan privasi",
    description:
      "Pelajari data yang digunakan TutorLog, tujuan penggunaannya, serta cara data disimpan dan dilindungi.",
    icon: <LockKey size={24} weight="duotone" aria-hidden="true" />,
  },
  {
    href: "/account",
    title: "Penghapusan akun",
    description:
      "Ajukan penghapusan akun dan data TutorLog melalui web tanpa perlu membuka aplikasi.",
    icon: <Trash size={24} weight="duotone" aria-hidden="true" />,
  },
  {
    href: "/terms",
    title: "Syarat dan ketentuan",
    description:
      "Baca ketentuan penggunaan akun, layanan, paket Plus, dan pembayaran TutorLog.",
    icon: <FileText size={24} weight="duotone" aria-hidden="true" />,
  },
] as const;

export default function LegalPage() {
  return (
    <PublicShell
      compact
      eyebrow="Legal TutorLog"
      title="Dokumen dan kontrol data TutorLog"
      subtitle="Temukan kebijakan, ketentuan penggunaan, dan jalur penghapusan akun dalam satu tempat."
      icon={null}
    >
      <section className="tl-public-grid" aria-label="Dokumen legal TutorLog">
        {legalLinks.map((item) => (
          <Link className="tl-public-card tl-legal-card" href={item.href} key={item.href}>
            <span className="tl-public-card-icon">{item.icon}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span className="tl-legal-card-action">
              Buka halaman
              <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>
    </PublicShell>
  );
}
