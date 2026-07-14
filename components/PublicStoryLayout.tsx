import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import PublicMotion from "@/components/PublicMotion";
import PublicNav from "@/components/PublicNav";
import { AppFooter } from "@/components/AppFooter";
import { PublicProductRail } from "@/components/PublicProductRail";

type PublicStoryLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
  closing?: ReactNode;
  className?: string;
  railLabel?: string;
  withRail?: boolean;
  showBackLink?: boolean;
};

export function PublicStoryLayout({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  closing,
  className = "",
  railLabel,
  withRail = true,
  showBackLink = false,
}: PublicStoryLayoutProps) {
  return (
    <main className={`tl-public tls-story-page ${className}`}>
      <PublicMotion />
      <PublicNav />
      <header className="tls-story-hero">
        {showBackLink ? (
          <Link className="tls-story-back-link" href="/">
            <ArrowLeft size={15} weight="bold" aria-hidden="true" />
            <span>Beranda</span>
          </Link>
        ) : null}
        <p className="tl-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {actions ? <div className="tls-story-actions">{actions}</div> : null}
      </header>
      {withRail ? (
        <div className="tls-story-grid">
          <div className="tls-story-narrative">
            {children}
          </div>
          <div className="tls-story-divider" aria-hidden="true" />
          <aside className="tls-story-rail">
            <PublicProductRail label={railLabel} />
          </aside>
        </div>
      ) : (
        <div className="tls-story-row-list">{children}</div>
      )}
      {closing ? <div className="tls-story-closing">{closing}</div> : null}
      <AppFooter context="public" />
    </main>
  );
}
