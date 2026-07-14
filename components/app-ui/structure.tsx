import {
  CheckCircle,
  Info,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import {
  Children,
  isValidElement,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from "react";
import styles from "./app-ui.module.css";
import {
  Button,
  IconButton,
  type ButtonProps,
  type IconButtonProps,
} from "./controls";
import type { AppRoute, AppTone, SummaryItem } from "./types";

type ActionElement =
  | ReactElement<ButtonProps, typeof Button>
  | ReactElement<IconButtonProps, typeof IconButton>;

function isActionElement(action: unknown): action is ActionElement {
  return (
    isValidElement(action) &&
    (action.type === Button || action.type === IconButton)
  );
}

export interface SurfaceProps {
  as?: "div" | "section" | "aside";
  variant?: "paper" | "soft" | "contextual" | "preview";
  padding?: "none" | "compact" | "default" | "spacious";
  tone?: AppTone;
  labelledBy?: string;
  children: ReactNode;
}

function titleCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export function Surface({
  as = "div",
  variant = "paper",
  padding = "default",
  tone = "neutral",
  labelledBy,
  children,
}: SurfaceProps) {
  const Component = as as ElementType;
  const className = [
    styles.surface,
    styles[`surfaceVariant${titleCase(variant)}`],
    styles[`surfacePadding${titleCase(padding)}`],
    styles[`tone${titleCase(tone)}`],
  ].join(" ");

  return (
    <Component className={className} aria-labelledby={labelledBy}>
      {children}
    </Component>
  );
}

export interface PageHeaderProps {
  route: AppRoute;
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ActionElement | [ActionElement, ActionElement];
}

export function PageHeader({
  route,
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  const actionItems = Children.toArray(actions);
  if (
    actionItems.length > 2 ||
    actionItems.some((action) => !isActionElement(action))
  ) {
    throw new Error("PageHeader accepts one or two Button/IconButton actions.");
  }

  return (
    <header className={`${styles.pageHeader} ${styles[`tone${titleCase(route)}`]}`}>
      <div className={styles.pageHeaderCopy}>
        <p className={styles.routeEyebrow}>{eyebrow}</p>
        <h1 className={styles.pageTitle}>{title}</h1>
        {description ? <p className={styles.pageDescription}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.pageHeaderActions}>{actions}</div> : null}
    </header>
  );
}

export interface SectionHeadingProps {
  headingId?: string;
  level?: "h2" | "h3";
  size?: "default" | "compact";
  title: string;
  description?: string;
  action?: ActionElement;
}

export function SectionHeading({
  headingId,
  level = "h2",
  size = "default",
  title,
  description,
  action,
}: SectionHeadingProps) {
  if (action && !isActionElement(action)) {
    throw new Error("SectionHeading action must be Button or IconButton.");
  }
  const Heading = level;
  return (
    <div className={`${styles.sectionHeading} ${styles[`sectionHeading${titleCase(size)}`]}`}>
      <div>
        <Heading id={headingId}>{title}</Heading>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className={styles.sectionHeadingAction}>{action}</div> : null}
    </div>
  );
}

export interface SectionProps {
  labelledBy?: string;
  children: ReactNode;
}

export function Section({ labelledBy, children }: SectionProps) {
  return (
    <section className={styles.sectionStack} aria-labelledby={labelledBy}>
      {children}
    </section>
  );
}

export interface SummaryBandProps {
  label: string;
  items: SummaryItem[];
  density?: "default" | "compact";
  tone?: Exclude<AppTone, "neutral" | "error">;
}

export function SummaryBand({
  label,
  items,
  density = "default",
  tone = "home",
}: SummaryBandProps) {
  if (items.length < 1 || items.length > 4) {
    throw new Error("SummaryBand requires between one and four items.");
  }

  return (
    <section
      className={`${styles.summaryBand} ${styles[`summaryDensity${titleCase(density)}`]} ${styles[`tone${titleCase(tone)}`]}`}
      aria-label={label}
      data-count={items.length}
    >
      {items.map((item) => (
        <div
          className={styles.summaryItem}
          key={item.label}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </section>
  );
}

type FeedbackStatus = "info" | "success" | "warning" | "error";

export interface FeedbackMessageProps {
  status: FeedbackStatus;
  density?: "compact" | "default";
  title: string;
  body?: string;
  action?: ActionElement;
  live?: boolean;
}

const feedbackIcons = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
};

export function FeedbackMessage({
  status,
  density = "default",
  title,
  body,
  action,
  live = false,
}: FeedbackMessageProps) {
  if (action && !isActionElement(action)) {
    throw new Error("FeedbackMessage action must be Button or IconButton.");
  }
  const Icon = feedbackIcons[status];
  const role = live ? (status === "error" ? "alert" : "status") : undefined;

  return (
    <div
      className={`${styles.feedback} ${styles[`feedback${titleCase(status)}`]} ${styles[`feedbackDensity${titleCase(density)}`]}`}
      role={role}
    >
      <Icon className={styles.feedbackIcon} size={20} aria-hidden="true" />
      <div className={styles.feedbackCopy}>
        <strong>{title}</strong>
        {body ? <p>{body}</p> : null}
      </div>
      {action ? <div className={styles.feedbackAction}>{action}</div> : null}
    </div>
  );
}
