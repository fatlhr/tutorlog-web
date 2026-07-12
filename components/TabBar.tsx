"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBar, FileText, House } from "@phosphor-icons/react";

const tabs = [
  { label: "Beranda", href: "/app", icon: House },
  { label: "Rekap", href: "/app/rekap", icon: ChartBar },
  { label: "Invoice", href: "/app/invoice", icon: FileText },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="mob-tab-bar" aria-label="Navigasi utama mobile">
      {tabs.map((tab) => {
        const active = tab.href === "/app" ? pathname === "/app" : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link key={tab.href} href={tab.href} className={`mob-tab${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="tab-ic"><Icon size={19} weight={active ? "fill" : "regular"} aria-hidden="true" /></span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
