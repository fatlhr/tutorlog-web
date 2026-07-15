import Image from "next/image";
import { ArrowBendDownRight } from "@phosphor-icons/react/dist/ssr";
import TplModern from "@/components/invoice/TplModern";
import PublicProofDialog from "@/components/PublicProofDialog";
import { publicProductInvoiceData } from "@/components/public-ui/product-evidence/product-evidence-data";

export type ProductProofId = "mobile" | "history" | "recap" | "invoice";

const imageProofs = {
  mobile: {
    label: "Mobile",
    src: "/images/tutorlog-clean-home.png",
    alt: "Tampilan TutorLog mobile untuk memulai sesi les",
    note: "Sesi dicatat langsung setelah mengajar.",
  },
  history: {
    label: "Riwayat sesi",
    src: "/images/tutorlog-clean-history.png",
    alt: "Tampilan TutorLog mobile untuk melihat riwayat sesi les",
    note: "Catatan sesi dapat dibuka dan direvisi dari HP.",
  },
} as const;

const recapProof = {
  label: "Rekap dan export",
  mobile: {
    src: "/images/tutorlog-clean-recap.png",
    alt: "Tampilan rekap TutorLog di mobile dengan pilihan sesi dan tombol bagikan",
    width: 1080,
    height: 2400,
  },
  web: {
    src: "/images/tutorlog-web-recap.png",
    alt: "Tampilan rekap TutorLog di web dengan daftar murid dan pendapatan",
    width: 1024,
    height: 900,
  },
  note: "Rekap dan export tersedia dari mobile maupun web.",
} as const;

const invoiceProof = {
  label: "Invoice preview",
  note: "Invoice dibuat dan diperiksa dari web.",
} as const;

export function PublicProductProof({
  id,
  annotation = false,
  interactive = true,
}: {
  id: ProductProofId;
  annotation?: boolean;
  interactive?: boolean;
}) {
  if (id === "invoice") {
    const proof = invoiceProof;
    return (
      <figure className="tls-rail-proof tls-rail-proof-invoice" data-rail-proof={id}>
        <figcaption>{proof.label}</figcaption>
        {interactive ? (
          <PublicProofDialog
            label={proof.label}
            proofId={id}
            triggerContent={<InvoiceSurface />}
            dialogContent={<InvoiceSurface />}
          />
        ) : <InvoiceSurface />}
        {annotation ? <Annotation note={proof.note} /> : null}
      </figure>
    );
  }

  if (id === "recap") {
    return (
      <figure className="tls-rail-proof tls-rail-proof-recap" data-rail-proof={id}>
        <figcaption>{recapProof.label}</figcaption>
        <div className="tls-recap-proof-pair">
          {interactive ? (
            <>
              <PublicProofDialog
                label="Rekap web"
                proofId="recap-web"
                triggerContent={<Image className="tls-recap-proof-web" src={recapProof.web.src} alt={recapProof.web.alt} width={recapProof.web.width} height={recapProof.web.height} sizes="(max-width: 767px) 214px, (max-width: 1199px) 166px, 216px" />}
                dialogContent={<div className="tls-rail-surface"><Image className="tls-proof-image" src={recapProof.web.src} alt={recapProof.web.alt} width={recapProof.web.width} height={recapProof.web.height} sizes="(max-width: 1199px) 480px, 620px" /></div>}
              />
              <PublicProofDialog
                label="Rekap mobile"
                proofId="recap-mobile"
                triggerContent={<Image className="tls-recap-proof-mobile" src={recapProof.mobile.src} alt={recapProof.mobile.alt} width={recapProof.mobile.width} height={recapProof.mobile.height} sizes="(max-width: 767px) 94px, (max-width: 1199px) 70px, 98px" />}
                dialogContent={<div className="tls-rail-surface"><Image className="tls-proof-image" src={recapProof.mobile.src} alt={recapProof.mobile.alt} width={recapProof.mobile.width} height={recapProof.mobile.height} sizes="(max-width: 1199px) 240px, 320px" /></div>}
              />
            </>
          ) : (
            <>
              <Image className="tls-recap-proof-web" src={recapProof.web.src} alt={recapProof.web.alt} width={recapProof.web.width} height={recapProof.web.height} />
              <Image className="tls-recap-proof-mobile" src={recapProof.mobile.src} alt={recapProof.mobile.alt} width={recapProof.mobile.width} height={recapProof.mobile.height} />
            </>
          )}
        </div>
        {annotation ? <Annotation note={recapProof.note} /> : null}
      </figure>
    );
  }

  const proof = imageProofs[id];

  return (
    <figure className="tls-rail-proof tls-rail-proof-image" data-rail-proof={id}>
      <figcaption>{proof.label}</figcaption>
      {interactive ? (
        <PublicProofDialog
          label={proof.label}
          proofId={id}
          triggerContent={<ImageSurface id={id} />}
          dialogContent={<ImageSurface id={id} />}
        />
      ) : <ImageSurface id={id} />}
      {annotation ? <Annotation note={proof.note} /> : null}
    </figure>
  );
}

function ImageSurface({ id }: { id: "mobile" | "history" }) {
  const proof = imageProofs[id];
  return (
    <div className="tls-rail-surface">
      <Image className="tls-proof-image" src={proof.src} alt={proof.alt} width={1080} height={id === "mobile" ? 2400 : 2337} sizes="(max-width: 1199px) 248px, 326px" />
    </div>
  );
}



function InvoiceSurface() {
  return (
    <div className="tls-rail-surface">
      <div className="tls-invoice-proof" aria-label="Preview invoice TutorLog">
        <TplModern data={publicProductInvoiceData} />
      </div>
    </div>
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
