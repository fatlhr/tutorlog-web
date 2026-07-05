"use client";

import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  dark?: boolean;
}

export default function Navbar({ dark }: NavbarProps) {
  return (
    <>
      {/* Mobile */}
      <div className="vp-mobile">
        <nav className={`mob-nav${dark ? " mob-nav-dark" : ""}`}>
          <Link className="brand" href="/">
            <span className="mk"><Image src="/tutorlog-logo.png" alt="" width={32} height={32} /></span>
            <span className="wm">TutorLog</span>
          </Link>
          <button className="hamburger" aria-label="Buka menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </nav>
      </div>

      {/* Desktop */}
      <div className="vp-desktop">
        <nav className={`nav-top${dark ? "-dark" : ""}`}>
          <Link className="brand" href="/" style={{ textDecoration: "none" }}>
            <span className="mk" style={{ width: 40, height: 40, borderRadius: "var(--r-md)" }}>
              <Image src="/tutorlog-logo.png" alt="" width={40} height={40} />
            </span>
            <span className="wm">TutorLog</span>
          </Link>
          <div className="links">
            <Link href="/fitur">Fitur</Link>
            <Link href="/harga">Harga</Link>
            <Link href="/panduan">Panduan</Link>
          </div>
          <Link className="btn btn-primary btn-sm" href="/login" style={dark ? { background: "var(--tw-primary-soft)", color: "var(--tw-primary-dark)" } : undefined}>
            Masuk
          </Link>
        </nav>
      </div>
    </>
  );
}
