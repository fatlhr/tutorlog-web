"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ open, onClose }: HamburgerMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
    <div ref={menuRef} className="mob-menu" role="dialog" aria-modal="true" aria-label="Menu navigasi" onClick={onClose}>
      <nav className="mob-nav mob-nav-dark" onClick={(event) => event.stopPropagation()}>
        <Link className="brand" href="/" onClick={(e) => e.stopPropagation()}>
          <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
          <span className="wm">TutorLog</span>
        </Link>
        <button ref={closeButtonRef} className="hamburger" aria-label="Tutup menu" aria-expanded="true" onClick={onClose}>
          <span></span><span></span><span></span>
        </button>
      </nav>
      <div className="menu-links" onClick={(e) => e.stopPropagation()}>
        <Link href="/fitur" onClick={onClose}>Fitur</Link>
        <Link href="/harga" onClick={onClose}>Harga</Link>
        <Link href="/panduan" onClick={onClose}>Panduan</Link>
        <Link href="/kontak" onClick={onClose}>Kontak</Link>
      </div>
      <div className="menu-cta" onClick={(e) => e.stopPropagation()}>
        <Link className="btn-hero primary" href="/login" onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, height: 52, borderRadius: "var(--r-full)", background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)", fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 15 }}>
          <span>Masuk dengan Magic Link</span>
        </Link>
      </div>
    </div>
  );
}
