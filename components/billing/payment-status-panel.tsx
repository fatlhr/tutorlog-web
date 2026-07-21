"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/app-ui/controls";
import {
  type BillingAnalyticsEventName,
  trackBillingEvent,
} from "@/lib/billing/analytics-client";
import {
  BillingClientError,
  cancelPendingPayment,
  getPurchaseStatus,
} from "@/lib/billing/client";
import type { PaymentStatusView, PurchaseSummary } from "@/lib/billing/contracts";
import { paymentStatusCopy } from "@/lib/billing/ui-model";
import styles from "./payment-status.module.css";

const POLL_DELAYS_MS = [2000, 3000, 5000, 10000, 15000, 30000] as const;
const VERIFY_WINDOW_MS = 10 * 60 * 1000;
const VISIBILITY_REFRESH_STALE_MS = POLL_DELAYS_MS[0];

type StatusClient = typeof getPurchaseStatus;
type CancelClient = typeof cancelPendingPayment;

export interface PaymentStatusPanelProps {
  initialPurchase: PurchaseSummary;
  statusClient?: StatusClient;
  cancelClient?: CancelClient;
}

function isPollingPayment(payment: PaymentStatusView): boolean {
  return payment.state === "created" || payment.state === "pending";
}

function paymentStateEvent(
  state: PaymentStatusView["state"],
): BillingAnalyticsEventName {
  if (state === "created" || state === "pending") return "payment_pending";
  if (state === "paid") return "payment_paid";
  if (state === "expired") return "payment_expired";
  return "payment_failed";
}

function formatDeadline(value: string | null): string | null {
  if (!value) return null;

  const deadline = new Date(value);
  if (Number.isNaN(deadline.getTime())) return null;

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(deadline);
}

function errorMessage(error: unknown): string {
  if (error instanceof BillingClientError) {
    switch (error.code) {
      case "AUTH_REQUIRED":
        return "Login diperlukan untuk memeriksa pembayaran.";
      case "PAYMENT_NOT_CANCELABLE":
        return "Pembayaran ini tidak dapat diganti lagi.";
      case "PAYMENT_NOT_FOUND":
      case "PURCHASE_NOT_FOUND":
        return "Pembayaran tidak ditemukan. Coba mulai dari checkout.";
      default:
        return "Status pembayaran belum dapat dimuat. Coba lagi.";
    }
  }

  return "Status pembayaran belum dapat dimuat. Coba lagi.";
}

export function PaymentStatusPanel({
  initialPurchase,
  statusClient = getPurchaseStatus,
  cancelClient = cancelPendingPayment,
}: PaymentStatusPanelProps) {
  const router = useRouter();
  const [purchase, setPurchase] = useState(initialPurchase);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [verificationWindowExpired, setVerificationWindowExpired] = useState(false);
  const pollTimerRef = useRef<number | null>(null);
  const pollIndexRef = useRef(0);
  const verificationStartedAtRef = useRef(0);
  const lastCheckedAtRef = useRef(0);
  const refreshRequestSequenceRef = useRef(0);

  const payment = purchase.payment;
  const isVerifying = payment?.state === "pending" && Boolean(payment.verificationDeadline);

  useEffect(() => {
    if (!payment) return;

    trackBillingEvent(paymentStateEvent(payment.state), {
      packageCode: purchase.packageCode,
      paymentState: payment.state,
      surface: "payment_status",
    });

    if (payment.state === "paid") {
      trackBillingEvent("entitlement_activated", {
        packageCode: purchase.packageCode,
        surface: "payment_status",
      });
    }
  }, [payment, purchase.packageCode]);

  useEffect(() => {
    verificationStartedAtRef.current = Date.now();
    lastCheckedAtRef.current = Date.now();
    pollIndexRef.current = 0;
    queueMicrotask(() => setVerificationWindowExpired(false));
  }, [payment?.id, isVerifying]);

  const refreshStatus = useCallback(async () => {
    const requestSequence = ++refreshRequestSequenceRef.current;
    const ownsLatestRequest = () => refreshRequestSequenceRef.current === requestSequence;
    setChecking(true);
    setLoadError(null);

    try {
      const nextPurchase = await statusClient(purchase.id);
      if (!ownsLatestRequest()) return;
      setPurchase(nextPurchase);
      lastCheckedAtRef.current = Date.now();
    } catch (error) {
      if (!ownsLatestRequest()) return;
      setLoadError(errorMessage(error));
    } finally {
      if (ownsLatestRequest()) setChecking(false);
    }
  }, [purchase.id, statusClient]);

  useEffect(() => {
    if (!payment || !isPollingPayment(payment) || verificationWindowExpired) return;

    let cancelled = false;

    const scheduleNextPoll = () => {
      const elapsed = Date.now() - verificationStartedAtRef.current;
      if (elapsed >= VERIFY_WINDOW_MS) {
        setVerificationWindowExpired(true);
        return;
      }

      const remaining = VERIFY_WINDOW_MS - elapsed;
      const delay = Math.min(POLL_DELAYS_MS[Math.min(pollIndexRef.current, POLL_DELAYS_MS.length - 1)], remaining);
      pollTimerRef.current = window.setTimeout(async () => {
        if (Date.now() - verificationStartedAtRef.current >= VERIFY_WINDOW_MS) {
          setVerificationWindowExpired(true);
          return;
        }

        pollIndexRef.current += 1;
        await refreshStatus();
        if (!cancelled) scheduleNextPoll();
      }, delay);
    };

    scheduleNextPoll();

    return () => {
      cancelled = true;
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
    };
  }, [payment, refreshStatus, verificationWindowExpired]);

  useEffect(() => {
    const refreshOnVisible = () => {
      if (
        document.visibilityState !== "visible"
        || !payment
        || !isPollingPayment(payment)
        || verificationWindowExpired
        || Date.now() - lastCheckedAtRef.current < VISIBILITY_REFRESH_STALE_MS
      ) {
        return;
      }

      const elapsed = Date.now() - verificationStartedAtRef.current;
      if (elapsed >= VERIFY_WINDOW_MS) {
        setVerificationWindowExpired(true);
        return;
      }

      void refreshStatus();
    };

    document.addEventListener("visibilitychange", refreshOnVisible);
    return () => document.removeEventListener("visibilitychange", refreshOnVisible);
  }, [payment, refreshStatus, verificationWindowExpired]);

  const status = useMemo(
    () => payment ? paymentStatusCopy(payment) : null,
    [payment],
  );
  const checkoutPath = `/checkout?package=${encodeURIComponent(purchase.packageCode)}`;

  async function handleReplaceMethod() {
    if (!payment || replacing) return;

    const confirmed = window.confirm(
      "Ganti metode pembayaran? Pembayaran yang selesai pada metode sebelumnya tetap akan ditinjau dan dihormati.",
    );
    if (!confirmed) return;

    setReplacing(true);
    setLoadError(null);

    try {
      await cancelClient(payment.id);
      router.push(`/checkout?package=${encodeURIComponent(purchase.packageCode)}`);
    } catch (error) {
      setLoadError(errorMessage(error));
      setReplacing(false);
    }
  }

  if (!payment || !status) {
    return (
      <section className={styles.panel} aria-labelledby="payment-status-title">
        <h1 id="payment-status-title">Status pembayaran</h1>
        <p className={styles.error} role="alert">
          Detail pembayaran belum tersedia. Kembali ke checkout untuk membuat pembayaran baru.
        </p>
        <Button href={checkoutPath}>Kembali ke checkout</Button>
      </section>
    );
  }

  const contactPath = `/kontak?reference=${encodeURIComponent(payment.safeReference)}`;
  const deadline = formatDeadline(
    isVerifying ? payment.verificationDeadline : payment.expiresAt,
  );
  const canRetry = ["superseded", "expired", "failed", "canceled", "refunded"]
    .includes(payment.state);

  return (
    <section className={styles.panel} aria-labelledby="payment-status-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Pembayaran</p>
        <h1 id="payment-status-title">{status.title}</h1>
        <p>{status.body}</p>
      </header>

      <div className={`${styles.status} ${styles[`tone${status.tone}`]}`} role="status" aria-live="polite">
        <strong>{isVerifying ? "Pembayaran sedang diperiksa" : status.title}</strong>
        {checking ? <span>Memeriksa status terbaru...</span> : null}
      </div>

      <dl className={styles.details}>
        <div>
          <dt>Referensi aman</dt>
          <dd>{payment.safeReference}</dd>
        </div>
        {deadline ? (
          <div>
            <dt>{isVerifying ? "Batas verifikasi" : "Batas pembayaran"}</dt>
            <dd>{deadline}</dd>
          </div>
        ) : null}
      </dl>

      {loadError ? <p className={styles.error} role="alert">{loadError}</p> : null}

      {verificationWindowExpired && isPollingPayment(payment) ? (
        <div className={styles.notice}>
          <p>Verifikasi membutuhkan waktu lebih dari sepuluh menit. Anda dapat memeriksa ulang atau menghubungi kami.</p>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => void refreshStatus()}>
              Periksa lagi
            </Button>
            <Button href={contactPath} variant="quiet">Hubungi dukungan</Button>
          </div>
        </div>
      ) : null}

      {payment.duplicateReview ? (
        <div className={styles.notice}>
          <p>Pembayaran ganda sedang ditinjau. Sertakan referensi aman saat menghubungi dukungan.</p>
          <Button href={contactPath} variant="quiet">Hubungi dukungan</Button>
        </div>
      ) : null}

      {payment.state === "pending" && !isVerifying ? (
        <div className={styles.pending}>
          <h2>Langkah pembayaran</h2>
          <ol>
            {payment.instructions.map((instruction) => <li key={instruction}>{instruction}</li>)}
          </ol>
          <p>Jika Anda mengganti metode, pembayaran yang selesai pada metode sebelumnya tetap akan ditinjau dan dihormati.</p>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => void refreshStatus()}>
              Perbarui status
            </Button>
            <Button
              type="button"
              variant="quiet"
              loading={replacing}
              loadingLabel="Mengganti metode..."
              onClick={() => void handleReplaceMethod()}
            >
              Ganti metode
            </Button>
          </div>
        </div>
      ) : null}

      {isVerifying ? (
        <div className={styles.notice}>
          <p>Pembayaran sedang diverifikasi. Simpan referensi aman di atas bila Anda perlu menghubungi dukungan.</p>
          <Button type="button" variant="secondary" onClick={() => void refreshStatus()}>
            Perbarui status
          </Button>
        </div>
      ) : null}

      {payment.state === "paid" ? (
        <div className={styles.actions}>
          <Button href="/app">Buka TutorLog</Button>
        </div>
      ) : null}

      {canRetry ? (
        <div className={styles.actions}>
          <Button href={checkoutPath}>Coba pembayaran baru</Button>
          <Button href={contactPath} variant="quiet">Hubungi dukungan</Button>
        </div>
      ) : null}
    </section>
  );
}
