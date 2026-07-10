import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import PublicMotion from "@/components/PublicMotion";
import PublicNav from "@/components/PublicNav";

type PublicShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
  className?: string;
};

export function PublicShell({
  eyebrow,
  title,
  subtitle,
  icon,
  children,
  aside,
  compact = false,
  className = "",
}: PublicShellProps) {
  return (
    <main className={`tl-public ${compact ? "tl-public-compact" : ""} ${className}`}>
      <PublicMotion />
      <PublicNav />

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
      <div className="tl-footer-identity">
        <Link className="tl-brand" href="/" aria-label="Kembali ke beranda TutorLog">
          <span className="tl-brand-mark">
            <Image src="/tutorlog-logo.png" alt="" width={28} height={28} />
          </span>
          <span>TutorLog</span>
        </Link>
        <p>Teman kerja untuk catatan les, rekap, dan invoice tutor privat.</p>
        <Link href="/kontak">Butuh bantuan?</Link>
      </div>
      <div className="tl-footer-meta">
        <div className="tl-footer-links" aria-label="Tautan legal">
          <Link href="/privacy">Privasi</Link>
          <Link href="/terms">Syarat</Link>
          <Link href="/account">Hapus Akun</Link>
        </div>
        <span className="tl-footer-copyright">© 2026 TutorLog untuk tutor Indonesia</span>
      </div>
    </footer>
  );
}
