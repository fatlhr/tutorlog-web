import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function read(relativePath) {
  const url = new URL(`../${relativePath}`, import.meta.url);
  return existsSync(url) ? readFileSync(url, "utf8") : "";
}

const homePage = read("app/app/page.tsx");
const homeStyles = read("app/app/home.module.css");
const homeLoading = read("app/app/loading.tsx");
const recapLoading = read("app/app/rekap/loading.tsx");
const invoiceLoading = read("app/app/invoice/loading.tsx");
const routeLoading = read("app/app/route-loading.tsx");
const routeLoadingStyles = read("app/app/route-loading.module.css");

assert.match(
  homePage,
  /<div className=\{styles\.hero\}>[\s\S]*?<PageHeader[\s\S]*?<SummaryBand/,
  "Beranda header and summary must share a local hero stack",
);
assert.match(
  homeStyles,
  /\.hero \{[^}]*display: grid;[^}]*gap: 80px;/s,
  "Beranda hero must have the approved 80px desktop gap",
);
assert.match(
  homeStyles,
  /@media \(width < 768px\) \{[\s\S]*?\.hero \{ gap: 36px; \}/,
  "Beranda hero must use the approved 36px mobile gap",
);

assert.match(
  routeLoading,
  /export function LoadingPageHeader\([\s\S]*?role="status"[\s\S]*?aria-label=\{label\}/,
  "Protected routes must share an accessible loading header helper",
);
assert.match(
  routeLoading,
  /export function LoadingSectionHeading\(/,
  "Protected routes must share a section-heading skeleton helper",
);
assert.match(
  routeLoadingStyles,
  /\.headerCopy \{[^}]*width: min\(560px, 100%\);/s,
  "Loading header copy must stay clear of Beranda decoration",
);

assert.match(homeLoading, /<LoadingPageHeader[^>]*actions=\{0\}/, "Beranda loading must use a header without actions");
assert.match(homeLoading, /className=\{homeStyles\.hero\}/, "Beranda loading must reuse final hero spacing");
assert.match(homeLoading, /className=\{homeStyles\.workspace\}/, "Beranda loading must match the final workspace grid");
assert.match(homeLoading, /className=\{homeStyles\.closingRail\}/, "Beranda loading must include the closing rail footprint");

assert.match(recapLoading, /<LoadingPageHeader[^>]*actions=\{2\}/, "Rekap loading must reserve two header actions");
assert.match(recapLoading, /styles\.recapDesktopFilters/, "Rekap loading must include desktop filters");
assert.match(recapLoading, /styles\.recapMobileFilter/, "Rekap loading must include a mobile filter trigger");
assert.match(recapLoading, /<LoadingSectionHeading/, "Rekap loading must include its list heading");

assert.match(invoiceLoading, /<LoadingPageHeader[^>]*actions=\{1\}/, "Invoice loading must reserve one header action");
assert.match(invoiceLoading, /styles\.invoiceDesktop/, "Invoice loading must include the desktop editor layout");
assert.match(invoiceLoading, /styles\.invoiceMobileHandoff/, "Invoice loading must include the mobile handoff layout");
assert.match(
  routeLoadingStyles,
  /@media \(max-width: 1199px\) \{[\s\S]*?\.invoicePreview \{ display: none; \}/,
  "Invoice preview skeleton must hide below desktop width",
);
assert.match(
  routeLoadingStyles,
  /@media \(width < 768px\) \{[\s\S]*?\.invoiceDesktop \{ display: none; \}[\s\S]*?\.invoiceMobileHandoff \{[^}]*display: grid;/,
  "Invoice loading must switch to the mobile handoff",
);

console.log("route loading layout contract passed");
