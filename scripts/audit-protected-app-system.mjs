import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const rootLayout = readFileSync(join(root, "app/layout.tsx"), "utf8");
const uiDirectory = join(root, "components/app-ui");
const css = readFileSync(join(uiDirectory, "app-ui.module.css"), "utf8");
const sources = readdirSync(uiDirectory)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".tsx"))
  .map((file) => readFileSync(join(uiDirectory, file), "utf8"))
  .join("\n");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

function contains(fragment, message) {
  check(css.includes(fragment), message);
}

const foundationFiles = [
  ...readdirSync(uiDirectory).map((file) => join(uiDirectory, file)),
  join(root, "scripts/audit-protected-app-system.mjs"),
];
for (const file of foundationFiles) {
  const content = readFileSync(file, "utf8");
  check(!/[\t ]+$/m.test(content), `file hygiene: trailing whitespace in ${file}`);
  check(
    !/^(?:<<<<<<<|=======|>>>>>>>)/m.test(content),
    `file hygiene: conflict marker in ${file}`,
  );
  check(content.endsWith("\n"), `file hygiene: missing final newline in ${file}`);
}

const contractComponents = [
  "Button",
  "IconButton",
  "Field",
  "Select",
  "DateField",
  "TextField",
  "Surface",
  "PageHeader",
  "SectionHeading",
  "SummaryBand",
  "DataRow",
  "FeedbackMessage",
  "NavigationItem",
  "SegmentedNavigation",
  "ChoiceGroup",
  "Dialog",
  "BottomSheet",
  "SidePanel",
  "EmptyState",
  "LoadingState",
  "ErrorState",
];
const clarifiedComponents = ["Textarea", "Section", "RouteCanvas", "PageMain"];

for (const component of [...contractComponents, ...clarifiedComponents]) {
  check(
    new RegExp(`export function ${component}\\b`).test(sources),
    `component inventory: missing ${component}`,
  );
}

const referencedClasses = new Set(
  [...sources.matchAll(/styles\.([A-Za-z][A-Za-z0-9]*)/g)].map(
    (match) => match[1],
  ),
);
for (const className of referencedClasses) {
  check(
    new RegExp(`\\.${className}(?![A-Za-z0-9_-])`).test(css),
    `CSS module audit: missing .${className}`,
  );
}

const colorTokens = {
  "--app-canvas": "#f4faf8",
  "--app-paper": "#ffffff",
  "--app-paper-soft": "#edf7f3",
  "--app-paper-muted": "#e8eff1",
  "--app-ink": "#12211f",
  "--app-ink-secondary": "#3e4944",
  "--app-ink-muted": "#50645e",
  "--app-ink-disabled": "#72827d",
  "--app-line": "#b7d1c8",
  "--app-line-strong": "#8eada3",
  "--app-overlay": "rgb(18 33 31 / 42%)",
  "--app-action": "#006c53",
  "--app-action-hover": "#00523f",
  "--app-on-action": "#ffffff",
  "--app-success": "#006c53",
  "--app-warning": "#8a5a00",
  "--app-warning-soft": "#ffe3a3",
  "--app-error": "#d9706a",
  "--app-error-ink": "#7d302c",
  "--app-info": "#235c8f",
  "--app-info-soft": "#d7e9ff",
  "--app-home-accent": "#d8f1e7",
  "--app-home-accent-ink": "#006c53",
  "--app-recap-accent": "#e9e3fa",
  "--app-recap-accent-ink": "#63548d",
  "--app-invoice-accent": "#fce1d9",
  "--app-invoice-accent-ink": "#805346",
};

const radii = {
  "--radius-0": "0",
  "--radius-small": "6px",
  "--radius-control": "10px",
  "--radius-surface": "14px",
  "--radius-overlay": "18px",
  "--radius-round": "999px",
};

const foundationTokens = {
  "--space-0": "0",
  "--space-1": "2px",
  "--space-2": "4px",
  "--space-3": "8px",
  "--space-4": "12px",
  "--space-5": "16px",
  "--space-6": "20px",
  "--space-7": "24px",
  "--space-8": "32px",
  "--space-9": "40px",
  "--space-10": "48px",
  "--space-11": "64px",
  "--elevation-flat": "none",
  "--elevation-menu": "0 8px 24px rgb(18 33 31 / 12%)",
  "--elevation-overlay": "0 20px 48px rgb(18 33 31 / 16%)",
  "--elevation-toast": "0 12px 32px rgb(18 33 31 / 14%)",
  "--motion-instant": "0ms",
  "--motion-fast": "120ms",
  "--motion-standard": "180ms",
  "--motion-slow": "240ms",
  "--motion-overlay": "280ms",
  "--ease-standard": "cubic-bezier(.2, 0, 0, 1)",
  "--ease-out": "cubic-bezier(.16, 1, .3, 1)",
  "--app-font-title": "var(--f-title, \"Courier Prime\", monospace)",
  "--app-font-body": "var(--f-body, \"Source Serif 4\", serif)",
};

const allTokens = { ...colorTokens, ...foundationTokens, ...radii };
for (const [token, value] of Object.entries(allTokens)) {
  contains(`${token}: ${value};`, `token audit: ${token} must equal ${value}`);
}

for (const [token, value] of Object.entries(radii)) {
  contains(`${token}: ${value};`, `radius audit: ${token} must equal ${value}`);
}
for (const declaration of css.matchAll(/border-radius:\s*([^;]+);/g)) {
  check(
    /var\(--radius-|^0(?:\s+0)*$/.test(declaration[1]),
    `radius audit: raw radius declaration ${declaration[1]}`,
  );
}

for (const [name, fragment] of Object.entries({
  "compact button height": ".controlSizeCompact {\n  min-height: 40px;\n  padding-inline: 14px;",
  "default button height": ".controlSizeDefault {\n  min-height: 44px;\n  padding-inline: 18px;",
  "large button height": ".controlSizeLarge {\n  min-height: 48px;\n  padding-inline: 22px;",
  "compact icon button": ".iconButton.controlSizeCompact { --icon-button-size: 40px; }",
  "default icon button": ".iconButton.controlSizeDefault { --icon-button-size: 44px; }",
  "large icon button": ".iconButton.controlSizeLarge { --icon-button-size: 48px; }",
})) {
  contains(fragment, `button-size audit: missing ${name}`);
}

contains(
  ".fieldControlSizeCompact { min-height: 40px; }",
  "input-height audit: compact fields must be 40px",
);
contains(
  ".fieldControlSizeDefault { min-height: 48px; }",
  "input-height audit: default fields must be 48px",
);
contains("min-height: 96px;", "input-height audit: textarea must be at least 96px");
contains(
  ".loadingState,\n.pageMain {\n  box-sizing: border-box;",
  "dimension audit: PageMain and primitives must use border-box sizing",
);
contains("gap: 28px;", "rhythm audit: desktop section gap must be 28px");
contains(
  ".sectionStack { gap: var(--space-7); }",
  "rhythm audit: tablet section gap must be 24px",
);
contains(
  ".sectionStack { gap: var(--space-6); }",
  "rhythm audit: mobile section gap must be 20px",
);

contains(
  "outline: 2px solid var(--app-action);",
  "focus audit: shared focus ring is missing",
);
contains(
  "0 0 0 4px var(--app-action);",
  "focus audit: primary control outer ring is missing",
);
check(!/outline:\s*0(?:px)?\s*;/.test(css), "focus audit: outline suppression is forbidden");
check(!css.includes("!important"), "foundation audit: !important is forbidden");
check(
  /<main\s+id=["']main-content["']>/.test(rootLayout),
  "landmark audit: root layout must own one main#main-content landmark",
);

const productionDirectories = ["app", "components"];
const productionFiles = productionDirectories.flatMap((directory) =>
  readdirSync(join(root, directory), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name))
    .filter((file) => !file.startsWith(uiDirectory)),
);
const productionImports = productionFiles.filter((file) => {
  if (!/\.(?:ts|tsx|js|jsx)$/.test(file)) return false;
  return readFileSync(file, "utf8").includes("app-ui/");
});
const allowedProductionConsumers = new Set([
  join(root, "app/app/loading.tsx"),
  join(root, "app/app/page.tsx"),
  join(root, "components/AppTopBar.tsx"),
  join(root, "components/HomeUpgradePrompt.tsx"),
  join(root, "components/TabBar.tsx"),
]);
const unexpectedProductionConsumers = productionImports.filter(
  (file) => !allowedProductionConsumers.has(file),
);
const missingProductionConsumers = [...allowedProductionConsumers].filter(
  (file) => !productionImports.includes(file),
);
check(
  unexpectedProductionConsumers.length === 0,
  `route isolation: unexpected production consumers found: ${unexpectedProductionConsumers.join(", ")}`,
);
check(
  missingProductionConsumers.length === 0,
  `route isolation: approved phased consumers missing: ${missingProductionConsumers.join(", ")}`,
);
const allowedPackages = new Set([
  "react",
  "react-dom",
  "next/link",
  "@phosphor-icons/react",
  "@phosphor-icons/react/dist/ssr",
]);
const packageImports = [...sources.matchAll(/from\s+["']([^"']+)["']/g)]
  .map((match) => match[1])
  .filter((specifier) => !specifier.startsWith("."));
for (const specifier of packageImports) {
  check(
    allowedPackages.has(specifier),
    `dependency audit: unexpected package import ${specifier}`,
  );
}
check(!/\bfetch\s*\(|\bsupabase\b|from\(["']/.test(sources), "boundary audit: data access found in visual primitives");

if (failures.length > 0) {
  console.error(`Protected app UI audit failed (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Component inventory: ${contractComponents.length} contract + ${clarifiedComponents.length} clarified`);
  console.log(`Token audit: ${Object.keys(allTokens).length} color, spacing, radius, elevation, motion, and type tokens`);
  console.log(`Radius audit: ${Object.keys(radii).length} named radii`);
  console.log("Button-size audit: compact, default, large");
  console.log("Input-height audit: compact, default, textarea");
  console.log("Focus audit: shared ring, primary halo, no suppression");
  console.log(`Foundation boundaries: ${allowedProductionConsumers.size} phased consumers, existing packages only, no data access`);
  console.log(`File hygiene: ${foundationFiles.length} foundation files`);
}
