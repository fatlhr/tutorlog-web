import { publicRecapEvidence } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function RecapArtifact({ className = "" }: { className?: string }) {
  const recap = publicRecapEvidence;

  return (
    <figure className={`${styles.artifact} ${styles.recap} ${className}`} data-product-artifact="recap">
      <figcaption>Rekap {recap.period}</figcaption>
      <strong>{recap.sessionCount} sesi</strong>
      <span>{recap.hours} jam mengajar</span>
    </figure>
  );
}
