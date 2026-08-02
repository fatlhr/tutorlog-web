"use client";

import { ArrowRight, Check, LockKey } from "@phosphor-icons/react";
import { useEffect } from "react";
import { Button } from "@/components/app-ui/controls";
import { Dialog } from "@/components/app-ui/overlays";
import { trackBillingEvent } from "@/lib/billing/analytics-client";
import type { ExportFormat, PaywallReason } from "@/lib/data/quota-access";

interface PaywallDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: "quota" | "invoice";
  reason?: PaywallReason;
  quotaUsage?: Partial<Record<ExportFormat, { used: number; limit: number }>>;
}

export default function PaywallDialog({
  open,
  onClose,
  variant = "quota",
  reason,
  quotaUsage,
}: PaywallDialogProps) {
  const isInvoice = variant === "invoice";
  const expired = reason === "expired";
  const title = isInvoice
    ? expired ? "Plus sudah berakhir" : "Unduh PDF invoice dengan Plus"
    : expired ? "Plus sudah berakhir" : "Batas ekspor rekap Paket Free tercapai";
  const description = isInvoice
    ? expired
      ? "Kamu tetap bisa menyusun dan memeriksa draft invoice. Perpanjang Plus untuk mengunduh PDF."
      : "Kamu tetap bisa menyusun dan memeriksa draft invoice dengan Paket Free. Aktifkan Plus untuk mengunduh PDF."
    : expired
      ? "Masa aktif Plus sudah berakhir. Ekspor rekap kembali mengikuti batas Paket Free. Perpanjang Plus untuk mengekspor tanpa batas."
      : "Paket Free memiliki batas ekspor rekap untuk setiap format. Aktifkan Plus untuk mengekspor PDF dan CSV tanpa batas.";
  const primaryCta = expired ? "Perpanjang Plus" : "Aktifkan Plus";

  useEffect(() => {
    if (!open) return;
    trackBillingEvent("paywall_opened", {
      paywallReason: reason ?? (isInvoice ? "invoice-locked" : "free-limit"),
      surface: isInvoice ? "invoice" : "recap",
    });
  }, [isInvoice, open, reason]);

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
            {primaryCta}
          </Button>
          <Button type="button" variant="quiet" size="default" onClick={onClose}>
            Nanti saja
          </Button>
        </div>
      )}
    >
      <div className="paywall-content" data-analytics-id="billing-paywall">
        <div className="lock" style={{ color: "var(--tw-primary)" }}>
          <LockKey size={30} aria-hidden="true" />
        </div>
        {!isInvoice && quotaUsage ? (
          <div
            className="quota-hint"
            style={{
              display: "grid",
              gap: 4,
              border: "1px solid var(--app-line, #d0ddd6)",
              borderRadius: 14,
              padding: "10px 12px",
              color: "var(--app-ink-muted, #5f6b68)",
              fontSize: 13,
              lineHeight: "18px",
            }}
          >
            {quotaUsage.pdf ? <span>PDF: {quotaUsage.pdf.used}/{quotaUsage.pdf.limit} ekspor terpakai</span> : null}
            {quotaUsage.csv ? <span>CSV: {quotaUsage.csv.used}/{quotaUsage.csv.limit} ekspor terpakai</span> : null}
          </div>
        ) : null}
        <ul className="feats">
          {isInvoice ? (
            <>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Unduh PDF invoice</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Ekspor rekap PDF dan CSV tanpa batas selama Plus aktif</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Draft invoice tetap dapat diperiksa dengan Paket Free</li>
            </>
          ) : (
            <>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Ekspor rekap PDF dan CSV tanpa batas</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Unduh PDF invoice selama Plus aktif</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Cocok untuk rekap bulanan dan arsip pembayaran</li>
            </>
          )}
        </ul>
      </div>
    </Dialog>
  );
}
