import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync(
  new URL("../components/app-ui/app-ui.module.css", import.meta.url),
  "utf8",
);
const source = readFileSync(
  new URL("../components/app-ui/route-canvas.tsx", import.meta.url),
  "utf8",
);

assert.match(
  source,
  /import \{[\s\S]*CalendarDots,[\s\S]*FileText,[\s\S]*\} from "@phosphor-icons\/react\/dist\/ssr";/,
  "Route decorations must use complete Phosphor icons",
);
assert.match(
  source,
  /styles\.routeBadge[^>]*>[\s\S]*?<CalendarDots size=\{30\} weight="duotone" \/>/,
  "Rekap decoration must render a complete calendar badge",
);
assert.match(
  source,
  /styles\.routeBadge[^>]*>[\s\S]*?<FileText size=\{30\} weight="duotone" \/>/,
  "Invoice decoration must render a complete document badge",
);
assert.doesNotMatch(
  source,
  /periodMarker|documentTab|cropMark/,
  "Partial line, tab, and crop-mark ornaments must not remain in the route canvas",
);
assert.match(
  styles,
  /\.routeBadge \{[^}]*display: grid;[^}]*width: 64px;[^}]*height: 64px;[^}]*place-items: center;[^}]*border: 1px solid[^}]*border-radius: var\(--radius-control\);/s,
  "Route badges must be complete, closed 64px icon containers",
);
assert.match(
  styles,
  /\.recapDecoration,\s*\.invoiceDecoration \{[^}]*top: 110px;[^}]*right: max\(var\(--space-8\), calc\(\(100vw - 1200px\) \/ 2 - 80px\)\);/s,
  "Rekap and Invoice badges must share the same desktop gutter anchor",
);
assert.match(
  styles,
  /\.recapDecoration \{[^}]*color: var\(--app-recap-accent-ink\);[^}]*border-color:[^}]*background:/s,
  "Rekap badge must retain its route colors",
);
assert.match(
  styles,
  /\.invoiceDecoration \{[^}]*color: var\(--app-invoice-accent-ink\);[^}]*border-color:[^}]*background:/s,
  "Invoice badge must retain its route colors",
);
assert.match(
  styles,
  /@media \(max-width: 1279px\) \{[\s\S]*?\.recapDecoration,[\s\S]*?\.invoiceDecoration \{ display: none; \}/,
  "Route badges must disappear when the desktop gutter is too narrow",
);
assert.doesNotMatch(
  styles,
  /\.periodMarker|\.documentTab|\.cropMark/,
  "Partial decoration CSS must be removed",
);

console.log("route decoration contract passed");
