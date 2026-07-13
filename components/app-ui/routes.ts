import type { AppRoute } from "./types";

export interface AppRouteItem {
  route: AppRoute;
  href: string;
  label: "Beranda" | "Rekap" | "Invoice";
}

export const APP_ROUTE_ITEMS: readonly AppRouteItem[] = [
  { route: "home", href: "/app", label: "Beranda" },
  { route: "recap", href: "/app/rekap", label: "Rekap" },
  { route: "invoice", href: "/app/invoice", label: "Invoice" },
];

export function getActiveAppRoute(pathname: string): AppRoute {
  if (pathname === "/app/invoice" || pathname.startsWith("/app/invoice/")) {
    return "invoice";
  }
  if (pathname === "/app/rekap" || pathname.startsWith("/app/rekap/")) {
    return "recap";
  }
  return "home";
}

