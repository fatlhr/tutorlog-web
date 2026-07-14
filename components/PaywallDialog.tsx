"use client";

import { ArrowRight, Check, LockKey } from "@phosphor-icons/react";
import { Button } from "@/components/app-ui/controls";
import { Dialog } from "@/components/app-ui/overlays";

interface PaywallDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: "quota" | "invoice";
}

export default function PaywallDialog({ open, onClose, variant = "quota" }: PaywallDialogProps) {
  const isInvoice = variant === "invoice";
  const title = isInvoice ? "Unduh PDF dengan TutorLog Plus" : "Batas unduhan tercapai";
  const description = isInvoice
    ? "Unduh PDF tersedia untuk TutorLog Plus. Kamu tetap bisa menyusun dan memeriksa invoice, dan draft tersimpan otomatis."
    : "Batas unduhan gratis bulan ini sudah digunakan. Aktifkan Plus untuk mengunduh rekap dan invoice tanpa batas.";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
      title={title}
      description={description}
      size="small"
      footer={(
        <div className="paywall-actions">
          <Button
            href="/harga"
            variant="primary"
            size="large"
            trailingIcon={<ArrowRight size={16} aria-hidden="true" />}
          >
            Lihat paket Plus
          </Button>
          <Button type="button" variant="quiet" size="default" onClick={onClose}>
            Nanti saja
          </Button>
        </div>
      )}
    >
      <div className="paywall-content">
        <div className="lock" style={{ color: "var(--tw-primary)" }}>
          <LockKey size={30} aria-hidden="true" />
        </div>
        <ul className="feats">
          <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Unduh invoice PDF tanpa batas</li>
          <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Unduh rekap PDF dan CSV tanpa batas</li>
          <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Tiga tampilan invoice dan pilihan warna</li>
        </ul>
      </div>
    </Dialog>
  );
}
