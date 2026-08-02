import type { AppRoute } from "./types";

export interface AppRouteItem {
  route: AppRoute;
  href: string;
  label: "Beranda" | "Rekap" | "Invoice" | "Profil";
}

export const APP_ROUTE_ITEMS: readonly AppRouteItem[] = [
  { route: "home", href: "/app", label: "Beranda" },
  { route: "recap", href: "/app/rekap", label: "Rekap" },
  { route: "invoice", href: "/app/invoice", label: "Invoice" },
  { route: "settings", href: "/app/profil", label: "Profil" },
];

export function getActiveAppRoute(pathname: string): AppRoute {
  if (pathname === "/app/invoice" || pathname.startsWith("/app/invoice/")) {
    return "invoice";
  }
  if (pathname === "/app/rekap" || pathname.startsWith("/app/rekap/")) {
    return "recap";
  }
  if (pathname === "/app/profil" || pathname.startsWith("/app/profil/")) {
    return "settings";
  }
  return "home";
}
