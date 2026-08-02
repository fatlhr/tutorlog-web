import type { Metadata } from "next";
import { Receipt } from "@phosphor-icons/react/dist/ssr";
import { PricingCatalog } from "@/components/billing/pricing-catalog";
import { PublicShell } from "@/components/PublicShell";
import type { ProductSummary } from "@/lib/billing/contracts";
import { FALLBACK_BILLING_CATALOG } from "@/lib/billing/fallback-catalog";
import { getCatalog } from "@/lib/billing/server/catalog";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "TutorLog - Harga",
  description: "Mulai dengan Paket Free, lalu pilih Plus saat kamu perlu mengekspor rekap tanpa batas dan mengunduh PDF invoice.",
};

const faqs = [
  {
    question: "Apakah data tetap aman jika saya memakai Paket Free?",
    answer: "Ya. Paket Free tetap bisa dipakai untuk mencatat sesi dan membuat rekap. Ekspor mengikuti batas paket, sedangkan invoice hanya bisa diunduh saat Plus aktif.",
  },
  {
    question: "Apa beda beli putus dan bulanan?",
    answer: "Fitur Plus-nya sama. Paket sekali bayar tetap aktif selamanya, sedangkan paket berjangka berakhir sesuai durasi yang dipilih.",
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
      <p>Pilih Plus saat kamu perlu mengekspor rekap tanpa batas atau mengunduh PDF invoice.</p>
    </aside>
  );
}

export default async function HargaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const authenticated = Boolean(user);

  let products: ProductSummary[] = [...FALLBACK_BILLING_CATALOG];
  try {
    products = await getCatalog();
  } catch {}

  return (
    <PublicShell
      eyebrow="Harga TutorLog"
      title="Mulai gratis, pilih Plus saat sudah dibutuhkan."
      subtitle="Mulai dengan Paket Free. Aktifkan Plus saat kamu perlu mengekspor rekap tanpa batas dan mengunduh PDF invoice."
      icon={null}
      aside={<PriceVisual />}
      showBackLink
    >
      <PricingCatalog products={products} authenticated={authenticated} />

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
