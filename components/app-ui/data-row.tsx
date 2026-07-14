"use client";

import Link from "next/link";
import { Children, isValidElement, memo, type ReactNode } from "react";
import { Button, IconButton } from "./controls";
import styles from "./app-ui.module.css";

interface DataRowBaseProps {
  density?: "compact" | "default";
  tone?: "neutral" | "home" | "recap";
  label: string;
  leading?: ReactNode;
  title: ReactNode;
  metadata?: ReactNode;
  trailing?: ReactNode;
}

interface DataRowLinkProps extends DataRowBaseProps {
  href: string;
  onActivate?: never;
}

interface DataRowButtonProps extends DataRowBaseProps {
  href?: never;
  onActivate: () => void;
}

interface DataRowStaticProps extends DataRowBaseProps {
  href?: never;
  onActivate?: never;
}

export type DataRowProps =
  | DataRowLinkProps
  | DataRowButtonProps
  | DataRowStaticProps;

function titleCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

const interactiveTags = new Set(["a", "button", "input", "select", "textarea"]);

function assertNonInteractiveSlot(node: ReactNode, slot: string) {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const childProps = child.props as {
      children?: ReactNode;
      href?: unknown;
      onClick?: unknown;
      role?: unknown;
    };
    const interactive =
      child.type === Button ||
      child.type === IconButton ||
      (typeof child.type === "string" && interactiveTags.has(child.type)) ||
      childProps.href !== undefined ||
      childProps.onClick !== undefined ||
      childProps.role === "button" ||
      childProps.role === "link";

    if (interactive) {
      throw new Error(`DataRow ${slot} cannot contain an interactive element.`);
    }
    if (childProps.children) {
      assertNonInteractiveSlot(childProps.children, slot);
    }
  });
}

export const DataRow = memo(function DataRow(props: DataRowProps) {
  assertNonInteractiveSlot(props.leading, "leading");
  assertNonInteractiveSlot(props.title, "title");
  assertNonInteractiveSlot(props.metadata, "metadata");
  assertNonInteractiveSlot(props.trailing, "trailing");
  const { density = "default", tone = "neutral" } = props;
  const interactive =
    ("href" in props && Boolean(props.href)) ||
    ("onActivate" in props && Boolean(props.onActivate));
  const className = [
    styles.dataRow,
    styles[`dataRowDensity${titleCase(density)}`],
    styles[`tone${titleCase(tone)}`],
    interactive ? styles.dataRowInteractive : "",
  ]
    .filter(Boolean)
    .join(" ");
  const content = (
    <>
      {props.leading ? <span className={styles.dataRowLeading}>{props.leading}</span> : null}
      <span className={styles.dataRowMain}>
        <strong>{props.title}</strong>
        {props.metadata ? <span>{props.metadata}</span> : null}
      </span>
      {props.trailing ? <span className={styles.dataRowTrailing}>{props.trailing}</span> : null}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link className={className} href={props.href} aria-label={props.label}>
        {content}
      </Link>
    );
  }

  if ("onActivate" in props && props.onActivate) {
    return (
      <button
        className={className}
        type="button"
        onClick={props.onActivate}
        aria-label={props.label}
      >
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
});
