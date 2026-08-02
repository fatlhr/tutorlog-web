"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/app-ui/controls";
import { ChoiceGroup } from "@/components/app-ui/navigation";
import { trackBillingEvent } from "@/lib/billing/analytics-client";
import {
  BillingClientError,
  createOrResumePurchase,
  getCheckoutQuote,
} from "@/lib/billing/client";
import { createDisplayQuote } from "@/lib/billing/fallback-catalog";
import type {
  CheckoutQuote,
  PaymentMethod,
  ProductSummary,
} from "@/lib/billing/contracts";
import { formatIdr } from "@/lib/billing/ui-model";
import styles from "./checkout.module.css";

const PAYMENT_OPTIONS = [
  {
    value: "qris",
    label: "QRIS",
    description: "Bayar dengan aplikasi bank atau dompet digital.",
  },
  {
    value: "va",
    label: "Virtual account",
    description: "Bayar melalui transfer bank.",
  },
];

type QuoteClient = typeof getCheckoutQuote;
type PurchaseClient = typeof createOrResumePurchase;

export interface CheckoutPanelProps {
  product: ProductSummary;
  initialQuote: CheckoutQuote;
  paymentReady: boolean;
  quoteClient?: QuoteClient;
  purchaseClient?: PurchaseClient;
}

function errorMessage(error: unknown): string {
  if (error instanceof BillingClientError) {
    switch (error.code) {
      case "PACKAGE_UNAVAILABLE":
      case "PACKAGE_NOT_FOUND":
        return "Paket ini sedang tidak tersedia. Pilih paket lain.";
      case "PRICE_CHANGED":
        return "Harga paket telah berubah. Muat ulang halaman untuk melihat harga terbaru.";
      case "LIFETIME_ALREADY_ACTIVE":
        return "Plus selamanya sudah aktif di akun ini.";
      case "PAYMENT_PROVIDER_NOT_READY":
      case "PROVIDER_UNAVAILABLE":
        return "Layanan pembayaran sedang tidak tersedia. Coba lagi beberapa saat.";
      case "PROVIDER_RESPONSE_INVALID":
        return "Respons pembayaran tidak dapat diproses. Coba lagi.";
      default:
        return "Pembayaran belum dapat dibuat. Coba lagi.";
    }
  }

  if (
    error instanceof Error
    && (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return "Permintaan pembayaran melewati batas waktu. Coba lagi.";
  }

  return "Respons pembayaran tidak dapat diproses. Coba lagi.";
}

function quoteMatches(
  quote: CheckoutQuote,
  product: ProductSummary,
  method: PaymentMethod,
): boolean {
  return quote.package.code === product.code
    && quote.method === method
    && quote.currency === "IDR"
    && Number.isFinite(quote.baseAmount)
    && Number.isFinite(quote.channelFee)
    && Number.isFinite(quote.totalAmount)
    && quote.baseAmount >= 0
    && quote.channelFee >= 0
    && quote.totalAmount === quote.baseAmount + quote.channelFee;
}

export function CheckoutPanel({
  product,
  initialQuote,
  paymentReady,
  quoteClient = getCheckoutQuote,
  purchaseClient = createOrResumePurchase,
}: CheckoutPanelProps) {
  const router = useRouter();
  const quoteRequestId = useRef(0);
  const initialQuoteValid = quoteMatches(initialQuote, product, "qris");
  const [method, setMethod] = useState<PaymentMethod>("qris");
  const [quote, setQuote] = useState<CheckoutQuote | null>(
    initialQuoteValid ? initialQuote : null,
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(
    !product.available
      ? "Paket ini sedang tidak tersedia. Pilih paket lain."
      : initialQuoteValid
        ? null
        : "Respons pembayaran tidak dapat diproses. Coba lagi.",
  );

  useEffect(() => {
    trackBillingEvent("checkout_started", {
      packageCode: product.code,
      surface: "checkout",
    });
  }, [product.code]);

  async function handleMethodChange(value: string) {
    if ((value !== "qris" && value !== "va") || value === method) return;

    const nextMethod: PaymentMethod = value;
    trackBillingEvent("payment_method_selected", {
      packageCode: product.code,
      paymentMethod: nextMethod,
      surface: "checkout",
    });
    setMethod(nextMethod);
    setError(null);

    const requestId = quoteRequestId.current += 1;
    if (!paymentReady) {
      setQuote(createDisplayQuote(product, nextMethod));
      setQuoteLoading(false);
      return;
    }

    setQuote(null);
    setQuoteLoading(true);

    try {
      const nextQuote = await quoteClient(product.code, nextMethod);
      if (requestId !== quoteRequestId.current) return;
      if (!quoteMatches(nextQuote, product, nextMethod)) {
        throw new BillingClientError("PROVIDER_RESPONSE_INVALID");
      }
      setQuote(nextQuote);
    } catch (quoteError) {
      if (requestId !== quoteRequestId.current) return;
      setError(errorMessage(quoteError));
    } finally {
      if (requestId === quoteRequestId.current) {
        setQuoteLoading(false);
      }
    }
  }

  const canCreatePayment = paymentReady
    && product.available
    && quote !== null
    && quote.method === method
    && termsAccepted
    && !quoteLoading
    && !creating;

  async function handleCreatePayment() {
    if (!canCreatePayment) return;

    setCreating(true);
    setError(null);

    try {
      const purchase = await purchaseClient(product.code, method);
      const payment = purchase.payment;
      if (!purchase.id || !payment) {
        throw new BillingClientError("PROVIDER_RESPONSE_INVALID");
      }

      if (payment.redirectUrl) {
        const url = new URL(payment.redirectUrl);
        if (url.protocol !== "https:") {
          throw new BillingClientError("PROVIDER_RESPONSE_INVALID");
        }
        window.location.assign(url.toString());
        return;
      }

      router.push(`/pembayaran/${encodeURIComponent(purchase.id)}`);
    } catch (purchaseError) {
      setError(errorMessage(purchaseError));
      setCreating(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="checkout-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Pembayaran</p>
        <h1 id="checkout-title">{product.name}</h1>
        <p>{product.description}</p>
      </header>

      <ChoiceGroup
        label="Metode pembayaran"
        options={PAYMENT_OPTIONS}
        value={method}
        onChange={handleMethodChange}
        disabled={!product.available || creating}
        layout="grid"
      />

      <div className={styles.summary} aria-live="polite" aria-busy={quoteLoading}>
        {quoteLoading ? (
          <p className={styles.loading}>Memuat total pembayaran...</p>
        ) : quote ? (
          <dl>
            <div>
              <dt>Harga paket</dt>
              <dd>{formatIdr(quote.baseAmount)}</dd>
            </div>
            <div>
              <dt>Biaya kanal</dt>
              <dd>{formatIdr(quote.channelFee)}</dd>
            </div>
            <div className={styles.total}>
              <dt>Total pembayaran</dt>
              <dd>{formatIdr(quote.totalAmount)}</dd>
            </div>
          </dl>
        ) : (
          <p className={styles.loading}>Total pembayaran belum tersedia.</p>
        )}
      </div>

      <p className={styles.renewal}>
        Pembelian ini tidak diperpanjang otomatis.
      </p>

      <label className={styles.terms}>
        <input
          type="checkbox"
          required
          checked={termsAccepted}
          disabled={!product.available || creating}
          onChange={(event) => setTermsAccepted(event.target.checked)}
        />
        <span>
          Saya menyetujui <Link href="/terms">Syarat dan ketentuan</Link> serta{" "}
          <Link href="/privacy">Kebijakan privasi</Link>.
        </span>
      </label>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        size="large"
        block
        disabled={!canCreatePayment}
        loading={creating}
        loadingLabel="Menyiapkan pembayaran..."
        onClick={handleCreatePayment}
      >
        {paymentReady ? "Lanjutkan pembayaran" : "Pembayaran segera tersedia"}
      </Button>
    </section>
  );
}
