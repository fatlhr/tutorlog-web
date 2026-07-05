"use client";

import Image from "next/image";
import Link from "next/link";

interface HamburgerMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function HamburgerMenu({ open, onClose }: HamburgerMenuProps) {
  if (!open) return null;

  return (
    <div className="mob-menu" onClick={onClose}>
      <nav className="mob-nav mob-nav-dark">
        <Link className="brand" href="/" onClick={(e) => e.stopPropagation()}>
          <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
          <span className="wm">TutorLog</span>
        </Link>
        <button className="hamburger" aria-label="Tutup menu" aria-expanded="true" onClick={onClose}>
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
