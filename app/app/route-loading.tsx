import styles from "./route-loading.module.css";

type LoadingActionCount = 0 | 1 | 2;

interface LoadingPageHeaderProps {
  label: string;
  actions: LoadingActionCount;
}

export function LoadingPageHeader({ label, actions }: LoadingPageHeaderProps) {
  return (
    <header className={styles.loadingPageHeader} role="status" aria-label={label}>
      <div className={styles.headerCopy} aria-hidden="true">
        <span className={`${styles.loadingLine} ${styles.headerEyebrow}`} />
        <span className={`${styles.loadingLine} ${styles.headerTitle}`} />
        <span className={`${styles.loadingLine} ${styles.headerDescription}`} />
      </div>
      {actions > 0 ? (
        <div className={styles.headerActions} aria-hidden="true">
          {Array.from({ length: actions }, (_, index) => (
            <span className={styles.headerAction} key={index} />
          ))}
        </div>
      ) : null}
    </header>
  );
}

interface LoadingSectionHeadingProps {
  label: string;
  action?: boolean;
}

export function LoadingSectionHeading({ label, action = false }: LoadingSectionHeadingProps) {
  return (
    <div className={styles.sectionHeading} role="status" aria-label={label}>
      <div className={styles.sectionHeadingCopy} aria-hidden="true">
        <span className={`${styles.loadingLine} ${styles.sectionTitle}`} />
        <span className={`${styles.loadingLine} ${styles.sectionDescription}`} />
      </div>
      {action ? <span className={styles.sectionAction} aria-hidden="true" /> : null}
    </div>
  );
}
