import TplModern from "@/components/invoice/TplModern";
import { publicProductInvoiceData } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function InvoiceArtifact({ className = "" }: { className?: string }) {
  return (
    <figure className={`${styles.artifact} ${styles.invoice} ${className}`} data-product-artifact="invoice">
      <figcaption className={styles.visuallyHidden}>Invoice TutorLog siap dikirim</figcaption>
      <div className={styles.invoiceViewport} aria-label="Pratinjau invoice TutorLog">
        <TplModern data={publicProductInvoiceData} />
      </div>
    </figure>
  );
}
