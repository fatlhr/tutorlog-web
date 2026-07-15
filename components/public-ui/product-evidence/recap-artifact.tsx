import { formatIDR } from "@/components/invoice/invoice-data";
import { publicRecapEvidence } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function RecapArtifact({ className = "" }: { className?: string }) {
  const recap = publicRecapEvidence;

  return (
    <figure className={`${styles.artifact} ${styles.recap} ${className}`} data-product-artifact="recap">
      <figcaption>Rekap bulanan</figcaption>
      <strong>{recap.period}</strong>
      <dl>
        <div>
          <dt>Sesi selesai</dt>
          <dd>{recap.sessionCount}</dd>
        </div>
        <div>
          <dt>Waktu mengajar</dt>
          <dd>{recap.hours} jam</dd>
        </div>
        <div>
          <dt>Estimasi pendapatan</dt>
          <dd>{formatIDR(recap.amount)}</dd>
        </div>
      </dl>
    </figure>
  );
}
