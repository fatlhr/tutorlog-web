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
        <h2 id="paywall-title">Fitur Premium</h2>
        <p>Export invoice PDF adalah fitur TutorLog Plus. Upgrade untuk mengirim tagihan profesional tanpa batas ke murid kamu.</p>
        <div className="pricing" style={{ display: "flex", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, background: "var(--tw-surface-2)", borderRadius: "var(--r-md)", padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18, color: "var(--tw-text)" }}>Rp 149.000</div>
            <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "var(--tw-text-3)", marginTop: 2 }}>Sekali bayar</div>
          </div>
          <div style={{ flex: 1, background: "var(--tw-surface-2)", borderRadius: "var(--r-md)", padding: "12px 14px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 18, color: "var(--tw-text)" }}>Rp 19.000</div>
            <div style={{ fontFamily: "var(--f-body)", fontSize: 11, color: "var(--tw-text-3)", marginTop: 2 }}>Per bulan</div>
          </div>
        </div>
        <ul className="feats">
          <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export invoice PDF tanpa batas</li>
          <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>Export rekap PDF & CSV tanpa batas</li>
          <li><span className="ck"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg></span>3 template invoice + kustomisasi warna</li>
        </ul>
        <div className="actions">
          <a href="/app/langganan" className="btn btn-primary btn-lg" style={{ gap: 8 }}>
            <span>Lihat Langganan</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14 M13 6l6 6-6 6" /></svg>
          </a>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Nanti saja</button>
        </div>
      </div>
    </div>
  );
}