import Image from "next/image";
import Link from "next/link";
import styles from "./footer.module.css";

type FooterContext = "public" | "protected";

interface AppFooterProps {
  context: FooterContext;
}

export function AppFooter({ context }: AppFooterProps) {
  return (
    <footer
      data-footer={context}
      className={`${styles.footer}${context === "protected" ? ` ${styles.footerTabBar}` : ""}`}
    >
      <div className={styles.footerCol}>
        <Link className={styles.footerBrand} href="/" aria-label="Kembali ke beranda TutorLog">
          <span className={styles.footerBrandMark}>
            <Image src="/tutorlog-logo.png" alt="" width={28} height={28} />
          </span>
          TutorLog
        </Link>
        <p className={styles.footerDesc}>Teman kerja tutor untuk mencatat sesi, membuat rekap, dan menyiapkan invoice.</p>
      </div>
      <div className={styles.footerCol}>
        <span className={styles.footerColHeading}>Jelajahi</span>
        <Link className={styles.footerLink} href="/fitur">Fitur</Link>
        <Link className={styles.footerLink} href="/harga">Harga</Link>
        <Link className={styles.footerLink} href="/panduan">Panduan</Link>
      </div>
      <div className={styles.footerCol}>
        <span className={styles.footerColHeading}>Bantuan</span>
        {context === "public" ? (
          <Link className={styles.footerLink} href="/account">Hapus akun</Link>
        ) : (
          <Link className={styles.footerLink} href="/kontak">Kontak</Link>
        )}
        <Link className={styles.footerLink} href="/privacy">Privasi</Link>
        <Link className={styles.footerLink} href="/terms">Syarat &amp; ketentuan</Link>
      </div>
      {context === "public" ? (
        <div className={styles.footerCol}>
          <span className={styles.footerColHeading}>Partner</span>
          <a
            className={styles.footerLink}
            href="https://tutorplis.id"
            target="_blank"
            rel="noopener"
            aria-label="TutorPlis, direktori tutor privat Indonesia (buka di tab baru)"
          >
            TutorPlis
          </a>
        </div>
      ) : null}
      <span className={styles.footerCopyright}>© 2026 TutorLog</span>
    </footer>
  );
}
