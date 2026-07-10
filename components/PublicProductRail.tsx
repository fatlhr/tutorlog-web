import Image from "next/image";
import { ArrowBendDownRight } from "@phosphor-icons/react/dist/ssr";
import TplModern from "@/components/invoice/TplModern";
import type { InvoiceData } from "@/components/invoice/TplKlasik";

const invoiceData: InvoiceData = {
  no: "INV-2026-06-014",
  date: "30 Juni 2026",
  due: "7 Juli 2026",
  period: "1-30 Juni 2026",
  from: {
    name: "Rina Novianti",
    lines: ["Tutor Matematika dan Fisika", "Jakarta Selatan", "rina@tutorlog.id - 0812 3456 7890"],
  },
  to: {
    name: "Bpk. Ahmad Wijaya",
    lines: ["Wali murid Bintang Wijaya", "Kelas 10 SMA Al-Azhar"],
  },
  bank: { bank: "BCA", no: "1234 5678 9012", name: "Rina Novianti" },
  items: [
    { date: "03 Jun", desc: "Matematika - Trigonometri", h: 1.5, rate: 120000 },
    { date: "10 Jun", desc: "Fisika - Gerak Lurus", h: 2, rate: 130000 },
    { date: "17 Jun", desc: "Matematika - Latihan Soal", h: 1.5, rate: 120000 },
  ],
  notes: "Terima kasih atas kepercayaannya. Pembayaran dapat ditransfer paling lambat 7 Juli 2026.",
};

const proofs = [
  {
    id: "mobile",
    label: "Mobile",
    src: "/images/tutorlog-clean-home.png",
    alt: "Tampilan TutorLog mobile untuk memulai sesi les",
    note: "Sesi dicatat langsung setelah mengajar.",
  },
  {
    id: "recap",
    label: "Rekap",
    src: "/images/tutorlog-clean-recap.png",
    alt: "Tampilan rekap sesi TutorLog dengan daftar murid",
    note: "Rekap sudah siap dicek saat kamu membuka web.",
  },
] as const;

export function PublicProductRail({ label = "Bukti produk TutorLog" }: { label?: string }) {
  return (
    <aside className="tls-product-rail" aria-label={label}>
      {proofs.map((proof) => (
        <figure className="tls-rail-proof tls-rail-proof-image" data-rail-proof={proof.id} key={proof.id}>
          <figcaption>{proof.label}</figcaption>
          <Image src={proof.src} alt={proof.alt} width={1080} height={2400} sizes="(max-width: 1199px) 248px, 326px" />
          <p className="tls-rail-annotation">
            <ArrowBendDownRight size={22} weight="regular" aria-hidden="true" />
            <span>{proof.note}</span>
          </p>
        </figure>
      ))}
      <figure className="tls-rail-proof tls-rail-proof-invoice" data-rail-proof="invoice">
        <figcaption>Invoice preview</figcaption>
        <div className="tls-invoice-proof" aria-label="Preview invoice TutorLog">
          <TplModern data={invoiceData} />
        </div>
        <p className="tls-rail-annotation">
          <ArrowBendDownRight size={22} weight="regular" aria-hidden="true" />
          <span>Invoice siap diperiksa sebelum dikirim.</span>
        </p>
      </figure>
    </aside>
  );
}
