"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MenuToggle from "@/components/MenuToggle";

const links = [
  { href: "/fitur", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/panduan", label: "Panduan" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      if (data.session) setAuthed(true);
    });
  }, []);

  return (
    <nav className="tl-public-nav" aria-label="Navigasi utama">
      <div className="tl-public-brand-cluster">
        <Link className="tl-brand" href="/" aria-label="Kembali ke beranda TutorLog">
          <span className="tl-brand-mark">
            <Image src="/tutorlog-logo.png" alt="" width={40} height={40} priority />
          </span>
          <span>TutorLog</span>
        </Link>
      </div>
      <div className="tl-nav-links">
        {links.map((link) => (
          <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>
            {link.label}
          </Link>
        ))}
      </div>
      <Link className="tl-nav-login" href={authed ? "/app" : "/login"}>
        {authed ? "Dashboard" : "Masuk"}
      </Link>
      <div className="tl-public-menu">
        <MenuToggle />
      </div>
    </nav>
  );
}
