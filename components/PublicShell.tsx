import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import PublicMotion from "@/components/PublicMotion";
import PublicNav from "@/components/PublicNav";
import { AppFooter } from "@/components/AppFooter";

type PublicShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  compact?: boolean;
  className?: string;
  showBackLink?: boolean;
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
  showBackLink = false,
}: PublicShellProps) {
  return (
    <main className={`tl-public ${compact ? "tl-public-compact" : ""} ${className}`}>
      <PublicMotion />
      <PublicNav />

      <header className={`tl-public-hero ${aside ? "" : "tl-public-hero-solo"}`}>
        <div className="tl-public-hero-copy">
          {showBackLink ? (
            <Link className="tls-story-back-link" href="/">
              <ArrowLeft size={15} weight="bold" aria-hidden="true" />
              <span>Beranda</span>
            </Link>
          ) : null}
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
      <AppFooter context="public" />
    </main>
  );
}
