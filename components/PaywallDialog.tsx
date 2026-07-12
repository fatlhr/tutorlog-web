"use client";

import { useCallback, useEffect } from "react";

interface PaywallDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function PaywallDialog({ open, onClose }: PaywallDialogProps) {
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
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>
        <h2 id="paywall-title">Batas unduhan tercapai</h2>
        <p>Batas unduhan gratis bulan ini sudah digunakan. Aktifkan Plus untuk mengunduh rekap dan invoice tanpa batas.</p>
        <ul className="feats">
          <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Unduh invoice PDF tanpa batas</li>
          <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Unduh rekap PDF dan CSV tanpa batas</li>
          <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Tiga tampilan invoice dan pilihan warna</li>
        </ul>
        <div className="actions">
          <a href="/harga" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
            <span>Lihat paket Plus</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14 M13 6l6 6-6 6" /></svg>
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Nanti saja</button>
        </div>
      </div>
    </div>
  );
}
