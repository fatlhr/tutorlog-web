import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle,
  Receipt,
} from "@phosphor-icons/react/dist/ssr";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "TutorLog - Harga",
  description: "Mulai gratis, lalu pilih akses penuh saat export dan invoice menjadi bagian dari pekerjaan rutin.",
};

const lynkUrl = "https://lynk.id/tutorlog";

const plans = [
  {
    name: "Free",
    price: "Rp0",
    period: "selamanya",
    description: "Untuk mencoba alur catat sesi dan melihat rekap dasar.",
    features: ["Rekap bulanan", "Filter per murid", "1 export PDF dan CSV per bulan", "Preview invoice"],
    action: { href: "/login", label: "Mulai Gratis", external: false },
  },
  {
    name: "Plus Beli Putus",
    price: "Rp79rb",
    previousPrice: "Rp149rb",
    period: "sekali bayar",
    description: "Untuk tutor yang ingin export dan invoice tanpa memikirkan masa aktif.",
    features: ["Export invoice tanpa batas", "Export rekap tanpa batas", "Template dan warna invoice", "Akses penuh selamanya"],
    action: { href: lynkUrl, label: "Pilih Beli Putus", external: true },
    featured: true,
  },
  {
    name: "Plus Bulanan",
    price: "Rp9rb",
    previousPrice: "Rp19rb",
    period: "per bulan",
    description: "Untuk kebutuhan yang berubah dari bulan ke bulan.",
    features: ["Semua fitur Plus", "Bayar per bulan", "Berhenti kapan saja"],
    action: { href: lynkUrl, label: "Pilih Bulanan", external: true },
  },
];

const faqs = [
  {
    question: "Apakah data tetap aman kalau tidak upgrade?",
    answer: "Ya. Data sesi tetap tersimpan. Di paket Free, batasnya ada pada export dan invoice.",
  },
  {
    question: "Apa beda beli putus dan bulanan?",
    answer: "Fitur Plus-nya sama. Beli putus dibayar sekali untuk akses penuh selamanya, sedangkan bulanan bisa dihentikan kapan saja.",
  },
  {
    question: "Bagaimana cara pembayaran?",
    answer: "Pembayaran dilakukan melalui Lynk.id. Detail metode pembayaran tersedia saat membuka tautan pembelian.",
  },
  {
    question: "Apakah pembayaran bisa dikembalikan?",
    answer: "Pembayaran yang sudah dilakukan tidak dapat dikembalikan. Pastikan pilihan paket sudah sesuai sebelum menyelesaikan pembayaran.",
  },
];

function PriceVisual() {
  return (
    <aside className="tl-price-visual tl-public-product" aria-label="Ilustrasi akses TutorLog">
      <Receipt size={46} weight="duotone" aria-hidden="true" />
      <strong>Mulai dari catatan pertama.</strong>
      <p>Upgrade saat export dan invoice sudah benar-benar kamu butuhkan.</p>
    </aside>
  );
}

export default function HargaPage() {
  return (
    <PublicShell
      eyebrow="Harga TutorLog"
      title="Pilih akses dari cara kamu pakai rekap."
      subtitle="Mulai gratis untuk mencoba. Upgrade saat export dan invoice sudah jadi bagian dari pekerjaan rutin."
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
            {plan.action.external ? (
              <a className="tl-public-button tl-price-action" href={plan.action.href} target="_blank" rel="noopener">
                {plan.action.label}<ArrowUpRight size={17} aria-hidden="true" />
              </a>
            ) : (
              <Link className="tl-public-button tl-price-action" href={plan.action.href}>
                {plan.action.label}
              </Link>
            )}
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
