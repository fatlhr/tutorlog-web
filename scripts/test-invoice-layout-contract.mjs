import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [routeCanvas, appUiCss, siteCss, routeLoadingCss, rekapPage, invoicePage, invoiceLoading] = await Promise.all([
  readFile(new URL("../components/app-ui/route-canvas.tsx", import.meta.url), "utf8"),
  readFile(new URL("../components/app-ui/app-ui.module.css", import.meta.url), "utf8"),
  readFile(new URL("../css/site.css", import.meta.url), "utf8"),
  readFile(new URL("../app/app/route-loading.module.css", import.meta.url), "utf8"),
  readFile(new URL("../components/RekapContent.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/app/invoice/page.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/app/invoice/loading.tsx", import.meta.url), "utf8"),
]);
const invoiceHeaderAction = invoicePage.match(
  /actions=\{\(\s*<Button[\s\S]*?<\/Button>\s*\)\}/,
)?.[0] ?? "";

assert.doesNotMatch(
  routeCanvas,
  /width\?:\s*"default"\s*\|\s*"wide"/,
  "shared PageMain should keep the same width contract across protected routes",
);
assert.doesNotMatch(
  appUiCss,
  /\.pageMainWide\s*\{/,
  "shared PageMain should not introduce a route-wide canvas dimension",
);
assert.doesNotMatch(
  appUiCss,
  /--app-shell-content-max|scrollbar-gutter:\s*stable both-edges/,
  "standard Invoice width should not require a wider shell token or scrollbar compensation",
);
assert.match(
  appUiCss,
  /\.routeCanvas\s*\{[^}]*overflow-y:\s*auto;[^}]*scrollbar-gutter:\s*stable;/s,
  "Protected routes should reserve one scrollbar gutter so their centered content does not shift",
);
assert.match(
  siteCss,
  /\.app-invoice-main\s*\{[^}]*min-width:\s*0;[^}]*width:\s*100%;/s,
  "Invoice section should stay within the standard protected-page canvas",
);
assert.match(
  siteCss,
  /\.app-invoice-main \.invoice-layout\s*\{[^}]*width:\s*100%;[^}]*grid-template-columns:\s*minmax\(360px,\s*430px\) minmax\(0,\s*1fr\);[^}]*gap:\s*28px;/s,
  "Invoice form and preview should share the standard protected-page width",
);
assert.match(
  routeLoadingCss,
  /\.invoiceLayout\s*\{[^}]*display:\s*grid;[^}]*width:\s*100%;[^}]*grid-template-columns:\s*minmax\(360px,\s*430px\) minmax\(0,\s*1fr\);[^}]*gap:\s*28px;/s,
  "Invoice loading workspace should use the same standard width",
);
assert.match(
  invoicePage,
  /<PageMain>/,
  "Invoice heading should stay inside the standard protected-page canvas",
);
assert.match(
  invoicePage,
  /<PageMain>\s*<PageHeader[\s\S]*?route="invoice"[\s\S]*?eyebrow="Invoice"[\s\S]*?title="Buat invoice\."[\s\S]*?description="Pilih murid dan periode untuk menyiapkan invoice\."[\s\S]*?actions=/,
  "Invoice should use the shared PageHeader as the first PageMain child",
);
assert.match(
  invoicePage,
  /actions=\{\(\s*<Button[\s\S]*?variant="secondary"[\s\S]*?size="compact"[\s\S]*?>[\s\S]*?Unduh PDF[\s\S]*?<\/Button>\s*\)\}/,
  "Invoice header export should use the shared secondary compact action treatment",
);
assert.match(
  rekapPage,
  /leadingIcon=\{<FilePdf size=\{18\} aria-hidden="true" \/>\}[\s\S]*?>\s*Unduh PDF\s*<\/Button>/,
  "Rekap PDF action should define the shared export icon geometry",
);
assert.match(
  invoicePage,
  /leadingIcon=\{<FilePdf size=\{18\} aria-hidden="true" \/>\}[\s\S]*?>\s*Unduh PDF\s*<\/Button>/,
  "Invoice PDF action should match the Rekap icon position and size",
);
assert.doesNotMatch(
  invoiceHeaderAction,
  /trailingIcon=/,
  "Invoice PDF action should not keep the legacy trailing download icon",
);
assert.match(
  appUiCss,
  /\.pageHeader\s*\{[^}]*min-height:\s*86px;/s,
  "Shared page headers should reserve the same desktop height",
);
assert.match(
  routeLoadingCss,
  /\.loadingPageHeader\s*\{[^}]*min-height:\s*86px;/s,
  "Loading headers should reserve the same height as loaded headers",
);
assert.match(
  appUiCss,
  /\.recapDecoration,\s*\.invoiceDecoration\s*\{[^}]*top:\s*110px;[^}]*right:\s*max\(var\(--space-8\),\s*calc\(\(100vw - 1200px\) \/ 2 - 80px\)\);/s,
  "Rekap and Invoice decorations should share one fixed anchor",
);
assert.match(
  invoicePage,
  /<\/PageHeader>|<PageHeader[\s\S]*?\/>[\s\S]*?<section[\s\S]*?aria-label="Editor invoice"/,
  "Invoice editor should be the section after the shared page header",
);
assert.doesNotMatch(
  invoicePage,
  /app-invoice-heading|inv-export-top/,
  "Invoice should not render the legacy custom header",
);
assert.doesNotMatch(
  siteCss,
  /\.app-invoice-heading|\.inv-export-top/,
  "legacy Invoice header selectors should be removed",
);
assert.match(
  appUiCss,
  /@media \(max-width:\s*1199px\)[\s\S]*?\.pageHeader\.toneInvoice \.pageHeaderActions\s*\{\s*display:\s*none;/,
  "Invoice shared header action should be hidden on tablet and mobile",
);
assert.match(
  invoiceLoading,
  /<PageMain>\s*<LoadingPageHeader[^>]*actions=\{1\}[^>]*\/>\s*<div className=\{styles\.invoiceLayout\}>/,
  "Invoice loading should preserve the shared header and workspace structure",
);
assert.match(
  invoicePage,
  /const \[zoom, setZoom\] = useState\(75\);/,
  "Invoice desktop preview should start at 75% inside the standard page canvas",
);

console.log("Invoice layout contract passed.");
