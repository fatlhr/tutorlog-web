"use client";

import { usePathname } from "next/navigation";
import { ChartBar, FileText, House } from "@phosphor-icons/react";
import { NavigationItem } from "@/components/app-ui/navigation";
import { APP_ROUTE_ITEMS, getActiveAppRoute } from "@/components/app-ui/routes";

const routeIcons = {
  home: House,
  recap: ChartBar,
  invoice: FileText,
};

export default function TabBar() {
  const pathname = usePathname();
  const activeRoute = getActiveAppRoute(pathname);

  return (
    <nav className="mob-tab-bar" aria-label="Navigasi utama mobile">
      {APP_ROUTE_ITEMS.map((item) => {
        const active = activeRoute === item.route;
        const Icon = routeIcons[item.route];
        return (
          <NavigationItem
            key={item.href}
            href={item.href}
            label={item.label}
            route={item.route}
            mode="bottom"
            active={active}
            icon={<Icon size={18} weight={active ? "fill" : "regular"} />}
          />
        );
      })}
    </nav>
  );
}
