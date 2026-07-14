import type { ReactNode } from "react";

export type AppRoute = "home" | "recap" | "invoice" | "settings";
export type AppTone = "neutral" | AppRoute | "error";
export type ControlSize = "compact" | "default" | "large";
export type FieldSize = "compact" | "default";

export interface NonVisualAttributes {
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  "data-analytics-id"?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SummaryItem {
  label: string;
  value: ReactNode;
}

export interface ChoiceOption extends SelectOption {
  description?: string;
}
