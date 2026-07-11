import type { ReactNode } from "react";
import PublicMotion from "@/components/PublicMotion";
import PublicNav from "@/components/PublicNav";
import { PublicFooter } from "@/components/PublicShell";
import { PublicProductRail } from "@/components/PublicProductRail";

type PublicStoryLayoutProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  railLabel?: string;
};

export function PublicStoryLayout({
  eyebrow,
  title,
  subtitle,
  actions,
  children,
  className = "",
  railLabel,
}: PublicStoryLayoutProps) {
  return (
    <main className={`tl-public tls-story-page ${className}`}>
      <PublicMotion />
      <PublicNav />
      <header className="tls-story-hero">
        <p className="tl-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {actions ? <div className="tls-story-actions">{actions}</div> : null}
      </header>
      <div className="tls-story-grid">
        <div className="tls-story-narrative">
          {children}
        </div>
        <div className="tls-story-divider" aria-hidden="true" />
        <aside className="tls-story-rail">
          <PublicProductRail label={railLabel} />
        </aside>
      </div>
      <PublicFooter />
    </main>
  );
}
