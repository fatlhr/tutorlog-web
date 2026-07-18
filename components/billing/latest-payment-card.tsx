import { Surface } from "@/components/app-ui/structure";
import type {
  LatestPaymentSummary,
  PaymentMethod,
  PaymentState,
} from "@/lib/billing/contracts";
import { formatIdr } from "@/lib/billing/ui-model";
import styles from "./billing-surfaces.module.css";

interface LatestPaymentCardProps {
  payment: LatestPaymentSummary | null;
}

const methodLabels: Record<PaymentMethod, string> = {
  qris: "QRIS",
  va: "Virtual account",
};

const stateLabels: Record<PaymentState, string> = {
  created: "Dibuat",
  pending: "Menunggu pembayaran",
  superseded: "Digantikan",
  paid: "Berhasil",
  expired: "Kedaluwarsa",
  failed: "Gagal",
  canceled: "Dibatalkan",
  refunded: "Dikembalikan",
};

function formatPaymentDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function LatestPaymentCard({ payment }: LatestPaymentCardProps) {
  return (
    <Surface padding="compact">
      <section className={styles.card} aria-labelledby="latest-payment-title">
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Pembayaran</p>
            <h2 id="latest-payment-title" className={styles.cardTitle}>
              Pembayaran terbaru
            </h2>
          </div>
        </div>

        {payment ? (
          <dl className={styles.paymentDetails}>
            <div>
              <dt>Paket</dt>
              <dd>{payment.packageName}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{stateLabels[payment.state]}</dd>
            </div>
            <div>
              <dt>Metode</dt>
              <dd>{methodLabels[payment.method]}</dd>
            </div>
            <div>
              <dt>Harga paket</dt>
              <dd>{formatIdr(payment.baseAmount)}</dd>
            </div>
            <div>
              <dt>Biaya kanal</dt>
              <dd>{formatIdr(payment.channelFee)}</dd>
            </div>
            <div>
              <dt>Total pembayaran</dt>
              <dd>{formatIdr(payment.totalAmount)}</dd>
            </div>
            <div>
              <dt>Referensi</dt>
              <dd className={styles.reference}>{payment.safeReference}</dd>
            </div>
            <div>
              <dt>Dibuat</dt>
              <dd>{formatPaymentDate(payment.createdAt)}</dd>
            </div>
            {payment.paidAt ? (
              <div>
                <dt>Dibayar</dt>
                <dd>{formatPaymentDate(payment.paidAt)}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className={styles.description}>Belum ada pembayaran.</p>
        )}
      </section>
    </Surface>
  );
}
