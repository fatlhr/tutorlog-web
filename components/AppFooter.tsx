import Image from "next/image";
import Link from "next/link";
import styles from "@/components/app-ui/app-ui.module.css";

type FooterContext = "public" | "protected";

interface AppFooterProps {
  context: FooterContext;
}

export function AppFooter({ context }: AppFooterProps) {
  return (
    <footer className={`${styles.footer} ${context === "public" ? styles.themeScope : ""}`}>
      <Link className={styles.footerBrand} href="/" aria-label="Kembali ke beranda TutorLog">
        <span className={styles.footerBrandMark}>
          <Image src="/tutorlog-logo.png" alt="" width={28} height={28} />
        </span>
        TutorLog
      </Link>
      <p className={styles.footerDesc}>Teman kerja untuk catatan les, rekap, dan invoice tutor privat.</p>
      <div className={styles.footerSupport}>
        <span className={styles.footerSupportLabel}>Pusat Bantuan</span>
        {context === "public" ? (
          <Link className={styles.footerSupportLink} href="/account">
            Hapus Akun
          </Link>
        ) : (
          <Link className={styles.footerSupportLink} href="/kontak" target="_blank">
            Kontak
          </Link>
        )}
      </div>
      <div className={styles.footerDivider} />
      <span className={styles.footerCopyright}>© 2026 TutorLog</span>
      <div className={styles.footerLegal}>
        {context === "public" ? (
          <>
            <Link className={styles.footerLegalLink} href="/privacy">Privasi</Link>
            <span className={styles.footerLegalDot} aria-hidden="true">·</span>
            <Link className={styles.footerLegalLink} href="/terms">Syarat</Link>
          </>
        ) : (
          <>
            <Link className={styles.footerLegalLink} href="/privacy" target="_blank">Privasi</Link>
            <span className={styles.footerLegalDot} aria-hidden="true">·</span>
            <Link className={styles.footerLegalLink} href="/terms" target="_blank">Syarat</Link>
          </>
        )}
      </div>
    </footer>
  );
}
