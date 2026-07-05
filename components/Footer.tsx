import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  variant?: "mobile" | "desktop";
}

export default function Footer({ variant = "mobile" }: FooterProps) {
  if (variant === "desktop") {
    return (
      <div className="vp-desktop">
        <div className="landing-footer">
          <div className="l">
            <span className="mk" style={{ width: 32, height: 32, borderRadius: "var(--r-sm)", background: "var(--tw-surface-soft)", border: "1px solid var(--tw-border)" }}>
              <Image src="/tutorlog-logo.png" alt="" width={32} height={32} />
            </span>
            <span className="brand-sm">TutorLog</span>
            <span>© 2026 · TutorLog untuk tutor Indonesia</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div className="r">
              <Link href="/fitur">Fitur</Link>
              <Link href="/harga">Harga</Link>
              <Link href="/panduan">Panduan</Link>
              <a href="#">Blog</a>
            </div>
            <div style={{ width: 1, height: 20, background: "var(--tw-border)" }}></div>
            <div className="r">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/account">Account Deletion</Link>
              <Link href="/kontak">Kontak</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-mobile">
      <div className="mob-footer">
        <Link className="top" href="/">
          <span style={{ width: 24, height: 24, borderRadius: "var(--r-sm)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Image src="/tutorlog-logo.png" alt="" width={24} height={24} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          </span>
          <span className="brand-sm">TutorLog</span>
        </Link>
        <div className="links">
          <Link href="/fitur">Fitur</Link><Link href="/harga">Harga</Link><Link href="/panduan">Panduan</Link>
          <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/kontak">Kontak</Link>
        </div>
        <div className="copy">© 2026 · TutorLog untuk tutor Indonesia</div>
      </div>
    </div>
  );
}
