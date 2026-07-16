import { formatIDR } from "@/components/invoice/invoice-data";
import { CaretRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { publicSessionEvidence } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function SessionArtifact({ className = "" }: { className?: string }) {
  const session = publicSessionEvidence;

  return (
    <figure className={`${styles.artifact} ${styles.session} ${className}`} data-product-artifact="session">
      <figcaption className={styles.visuallyHidden}>Sesi tersimpan dari aplikasi di HP</figcaption>
      <div className={styles.sessionSummary}>
        <strong>{session.studentName}</strong>
        <strong>{formatIDR(session.amount)}</strong>
      </div>
      <p className={styles.sessionMeta}>
        <time>{session.date}</time>
        <span aria-hidden="true">•</span>
        <span>{session.timeRange}</span>
        <span aria-hidden="true">•</span>
        <span>{session.duration}</span>
      </p>
      <div className={styles.sessionStatus}>
        <span className={styles.status}>
          <CheckCircle size={16} weight="fill" aria-hidden="true" />
          {session.status}
        </span>
        <CaretRight size={18} weight="bold" aria-hidden="true" />
      </div>
    </figure>
  );
}
