import {
  BookOpen,
  CalendarDots,
  Clock,
  FileText,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import styles from "./app-ui.module.css";
import type { AppRoute } from "./types";

export interface RouteCanvasProps {
  route: AppRoute;
  children: ReactNode;
}

export function RouteCanvas({ route, children }: RouteCanvasProps) {
  return (
    <div className={`${styles.routeCanvas} ${styles[`route${routeName(route)}`]}`}>
      <RouteDecoration route={route} />
      {children}
    </div>
  );
}

export interface PageMainProps {
  children: ReactNode;
}

export function PageMain({ children }: PageMainProps) {
  return <div className={styles.pageMain}>{children}</div>;
}

function routeName(route: AppRoute) {
  return `${route.charAt(0).toUpperCase()}${route.slice(1)}`;
}

function RouteDecoration({ route }: { route: AppRoute }) {
  if (route === "home") {
    return <BookmarkFanDecoration />;
  }

  if (route === "recap") {
    return (
      <div
        className={`${styles.routeDecoration} ${styles.routeBadge} ${styles.recapDecoration}`}
        aria-hidden="true"
      >
        <CalendarDots size={30} weight="duotone" />
      </div>
    );
  }

  return (
    <div
      className={`${styles.routeDecoration} ${styles.routeBadge} ${styles.invoiceDecoration}`}
      aria-hidden="true"
    >
      <FileText size={30} weight="duotone" />
    </div>
  );
}

function BookmarkFanDecoration() {
  return (
    <div className={`${styles.routeDecoration} ${styles.homeDecoration}`} aria-hidden="true">
      <div className={styles.bookmarkFan}>
        <span className={`${styles.bookmark} ${styles.bookmarkMint}`}>
          <BookOpen size={32} weight="duotone" />
        </span>
        <span className={`${styles.bookmark} ${styles.bookmarkCoral}`}>
          <Clock size={32} weight="duotone" />
        </span>
        <span className={`${styles.bookmark} ${styles.bookmarkLilac}`}>
          <FileText size={32} weight="duotone" />
        </span>
      </div>
    </div>
  );
}
