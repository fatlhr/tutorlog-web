import { PageMain, RouteCanvas } from "@/components/app-ui/route-canvas";
import { LoadingState } from "@/components/app-ui/states";
import { LoadingPageHeader } from "../route-loading";
import styles from "../route-loading.module.css";

export default function InvoiceLoading() {
  return (
    <>
      <div className={styles.invoiceMobileHandoff} role="status" aria-label="Memuat Invoice">
        <span className={styles.handoffIcon} aria-hidden="true" />
        <span className={`${styles.loadingLine} ${styles.handoffEyebrow}`} aria-hidden="true" />
        <span className={`${styles.loadingLine} ${styles.handoffTitle}`} aria-hidden="true" />
        <span className={`${styles.loadingLine} ${styles.handoffDescription}`} aria-hidden="true" />
        <span className={`${styles.loadingLine} ${styles.handoffAction}`} aria-hidden="true" />
      </div>

      <div className={styles.invoiceDesktop}>
        <RouteCanvas route="invoice">
          <PageMain>
            <LoadingPageHeader label="Memuat judul Invoice" actions={1} />
            <div className={styles.invoiceLayout}>
              <div className={styles.invoiceForm}>
                <LoadingState shape="form" rowCount={6} label="Memuat formulir Invoice" />
              </div>
              <div className={styles.invoicePreview}>
                <LoadingState shape="preview" label="Memuat preview Invoice" />
              </div>
            </div>
          </PageMain>
        </RouteCanvas>
      </div>
    </>
  );
}
