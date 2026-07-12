"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChartBar, FileText, House, Lifebuoy, SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

interface AppTopBarProps {
  name: string;
  initials: string;
  isPlus: boolean;
}

const items = [
  { label: "Beranda", href: "/app", icon: House },
  { label: "Rekap", href: "/app/rekap", icon: ChartBar },
  { label: "Invoice", href: "/app/invoice", icon: FileText },
];

export default function AppTopBar({ name, initials, isPlus }: AppTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [open]);

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <Link href="/app" className="app-brand" aria-label="Beranda TutorLog">
          <span className="app-brand-mark"><Image src="/tutorlog-logo.png" alt="" width={34} height={34} /></span>
          <span>TutorLog</span>
        </Link>

        <nav className="app-topbar-nav" aria-label="Navigasi utama">
          {items.map((item) => {
            const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
                <Icon size={17} weight={active ? "fill" : "regular"} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="app-account" ref={dropdownRef}>
          <button
            type="button"
            className="app-account-trigger"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-haspopup="menu"
            aria-label={`Menu akun ${name}`}
          >
            <span className="app-account-avatar">{initials}</span>
            <span className="app-account-name">{name}</span>
          </button>

          {open && (
            <div className="app-account-menu" role="menu">
              <div className="app-account-summary">
                <strong>{name}</strong>
                <span>{isPlus ? "Plus aktif" : "Paket Free"}</span>
              </div>
              <Link href="/kontak" role="menuitem" onClick={() => setOpen(false)}>
                <Lifebuoy size={17} aria-hidden="true" />
                Bantuan
              </Link>
              <button type="button" role="menuitem" onClick={handleLogout}>
                <SignOut size={17} aria-hidden="true" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
