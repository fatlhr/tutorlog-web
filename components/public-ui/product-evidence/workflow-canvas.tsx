import { InvoiceArtifact } from "./invoice-artifact";
import { RecapArtifact } from "./recap-artifact";
import { SessionArtifact } from "./session-artifact";
import styles from "./product-evidence.module.css";

const workflowCopy = [
  {
    id: "session",
    title: "Catat sesi setelah mengajar.",
    body: "Pilih murid, lalu catat detail sesi selagi semuanya masih ingat.",
    artifact: <SessionArtifact />,
  },
  {
    id: "recap",
    title: "Buka rekap saat dibutuhkan.",
    body: "Sesi, jam mengajar, pendapatan, dan murid sudah tersusun. Tinggal cek atau ekspor dari HP maupun web.",
    artifact: <RecapArtifact />,
  },
  {
    id: "invoice",
    title: "Buat invoice dari sesi yang sama.",
    body: "Pilih sesi dan periksa invoice di web sebelum disimpan atau dikirim.",
    artifact: <InvoiceArtifact />,
  },
] as const;

function Connector({ workflow = false }: { workflow?: boolean }) {
  return (
    <span
      className={styles.connector}
      data-workflow-connector={workflow || undefined}
      aria-hidden="true"
    />
  );
}

export function WorkflowCanvas() {
  return (
    <section className={styles.workflow} aria-label="Alur produk TutorLog" data-workflow-canvas>
      {workflowCopy.map((stage, index) => (
        <div className={styles.stage} data-workflow-stage={stage.id} key={stage.id}>
          <div className={styles.stageCopy}>
            <h2>{stage.title}</h2>
            <p>{stage.body}</p>
          </div>
          <div className={styles.artifactSlot}>
            {stage.artifact}
            {index < workflowCopy.length - 1 ? <Connector workflow /> : null}
          </div>
        </div>
      ))}
    </section>
  );
}

export function MobileGuideEvidence() {
  return (
    <div className={styles.guideSingle} data-guide-evidence="mobile">
      <SessionArtifact />
    </div>
  );
}

export function WebGuideEvidence() {
  return (
    <div className={styles.guideSequence} data-guide-evidence="web">
      <RecapArtifact />
      <Connector />
      <InvoiceArtifact />
    </div>
  );
}
