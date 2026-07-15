import type { ReactNode } from "react";

export type {
  SharedControlSize as ControlSize,
  SharedNonVisualAttributes as NonVisualAttributes,
} from "@/components/ui/control-types";

export type AppRoute = "home" | "recap" | "invoice" | "settings";
export type AppTone = "neutral" | AppRoute | "error";
export type FieldSize = "compact" | "default";

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
