"use client";

import { X } from "@phosphor-icons/react";
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./controls";
import styles from "./app-ui.module.css";

type FocusReference = RefObject<HTMLElement | null>;

interface OverlayBehaviorOptions {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dismissible: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  initialFocusRef?: FocusReference;
  returnFocusRef?: FocusReference;
}

const OverlayContext = createContext(false);

function useOverlayAvailability(kind: OverlayFrameProps["kind"]) {
  const [available, setAvailable] = useState(kind === "dialog");

  useEffect(() => {
    if (kind === "dialog") {
      setAvailable(true);
      return;
    }

    const media = window.matchMedia(
      kind === "bottomSheet" ? "(max-width: 767px)" : "(min-width: 768px)",
    );
    const update = () => setAvailable(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [kind]);

  return available;
}

function useOverlayBehavior({
  open,
  onOpenChange,
  dismissible,
  panelRef,
  initialFocusRef,
  returnFocusRef,
}: OverlayBehaviorOptions) {
  const nested = useContext(OverlayContext);
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  if (open && nested) {
    throw new Error("Protected app overlays cannot be nested.");
  }

  useEffect(() => {
    if (!open) return;

    const previousActive = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableSelector = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");
    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      );
    const firstTarget = initialFocusRef?.current ?? focusable()[0] ?? panelRef.current;
    firstTarget?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        onOpenChangeRef.current(false);
        return;
      }

      if (event.key !== "Tab") return;
      const targets = focusable();
      if (targets.length === 0) {
        event.preventDefault();
        panelRef.current?.focus();
        return;
      }

      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      (returnFocusRef?.current ?? previousActive)?.focus();
    };
  }, [
    dismissible,
    initialFocusRef,
    open,
    panelRef,
    returnFocusRef,
  ]);
}

interface OverlayFrameProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: FocusReference;
  returnFocusRef?: FocusReference;
  dismissible: boolean;
  kind: "dialog" | "bottomSheet" | "sidePanel";
  modifier: string;
}

function OverlayFrame({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  initialFocusRef,
  returnFocusRef,
  dismissible,
  kind,
  modifier,
}: OverlayFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const available = useOverlayAvailability(kind);
  useOverlayBehavior({
    open: open && available,
    onOpenChange,
    dismissible,
    panelRef,
    initialFocusRef,
    returnFocusRef,
  });

  if (!open || !available || typeof document === "undefined") return null;

  const closeFromScrim = (event: MouseEvent<HTMLDivElement>) => {
    if (dismissible && event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  const layer = (
    <OverlayContext.Provider value>
      <div
        className={`${styles.overlayLayer} ${styles.themeScope} ${styles[`${kind}Layer`]}`}
        onMouseDown={closeFromScrim}
      >
        <div
          ref={panelRef}
          className={`${styles.overlayPanel} ${styles[`${kind}Panel`]} ${styles[modifier]}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
        >
          <header className={styles.overlayHeader}>
            <div>
              <h2 id={titleId}>{title}</h2>
              {description ? <p id={descriptionId}>{description}</p> : null}
            </div>
            <IconButton
              icon={<X size={18} />}
              label="Tutup"
              variant="quiet"
              size="default"
              onClick={() => onOpenChange(false)}
            />
          </header>
          <div className={styles.overlayBody}>{children}</div>
          {footer ? <footer className={styles.overlayFooter}>{footer}</footer> : null}
        </div>
      </div>
    </OverlayContext.Provider>
  );

  return createPortal(layer, document.body);
}

interface SharedOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  initialFocusRef?: FocusReference;
  returnFocusRef?: FocusReference;
}

export interface DialogProps extends SharedOverlayProps {
  size?: "small" | "medium" | "large" | "preview";
  description?: string;
  dismissible?: boolean;
}

export function Dialog({
  size = "medium",
  dismissible = true,
  ...props
}: DialogProps) {
  return (
    <OverlayFrame
      {...props}
      kind="dialog"
      modifier={`dialog${size.charAt(0).toUpperCase()}${size.slice(1)}`}
      dismissible={dismissible}
    />
  );
}

export interface BottomSheetProps extends SharedOverlayProps {
  height?: "content" | "tall";
  dismissible?: boolean;
}

export function BottomSheet({
  height = "content",
  dismissible = true,
  ...props
}: BottomSheetProps) {
  return (
    <OverlayFrame
      {...props}
      kind="bottomSheet"
      modifier={`bottomSheet${height.charAt(0).toUpperCase()}${height.slice(1)}`}
      dismissible={dismissible}
    />
  );
}

export interface SidePanelProps extends SharedOverlayProps {
  size?: "default";
}

export function SidePanel({ size = "default", ...props }: SidePanelProps) {
  return (
    <OverlayFrame
      {...props}
      kind="sidePanel"
      modifier={`sidePanel${size.charAt(0).toUpperCase()}${size.slice(1)}`}
      dismissible
    />
  );
}
