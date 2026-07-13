"use client";

import Link from "next/link";
import {
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import styles from "./app-ui.module.css";
import type { AppRoute, AppTone, ChoiceOption } from "./types";

function titleCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

export interface NavigationItemProps {
  href: string;
  label: string;
  icon: ReactNode;
  route: AppRoute;
  mode: "top" | "bottom";
  active: boolean;
}

export function NavigationItem({
  href,
  label,
  icon,
  route,
  mode,
  active,
}: NavigationItemProps) {
  return (
    <Link
      href={href}
      className={`${styles.navigationItem} ${styles[`navigation${titleCase(mode)}`]} ${styles[`tone${titleCase(route)}`]} ${active ? styles.navigationActive : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className={styles.navigationIcon} aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export interface SegmentedItem {
  value: string;
  label: string;
}

export interface SegmentedNavigationProps {
  label: string;
  items: SegmentedItem[];
  value: string;
  onChange: (value: string) => void;
  size?: "compact" | "default";
  tone?: Exclude<AppTone, "error">;
}

export function SegmentedNavigation({
  label,
  items,
  value,
  onChange,
  size = "default",
  tone = "neutral",
}: SegmentedNavigationProps) {
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (items.length < 1 || items.length > 4) {
    throw new Error("SegmentedNavigation requires between one and four items.");
  }
  if (!items.some((item) => item.value === value)) {
    throw new Error("SegmentedNavigation value must match one item.");
  }

  const moveSelection = (index: number) => {
    const next = items[index];
    if (!next) return;
    onChange(next.value);
    buttonRefs.current[index]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    }

    if (nextIndex === undefined) return;
    event.preventDefault();
    moveSelection(nextIndex);
  };

  return (
    <div
      className={`${styles.segmented} ${styles[`segmented${titleCase(size)}`]} ${styles[`tone${titleCase(tone)}`]}`}
      role="radiogroup"
      aria-label={label}
      data-count={items.length}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={selected ? styles.segmentedSelected : undefined}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export interface ChoiceGroupProps {
  label: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
  layout?: "wrap" | "grid";
  disabled?: boolean;
}

export function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  layout = "wrap",
  disabled = false,
}: ChoiceGroupProps) {
  const groupName = useId();

  return (
    <fieldset className={styles.choiceFieldset} disabled={disabled}>
      <legend>{label}</legend>
      <div className={`${styles.choiceGroup} ${styles[`choice${titleCase(layout)}`]}`}>
        {options.map((option) => (
          <label className={styles.choiceOption} key={option.value}>
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              {option.description ? <small>{option.description}</small> : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
