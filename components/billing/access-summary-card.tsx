import { Button } from "@/components/app-ui/controls";
import { Surface } from "@/components/app-ui/structure";
import type { AccessSummary } from "@/lib/billing/contracts";
import styles from "./billing-surfaces.module.css";

interface AccessSummaryCardProps {
  access: AccessSummary;
}

function formatAccessDate(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function AccessSummaryCard({ access }: AccessSummaryCardProps) {
  const isExpired = access.state === "plus_expired";
  const canRenew = access.entitlementType === "term";
  const title = access.isLifetime
    ? "Plus Selamanya"
    : isExpired
      ? "Plus Berakhir"
      : access.state === "plus_active"
        ? "Plus Aktif"
        : "Paket Free";
  const expiryLabel = isExpired ? "Berakhir pada" : "Aktif sampai";

  return (
    <Surface padding="compact" variant={isExpired ? "paper" : "soft"}>
      <section className={styles.card} aria-labelledby="access-summary-title">
        <div className={styles.cardHeader}>
          <div>
            <p className={styles.eyebrow}>Status akses</p>
            <h2
              id="access-summary-title"
              className={`${styles.cardTitle} ${isExpired ? styles.expiredTitle : ""}`}
            >
              {title}
            </h2>
          </div>
          {access.state === "free" ? (
            <Button href="/harga" variant="primary" size="compact">
              Lihat Plus
            </Button>
          ) : null}
        </div>

        {access.isLifetime ? (
          <p className={styles.description}>
            Akses Plus aktif selamanya tanpa masa perpanjangan.
          </p>
        ) : access.activeUntil ? (
          <p className={styles.description}>
            {expiryLabel} {formatAccessDate(access.activeUntil)}
          </p>
        ) : access.state === "free" ? (
          <p className={styles.description}>
            Upgrade untuk membuka invoice dan export rekap tanpa batas.
          </p>
        ) : null}

        {isExpired ? (
          <p className={styles.description}>
            Export rekap kembali mengikuti batas gratis dan invoice terkunci
            sampai Plus diperpanjang.
          </p>
        ) : null}

        {canRenew ? (
          <div className={styles.cardAction}>
            <Button href="/harga" variant="primary" size="compact">
              Perpanjang Plus
            </Button>
          </div>
        ) : null}
      </section>
    </Surface>
  );
}
