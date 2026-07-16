import type { Metadata } from "next";
import {
  ArrowUpRight,
  CheckCircle,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";
import { MarketingButton } from "@/components/public-ui/marketing-button";

export const metadata: Metadata = {
  title: "TutorLog - Harga",
  description: "Mulai gratis, lalu pilih Plus saat kamu sudah perlu mengekspor rekap dan mengunduh invoice.",
};

const lynkUrl = "https://lynk.id/tutorlog";

const plans = [
  {
    name: "Free",
    price: "Rp0",
    period: "selamanya",
    description: "Untuk mencoba alur catat sesi dan melihat rekap dasar.",
    features: ["Rekap bulanan", "Filter per murid", "Ekspor PDF dan CSV terbatas", "Pratinjau invoice"],
    action: { href: "/login", label: "Mulai gratis", external: false },
  },
  {
    name: "Plus Beli Putus",
    price: "Rp79rb",
    previousPrice: "Rp149rb",
    period: "sekali bayar",
    description: "Untuk tutor yang ingin sekali bayar dan memakai Plus tanpa batas waktu.",
    features: ["Unduh invoice PDF", "Ekspor rekap tanpa batas", "Template dan warna invoice", "Akses penuh selamanya"],
    action: { href: lynkUrl, label: "Pilih beli putus", external: true },
    featured: true,
  },
  {
    name: "Plus Bulanan",
    price: "Rp9rb",
    previousPrice: "Rp19rb",
    period: "per bulan",
    description: "Untuk kebutuhan yang berubah dari bulan ke bulan.",
    features: ["Semua fitur Plus", "Bayar per bulan", "Berhenti kapan saja"],
    action: { href: lynkUrl, label: "Pilih bulanan", external: true },
  },
];

const faqs = [
  {
    question: "Apakah data tetap aman kalau tidak upgrade?",
    answer: "Ya. Paket Free tetap bisa dipakai untuk mencatat sesi dan membuat rekap. Ekspor mengikuti batas paket, sedangkan invoice hanya bisa diunduh saat Plus aktif.",
  },
  {
    question: "Apa beda beli putus dan bulanan?",
    answer: "Fitur Plus-nya sama. Beli putus dibayar sekali untuk akses penuh selamanya, sedangkan bulanan bisa dihentikan kapan saja.",
  },
  {
    question: "Bagaimana cara pembayaran?",
    answer: "Informasi metode pembayaran akan ditampilkan sebelum kamu menyelesaikan pembelian.",
  },
  {
    question: "Apakah pembayaran bisa dikembalikan?",
    answer: "Pembayaran yang sudah dilakukan tidak dapat dikembalikan. Pastikan pilihan paket sudah sesuai sebelum menyelesaikan pembayaran.",
  },
];

function PriceVisual() {
  return (
    <aside className="tl-price-visual tl-public-product" aria-label="Ilustrasi akses TutorLog" data-symbolic-evidence="pricing">
      <Receipt size={46} weight="duotone" aria-hidden="true" />
      <strong>Mulai dari catatan pertama.</strong>
      <p>Pilih Plus saat kamu sudah rutin mengekspor rekap atau membuat invoice.</p>
    </aside>
  );
}

export default function HargaPage() {
  return (
    <PublicShell
      eyebrow="Harga TutorLog"
      title="Mulai gratis, pilih Plus saat sudah dibutuhkan."
      subtitle="Coba alurnya lewat paket Free. Plus membuka ekspor tanpa batas dan unduh invoice."
      icon={null}
      aside={<PriceVisual />}
      showBackLink
    >
      <section className="tl-price-ledger" aria-label="Pilihan paket TutorLog">
        {plans.map((plan) => (
          <article className={`tl-price-row tl-public-motion ${plan.featured ? "tl-price-row-featured" : ""}`} key={plan.name}>
            <div className="tl-price-name">
              <h2>{plan.name}</h2>
              <p>{plan.description}</p>
            </div>
            <div className="tl-price-amount">
              {plan.previousPrice ? <s>{plan.previousPrice}</s> : null}
              <strong>{plan.price}</strong>
              <span>{plan.period}</span>
            </div>
            <ul className="tl-price-features">
              {plan.features.map((feature) => (
                <li key={feature}><CheckCircle size={18} weight="fill" aria-hidden="true" />{feature}</li>
              ))}
            </ul>
            <MarketingButton
              href={plan.action.href}
              size="compact"
              target={plan.action.external ? "_blank" : undefined}
              rel={plan.action.external ? "noopener" : undefined}
              trailingIcon={plan.action.external ? <ArrowUpRight size={17} /> : undefined}
            >
              {plan.action.label}
            </MarketingButton>
          </article>
        ))}
      </section>

      <section className="tl-price-faq tl-public-motion" aria-labelledby="price-faq-title">
        <h2 id="price-faq-title">Pertanyaan umum</h2>
        <div>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
