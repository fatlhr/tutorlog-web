import type { CSSProperties } from "react";

const DEFAULT_ACCENT = "#006C53";

function normalizeHexColor(value: string) {
  const trimmed = value.trim();
  const shortMatch = /^#([0-9a-f]{3})$/i.exec(trimmed);
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  return /^#[0-9a-f]{6}$/i.test(trimmed)
    ? trimmed.toUpperCase()
    : DEFAULT_ACCENT;
}

export function mixHexWithWhite(value: string, accentRatio: number) {
  const hex = normalizeHexColor(value);
  const ratio = Math.min(1, Math.max(0, accentRatio));
  const channels = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  const mixed = channels.map((channel) => Math.round(channel * ratio + 255 * (1 - ratio)));

  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function createInvoiceAccentStyle(value: string): CSSProperties {
  const accent = normalizeHexColor(value);

  return {
    ["--acc" as string]: accent,
    ["--acc-soft-6" as string]: mixHexWithWhite(accent, 0.06),
    ["--acc-soft-8" as string]: mixHexWithWhite(accent, 0.08),
    ["--acc-soft-12" as string]: mixHexWithWhite(accent, 0.12),
  };
}
