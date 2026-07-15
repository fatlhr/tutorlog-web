"use client";

import { X } from "@phosphor-icons/react";
import {
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
import {
  DialogNestingContext,
  useDialogBehavior,
} from "@/components/ui/use-dialog-behavior";
import styles from "./app-ui.module.css";

type FocusReference = RefObject<HTMLElement | null>;

function getOverlayAvailability(kind: OverlayFrameProps["kind"]) {
  if (kind === "dialog") return true;
  if (typeof window === "undefined") return false;

  return window.matchMedia(
    kind === "bottomSheet" ? "(max-width: 767px)" : "(min-width: 768px)",
  ).matches;
}

function useOverlayAvailability(kind: OverlayFrameProps["kind"]) {
  const [available, setAvailable] = useState(() => getOverlayAvailability(kind));

  useEffect(() => {
    if (kind === "dialog") return;

    const media = window.matchMedia(
      kind === "bottomSheet" ? "(max-width: 767px)" : "(min-width: 768px)",
    );
    const update = () => setAvailable(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [kind]);

  return available;
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
  useDialogBehavior({
    open: open && available,
    onClose: () => onOpenChange(false),
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
    <DialogNestingContext.Provider value>
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
    </DialogNestingContext.Provider>
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
