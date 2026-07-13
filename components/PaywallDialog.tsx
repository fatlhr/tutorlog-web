"use client";

import { useCallback, useEffect } from "react";
import { ArrowRight, Check, LockKey } from "@phosphor-icons/react";

interface PaywallDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: "quota" | "invoice";
}

export default function PaywallDialog({ open, onClose, variant = "quota" }: PaywallDialogProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const isInvoice = variant === "invoice";
  const title = isInvoice ? "Unduh PDF dengan TutorLog Plus" : "Batas unduhan tercapai";
  const description = isInvoice
    ? "Unduh PDF tersedia untuk TutorLog Plus. Kamu tetap bisa menyusun dan memeriksa invoice, dan draft tersimpan otomatis."
    : "Batas unduhan gratis bulan ini sudah digunakan. Aktifkan Plus untuk mengunduh rekap dan invoice tanpa batas.";

  return (
    <div
      className="paywall-scrim"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="paywall-title"
    >
      <div className="paywall-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="lock" style={{ color: "var(--tw-primary)" }}>
          <LockKey size={30} aria-hidden="true" />
        </div>
        <h2 id="paywall-title">{title}</h2>
        <p>{description}</p>
        <ul className="feats">
          <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Unduh invoice PDF tanpa batas</li>
          <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Unduh rekap PDF dan CSV tanpa batas</li>
          <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Tiga tampilan invoice dan pilihan warna</li>
        </ul>
        <div className="actions">
          <a href="/harga" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
            <span>Lihat paket Plus</span>
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Nanti saja</button>
        </div>
      </div>
    </div>
  );
}
