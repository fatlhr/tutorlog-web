import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const rootLayout = readFileSync(join(root, "app/layout.tsx"), "utf8");
const legacyCss = readFileSync(join(root, "css/tutorlog-web.css"), "utf8");
const uiDirectory = join(root, "components/app-ui");
const sharedUiDirectory = join(root, "components/ui");
const css = readFileSync(join(uiDirectory, "app-ui.module.css"), "utf8");
const sharedCss = readFileSync(join(root, "css/tutorlog-foundation.css"), "utf8");
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
  ...readdirSync(sharedUiDirectory).map((file) => join(sharedUiDirectory, file)),
  join(root, "css/tutorlog-foundation.css"),
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
const clarifiedComponents = [
  "Textarea",
  "Section",
  "RouteCanvas",
  "PageMain",
  "LoadingLayout",
];

for (const component of [...contractComponents, ...clarifiedComponents]) {
  check(
    new RegExp(`export (?:function|const) ${component}\\b`).test(sources),
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
  "--app-action": "var(--tl-brand-action)",
  "--app-action-hover": "var(--tl-brand-action-hover)",
  "--app-on-action": "var(--tl-brand-on-action)",
  "--app-success": "var(--tl-brand-success)",
  "--app-warning": "var(--tl-brand-warning)",
  "--app-warning-soft": "var(--tl-brand-warning-soft)",
  "--app-error": "var(--tl-brand-error)",
  "--app-error-ink": "#7d302c",
  "--app-info": "var(--tl-brand-info)",
  "--app-info-soft": "var(--tl-brand-info-soft)",
  "--app-home-accent": "#d8f1e7",
  "--app-home-accent-ink": "#006c53",
  "--app-recap-accent": "#e9e3fa",
  "--app-recap-accent-ink": "#63548d",
  "--app-invoice-accent": "#fce1d9",
  "--app-invoice-accent-ink": "#805346",
};

const radii = {
  "--radius-0": "0",
  "--radius-small": "var(--tl-radius-small)",
  "--radius-control": "var(--tl-radius-control)",
  "--radius-surface": "var(--tl-radius-surface)",
  "--radius-overlay": "var(--tl-radius-overlay)",
  "--radius-round": "var(--tl-radius-round)",
};

const foundationTokens = {
  "--space-0": "var(--tl-space-0)",
  "--space-1": "var(--tl-space-1)",
  "--space-2": "var(--tl-space-2)",
  "--space-3": "var(--tl-space-3)",
  "--space-4": "var(--tl-space-4)",
  "--space-5": "var(--tl-space-5)",
  "--space-6": "var(--tl-space-6)",
  "--space-7": "var(--tl-space-7)",
  "--space-8": "var(--tl-space-8)",
  "--space-9": "var(--tl-space-9)",
  "--space-10": "var(--tl-space-10)",
  "--space-11": "var(--tl-space-11)",
  "--elevation-flat": "none",
  "--elevation-menu": "0 8px 24px rgb(18 33 31 / 12%)",
  "--elevation-overlay": "0 20px 48px rgb(18 33 31 / 16%)",
  "--elevation-toast": "0 12px 32px rgb(18 33 31 / 14%)",
  "--motion-instant": "var(--tl-motion-instant)",
  "--motion-fast": "var(--tl-motion-fast)",
  "--motion-standard": "var(--tl-motion-standard)",
  "--motion-slow": "var(--tl-motion-slow)",
  "--motion-overlay": "var(--tl-motion-overlay)",
  "--ease-standard": "var(--tl-ease-standard)",
  "--ease-out": "var(--tl-ease-out)",
  "--app-font-title": "var(--tl-font-title)",
  "--app-font-body": "var(--tl-font-body)",
};

const sharedTokens = {
  "--tl-brand-action": "#006c53",
  "--tl-brand-action-hover": "#00523f",
  "--tl-brand-on-action": "#ffffff",
  "--tl-brand-success": "#006c53",
  "--tl-brand-warning": "#8a5a00",
  "--tl-brand-warning-soft": "#ffe3a3",
  "--tl-brand-error": "#d9706a",
  "--tl-brand-info": "#235c8f",
  "--tl-brand-info-soft": "#d7e9ff",
  "--tl-radius-small": "6px",
  "--tl-radius-control": "10px",
  "--tl-radius-surface": "14px",
  "--tl-radius-overlay": "18px",
  "--tl-radius-round": "999px",
  "--tl-focus-width": "2px",
  "--tl-focus-offset": "2px",
};

const allTokens = { ...colorTokens, ...foundationTokens, ...radii };
for (const [token, value] of Object.entries(allTokens)) {
  contains(`${token}: ${value};`, `token audit: ${token} must equal ${value}`);
}
for (const [token, value] of Object.entries(sharedTokens)) {
  check(
    sharedCss.includes(`${token}: ${value};`),
    `shared token audit: ${token} must equal ${value}`,
  );
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
contains(
  ".selectIcon {\n  position: absolute;\n  inset-inline-end: var(--space-5);",
  "select audit: dropdown arrow must keep a 16px trailing inset",
);
contains("min-height: 96px;", "input-height audit: textarea must be at least 96px");
contains(
  ".choiceOption:not(:has(small)) { align-items: center; }\n.choiceOption:not(:has(small)) input { margin-top: 0; }",
  "choice audit: single-line options must be vertically centered",
);
contains(
  ".loadingState,\n.pageMain {\n  box-sizing: border-box;",
  "dimension audit: PageMain and primitives must use border-box sizing",
);
contains("gap: 28px;", "rhythm audit: desktop section gap must be 28px");
contains(
  ".sectionStack { gap: var(--space-6); }",
  "rhythm audit: tablet section gap must be 20px",
);
contains(
  ".sectionStack { gap: var(--space-5); }",
  "rhythm audit: mobile section gap must be 16px",
);

contains(
  "outline: var(--tl-focus-width) solid var(--tl-focus-color);",
  "focus audit: shared focus ring is missing",
);
contains(
  "0 0 0 4px var(--app-action);",
  "focus audit: primary control outer ring is missing",
);
check(!/outline:\s*0(?:px)?\s*;/.test(css), "focus audit: outline suppression is forbidden");
check(!css.includes("!important"), "foundation audit: !important is forbidden");
check(
  legacyCss.includes(
    ".color-picker { display: flex; max-width: 100%; gap: 10px; padding: 4px; flex-wrap: wrap; }",
  ),
  "invoice audit: accent swatches need a four-pixel safe inset for selection and focus rings",
);
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
  join(root, "app/app/rekap/loading.tsx"),
  join(root, "app/app/invoice/page.tsx"),
  join(root, "app/app/invoice/loading.tsx"),
  join(root, "app/app/layout.tsx"),
  join(root, "components/AppTopBar.tsx"),
  join(root, "components/HomeUpgradePrompt.tsx"),
  join(root, "components/NamePromptDialog.tsx"),
  join(root, "components/PaywallDialog.tsx"),
  join(root, "components/ProfileContent.tsx"),
  join(root, "components/RekapContent.tsx"),
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

const routeLoadingContracts = [
  { file: join(root, "app/app/loading.tsx"), route: "home" },
  { file: join(root, "app/app/rekap/loading.tsx"), route: "recap" },
  { file: join(root, "app/app/invoice/loading.tsx"), route: "invoice" },
];
for (const { file, route } of routeLoadingContracts) {
  const fileExists = existsSync(file);
  check(fileExists, `loading contract: missing ${file}`);
  if (!fileExists) continue;

  const content = readFileSync(file, "utf8");
  check(
    content.includes(`<RouteCanvas route="${route}">`),
    `loading contract: ${file} must use the ${route} route canvas`,
  );
  check(
    content.includes("<PageMain>"),
    `loading contract: ${file} must use PageMain`,
  );
  check(
    (content.match(/<LoadingState\b/g) ?? []).length >= 3,
    `loading contract: ${file} must expose at least three structured regions`,
  );
}
const allowedPackages = new Set([
  "react",
  "react-dom",
  "next/link",
  "@phosphor-icons/react",
  "@phosphor-icons/react/dist/ssr",
]);
const packageImports = [...sources.matchAll(/from\s+["']([^"']+)["']/g)]
  .map((match) => match[1])
  .filter(
    (specifier) =>
      !specifier.startsWith(".") &&
      !specifier.startsWith("@/components/ui/"),
  );
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
