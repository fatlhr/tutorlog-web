"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHasSupabaseSession } from "@/lib/supabase/has-session-cookie";
import MenuToggle from "@/components/MenuToggle";
import { NavigationLinkPrimitive } from "@/components/ui/navigation-link-primitive";

const links = [
  { href: "/fitur", label: "Fitur" },
  { href: "/harga", label: "Harga" },
  { href: "/panduan", label: "Panduan" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const authed = useHasSupabaseSession();

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
          <NavigationLinkPrimitive
            key={link.href}
            href={link.href}
            label={link.label}
            active={pathname === link.href}
          />
        ))}
      </div>
      <Link className="tl-nav-login" href={authed ? "/app" : "/login"}>
        {authed ? "Beranda" : "Masuk"}
      </Link>
      <div className="tl-public-menu">
        <MenuToggle />
      </div>
    </nav>
  );
}
