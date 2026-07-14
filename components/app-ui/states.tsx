import {
  DeviceMobile,
  FileText,
  ListMagnifyingGlass,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { ReactElement, ReactNode } from "react";
import {
  Button,
  IconButton,
  type ButtonProps,
  type IconButtonProps,
} from "./controls";
import styles from "./app-ui.module.css";

type StateAction =
  | ReactElement<ButtonProps, typeof Button>
  | ReactElement<IconButtonProps, typeof IconButton>;

function assertStateAction(action: StateAction | undefined, component: string) {
  if (action && action.type !== Button && action.type !== IconButton) {
    throw new Error(`${component} action must be Button or IconButton.`);
  }
}

export interface EmptyStateProps {
  context: "home" | "recap" | "invoice";
  title: string;
  body: string;
  action?: StateAction;
  visual?: ReactNode;
}

const emptyIcons = {
  home: DeviceMobile,
  recap: ListMagnifyingGlass,
  invoice: FileText,
};

export function EmptyState({
  context,
  title,
  body,
  action,
  visual,
}: EmptyStateProps) {
  assertStateAction(action, "EmptyState");
  const Icon = emptyIcons[context];
  return (
    <section className={styles.contentState}>
      <div className={styles.stateVisual} aria-hidden="true">
        {visual ?? <Icon size={28} />}
      </div>
      <div className={styles.stateCopy}>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {action ? <div className={styles.stateAction}>{action}</div> : null}
    </section>
  );
}

type LoadingCount = 1 | 2 | 3 | 4 | 5 | 6;

export type LoadingStateProps = {
  label?: string;
} & (
  | { shape: "summary"; rowCount?: Exclude<LoadingCount, 5 | 6> }
  | { shape: "rows" | "form"; rowCount?: LoadingCount }
  | { shape: "preview"; rowCount?: never }
);

export interface LoadingLayoutProps {
  variant: "home" | "invoice";
  children: ReactNode;
}

export function LoadingLayout({
  variant,
  children,
}: LoadingLayoutProps) {
  return (
    <div
      className={`${styles.loadingLayout} ${styles[`loadingLayout${variant.charAt(0).toUpperCase()}${variant.slice(1)}`]}`}
    >
      {children}
    </div>
  );
}

export function LoadingState({
  shape,
  rowCount,
  label,
}: LoadingStateProps) {
  const resolvedLabel = label ?? "Memuat data...";
  const resolvedCount = shape === "preview" ? 1 : (rowCount ?? 3);
  if (resolvedCount < 1 || resolvedCount > 6) {
    throw new Error("LoadingState rowCount must be between one and six.");
  }
  if (shape === "summary" && resolvedCount > 4) {
    throw new Error("Summary LoadingState accepts at most four items.");
  }

  return (
    <div
      className={`${styles.loadingState} ${styles[`loading${shape.charAt(0).toUpperCase()}${shape.slice(1)}`]}`}
      role="status"
      aria-label={resolvedLabel}
      data-count={resolvedCount}
    >
      {Array.from({ length: resolvedCount }, (_, index) => (
        <span className={styles.skeleton} key={index} aria-hidden="true" />
      ))}
    </div>
  );
}

export interface ErrorStateProps {
  scope: "page" | "section" | "inline";
  title: string;
  body: string;
  retry?: StateAction;
}

export function ErrorState({
  scope,
  title,
  body,
  retry,
}: ErrorStateProps) {
  assertStateAction(retry, "ErrorState");
  return (
    <section className={`${styles.contentState} ${styles.errorState} ${styles[`errorScope${scope.charAt(0).toUpperCase()}${scope.slice(1)}`]}`} role="alert">
      <div className={styles.stateVisual} aria-hidden="true">
        <WarningCircle size={28} />
      </div>
      <div className={styles.stateCopy}>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
      {retry ? <div className={styles.stateAction}>{retry}</div> : null}
    </section>
  );
}
