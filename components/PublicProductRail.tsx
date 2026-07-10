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

export type ProductProofId = "mobile" | "recap" | "invoice";

const proofs = {
  mobile: {
    label: "Mobile",
    src: "/images/tutorlog-clean-home.png",
    alt: "Tampilan TutorLog mobile untuk memulai sesi les",
    note: "Sesi dicatat langsung setelah mengajar.",
  },
  recap: {
    label: "Rekap",
    src: "/images/tutorlog-web-recap.png",
    alt: "Tampilan web TutorLog untuk rekap sesi dengan daftar murid dan pendapatan",
    width: 1024,
    height: 900,
    note: "Rekap sudah siap dicek saat kamu membuka web.",
  },
  invoice: {
    label: "Invoice preview",
    note: "Invoice siap diperiksa sebelum dikirim.",
  },
} as const;

export function PublicProductProof({ id, annotation = false }: { id: ProductProofId; annotation?: boolean }) {
  if (id === "invoice") {
    const proof = proofs.invoice;
    return (
      <figure className="tls-rail-proof tls-rail-proof-invoice" data-rail-proof={id}>
        <figcaption>{proof.label}</figcaption>
        <div className="tls-rail-surface">
          <div className="tls-invoice-proof" aria-label="Preview invoice TutorLog">
            <TplModern data={invoiceData} />
          </div>
        </div>
        {annotation ? <Annotation note={proof.note} /> : null}
      </figure>
    );
  }

  const proof = id === "mobile"
    ? { ...proofs.mobile, width: 1080, height: 2400 }
    : proofs.recap;

  return (
    <figure className="tls-rail-proof tls-rail-proof-image" data-rail-proof={id}>
      <figcaption>{proof.label}</figcaption>
      <div className="tls-rail-surface">
        <Image src={proof.src} alt={proof.alt} width={proof.width} height={proof.height} sizes="(max-width: 1199px) 248px, 326px" />
      </div>
      {annotation ? <Annotation note={proof.note} /> : null}
    </figure>
  );
}

function Annotation({ note }: { note: string }) {
  return (
    <p className="tls-rail-annotation">
      <ArrowBendDownRight size={22} weight="regular" aria-hidden="true" />
      <span>{note}</span>
    </p>
  );
}

export function PublicProductRail({ label = "Bukti produk TutorLog" }: { label?: string }) {
  return (
    <aside className="tls-product-rail" aria-label={label}>
      <PublicProductProof id="mobile" annotation />
      <PublicProductProof id="recap" annotation />
      <PublicProductProof id="invoice" annotation />
    </aside>
  );
}
