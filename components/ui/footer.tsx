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
        <p className={styles.footerDesc}>Teman kerja untuk catatan les, rekap, dan invoice tutor privat.</p>
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
          <Link className={styles.footerLink} href="/account">Hapus Akun</Link>
        ) : (
          <Link className={styles.footerLink} href="/kontak">Kontak</Link>
        )}
        <Link className={styles.footerLink} href="/privacy">Privasi</Link>
        <Link className={styles.footerLink} href="/terms">Syarat &amp; Ketentuan</Link>
      </div>
      <span className={styles.footerCopyright}>© 2026 TutorLog</span>
    </footer>
  );
}
