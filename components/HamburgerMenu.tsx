"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
}

const links = [
  { href: "/fitur", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/panduan", label: "Panduan" },
  { href: "/kontak", label: "Kontak" },
];

export default function HamburgerMenu({ open, onClose }: HamburgerMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) setAuthed(true);
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [open]);

  if (!open) return null;

  return (
    <div ref={menuRef} className="tl-mobile-menu" role="dialog" aria-modal="true" aria-label="Menu navigasi" onClick={onClose}>
      <div className="tl-mobile-menu-panel" onClick={(event) => event.stopPropagation()}>
        <header className="tl-mobile-menu-header">
          <Link className="tl-brand" href="/" aria-label="Kembali ke beranda TutorLog" onClick={onClose}>
            <span className="tl-brand-mark"><Image src="/tutorlog-logo.png" alt="" width={40} height={40} /></span>
            <span>TutorLog</span>
          </Link>
          <button ref={closeButtonRef} className="tl-mobile-menu-close" aria-label="Tutup menu" onClick={onClose}>
            <X size={24} weight="bold" aria-hidden="true" />
          </button>
        </header>

        <nav className="tl-mobile-menu-links" aria-label="Halaman publik">
          {links.map((link) => (
            <Link className="tl-mobile-menu-link" key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={onClose}>
              <span>{link.label}</span>
              <ArrowRight size={22} aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <Link className="tl-mobile-menu-login" href={authed ? "/app" : "/login"} onClick={onClose}>
          <span>{authed ? "Dashboard" : "Masuk lewat Email"}</span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
