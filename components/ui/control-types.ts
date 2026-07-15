import type { MouseEventHandler, ReactNode } from "react";

export type SharedControlSize = "compact" | "default" | "large";

export interface SharedNonVisualAttributes {
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "data-analytics-id"?: string;
}

export interface SharedButtonBehaviorProps extends SharedNonVisualAttributes {
  children: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  block?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

export interface SharedNativeButtonProps extends SharedButtonBehaviorProps {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
}

export interface SharedLinkButtonProps extends SharedButtonBehaviorProps {
  href: string;
  type?: never;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  disabled?: never;
  target?: "_blank";
  rel?: string;
}

export type SharedButtonProps = SharedNativeButtonProps | SharedLinkButtonProps;

export interface SharedIconButtonProps extends SharedNonVisualAttributes {
  icon: ReactNode;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  pressed?: boolean;
}
