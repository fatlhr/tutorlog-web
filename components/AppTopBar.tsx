"use client";

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

  const items = [
    { id: "rekap", label: "Rekap Sesi", href: "/app/rekap", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18 M7 15V9 M12 15V5 M17 15v-3" /></svg> },
    { id: "invoice", label: "Invoice Builder", href: "/app/invoice", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M9 13h6 M9 17h4" /></svg> },
    { id: "langganan", label: "Langganan", href: "/app/langganan", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h14v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z M3 9h18 M17 15h.01" /></svg> },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <div className="app-topbar-left">
          <Link href="/app/rekap" className="brand">
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
        <div className="app-topbar-right">
          <div className="app-topbar-user">
            <div className="av">{initials}</div>
            <span className="em">{name}</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: 16 }}
            aria-label="Keluar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" /></svg>
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
}
