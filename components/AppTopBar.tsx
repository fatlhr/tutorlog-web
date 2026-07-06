"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AppTopBarProps {
  name: string;
  initials: string;
}

export default function AppTopBar({ name, initials }: AppTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const items = [
    { id: "rekap", label: "Rekap Sesi", href: "/app/rekap", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg> },
    { id: "invoice", label: "Invoice Builder", href: "/app/invoice", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg> },
  ];

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <div className="app-topbar-left">
          <Link href="/app" className="brand">
            <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={34} height={34} /></span>
            <span className="wm">TutorLog</span>
          </Link>
          <nav className="app-topbar-nav">
            {items.map((it) => (
              <Link
                key={it.id}
                href={it.href}
                className={pathname.startsWith(it.href) ? "active" : ""}
              >
                {it.icon}
                <span>{it.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="app-topbar-right" ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            className="app-topbar-user"
            onClick={() => setOpen(!open)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            aria-expanded={open}
            aria-haspopup="true"
          >
            <div className="av">{initials}</div>
            <span className="em">{name}</span>
          </button>
          {open && (
            <div style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: 8,
              background: "var(--tw-surface)",
              border: "1px solid var(--tw-border)",
              borderRadius: "var(--r-md)",
              boxShadow: "0 8px 24px rgba(0,0,0,.08)",
              minWidth: 200,
              padding: "8px 0",
              zIndex: 50,
            }}>
              <div style={{
                padding: "8px 16px",
                borderBottom: "1px solid var(--tw-border)",
              }}>
                <div style={{ fontFamily: "var(--f-title)", fontWeight: 700, fontSize: 14, color: "var(--tw-text)" }}>{name}</div>
                <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--tw-text-3)", marginTop: 2 }}>Tutor</div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px 16px",
                  fontFamily: "var(--f-body)",
                  fontSize: 14,
                  color: "var(--tw-text-2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" /></svg>
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}