"use client";

import { ArrowRight, Check, LockKey } from "@phosphor-icons/react";
import { Button } from "@/components/app-ui/controls";
import { Dialog } from "@/components/app-ui/overlays";
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
    ? expired ? "Plus sudah kedaluwarsa" : "Invoice tersedia di Plus"
    : expired ? "Plus sudah kedaluwarsa" : "Batas export rekap gratis tercapai";
  const description = isInvoice
    ? expired
      ? "Perpanjang Plus untuk membuka kembali export invoice."
      : "Aktifkan Plus untuk membuat dan mengunduh invoice. Rekap export gratis tetap mengikuti batas paketmu."
    : expired
      ? "Akses Plus kamu sudah berakhir, jadi export rekap kembali mengikuti batas gratis. Perpanjang Plus untuk export tanpa batas."
      : "Paket Free memiliki batas export rekap untuk tiap format. Plus aktif membuka export PDF dan CSV tanpa batas.";
  const primaryCta = expired ? "Perpanjang Plus" : "Lihat paket Plus";

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
            {quotaUsage.pdf ? <span>PDF: {quotaUsage.pdf.used}/{quotaUsage.pdf.limit} export terpakai</span> : null}
            {quotaUsage.csv ? <span>CSV: {quotaUsage.csv.used}/{quotaUsage.csv.limit} export terpakai</span> : null}
          </div>
        ) : null}
        <ul className="feats">
          {isInvoice ? (
            <>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Export invoice PDF</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Tiga tampilan invoice dan pilihan warna</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Draft invoice tetap bisa diperiksa sebelum upgrade</li>
            </>
          ) : (
            <>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Export rekap PDF dan CSV tanpa batas</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Invoice PDF terbuka selama Plus aktif</li>
              <li><span className="ck"><Check size={12} weight="bold" aria-hidden="true" /></span>Cocok untuk rekap bulanan dan arsip pembayaran</li>
            </>
          )}
        </ul>
      </div>
    </Dialog>
  );
}
