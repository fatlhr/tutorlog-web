import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ArrowClockwise,
  ArrowRight,
  CalendarBlank,
  CaretDown,
  ChartBar,
  CheckCircle,
  DeviceMobile,
  FileText,
  House,
  LockKey,
  Question,
  SpinnerGap,
  UserCircle,
  WarningCircle,
} from "@phosphor-icons/react";

const here = dirname(fileURLToPath(import.meta.url));
const output = join(here, "icons");

const icons = {
  "arrow-clockwise": ArrowClockwise,
  "arrow-right": ArrowRight,
  calendar: CalendarBlank,
  "caret-down": CaretDown,
  "chart-bar": ChartBar,
  "check-circle": CheckCircle,
  "device-mobile": DeviceMobile,
  "file-text": FileText,
  house: House,
  "lock-key": LockKey,
  question: Question,
  "spinner-gap": SpinnerGap,
  user: UserCircle,
  "warning-circle": WarningCircle,
};

await mkdir(output, { recursive: true });

for (const [name, Icon] of Object.entries(icons)) {
  const svg = renderToStaticMarkup(
    React.createElement(Icon, {
      size: 24,
      weight: name === "house" ? "fill" : "regular",
      color: "#000000",
      "aria-hidden": "true",
    }),
  );
  await writeFile(join(output, `${name}.svg`), `${svg}\n`, "utf8");
}

