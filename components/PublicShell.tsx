import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import MenuToggle from "@/components/MenuToggle";
import PublicMotion from "@/components/PublicMotion";

type PublicShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
};

export function PublicShell({
  eyebrow,
  title,
  subtitle,
  icon,
  children,
  aside,
  compact = false,
}: PublicShellProps) {
  return (
    <main className={`tl-public ${compact ? "tl-public-compact" : ""}`}>
      <PublicMotion />
      <nav className="tl-public-nav" aria-label="Navigasi utama">
        <Link className="tl-brand" href="/" aria-label="TutorLog">
          <span className="tl-brand-mark">
            <Image src="/tutorlog-logo.png" alt="" width={40} height={40} priority />
          </span>
          <span>TutorLog</span>
        </Link>
        <div className="tl-nav-links">
          <Link href="/fitur">Fitur</Link>
          <Link href="/harga">Harga</Link>
          <Link href="/panduan">Panduan</Link>
        </div>
        <Link className="tl-nav-login" href="/login">
          Masuk
        </Link>
        <div className="tl-public-menu">
          <MenuToggle />
        </div>
      </nav>

      <header className={`tl-public-hero ${aside ? "" : "tl-public-hero-solo"}`}>
        <div className="tl-public-hero-copy">
          {icon ? (
            <span className="tl-public-icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <p className="tl-kicker">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {aside ? <div className="tl-public-hero-aside">{aside}</div> : null}
      </header>

      <div className="tl-public-body">{children}</div>
      <PublicFooter />
    </main>
  );
}

export function PublicFooter() {
  return (
    <footer className="tl-footer">
      <div className="tl-footer-links">
        <Link href="/fitur">Fitur</Link>
        <Link href="/harga">Harga</Link>
        <Link href="/panduan">Panduan</Link>
        <Link href="/privacy">Privasi</Link>
        <Link href="/terms">Syarat</Link>
        <Link href="/account">Hapus Akun</Link>
        <Link href="/kontak">Kontak</Link>
      </div>
      <div className="tl-footer-bottom">
        <Link className="tl-brand" href="/" aria-label="TutorLog">
          <span className="tl-brand-mark">
            <Image src="/tutorlog-logo.png" alt="" width={28} height={28} />
          </span>
          <span>TutorLog</span>
        </Link>
        <span>© 2026 TutorLog untuk tutor Indonesia</span>
      </div>
    </footer>
  );
}
