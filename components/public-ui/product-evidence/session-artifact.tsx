import { formatIDR } from "@/components/invoice/invoice-data";
import { publicSessionEvidence } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function SessionArtifact({ className = "" }: { className?: string }) {
  const session = publicSessionEvidence;

  return (
    <figure className={`${styles.artifact} ${styles.session} ${className}`} data-product-artifact="session">
      <figcaption>Catatan sesi</figcaption>
      <span className={styles.status}>{session.status}</span>
      <time>{session.date}</time>
      <strong>{session.description}</strong>
      <div className={styles.sessionMeta}>
        <span>{session.hours} jam</span>
        <span>{formatIDR(session.amount)}</span>
      </div>
    </figure>
  );
}
