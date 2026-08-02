import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

function evaluateTypeScript(source, imports = {}) {
  const { outputText, diagnostics = [] } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    reportDiagnostics: true,
  });

  assert.equal(diagnostics.length, 0, "TypeScript fixture should transpile without diagnostics");

  const fixtureModule = { exports: {} };
  const requireFixture = (specifier) => {
    assert.ok(specifier in imports, `Unexpected fixture import: ${specifier}`);
    return imports[specifier];
  };

  Function("require", "module", "exports", outputText)(
    requireFixture,
    fixtureModule,
    fixtureModule.exports,
  );
  return fixtureModule.exports;
}

const invoiceDataSource = await readFile(
  new URL("../components/invoice/invoice-data.ts", import.meta.url),
  "utf8",
);
const productEvidenceSource = await readFile(
  new URL("../components/public-ui/product-evidence/product-evidence-data.ts", import.meta.url),
  "utf8",
);
const invoiceDataModule = evaluateTypeScript(invoiceDataSource);
const {
  publicProductInvoiceData,
  publicRecapEvidence,
  publicSessionEvidence,
} = evaluateTypeScript(productEvidenceSource, {
  "@/components/invoice/invoice-data": invoiceDataModule,
});

assert.equal(publicProductInvoiceData.items.length, 3);
assert.deepEqual(publicSessionEvidence, {
  studentName: "Bintang",
  date: "03 Jun",
  timeRange: "18.00 - 19.30",
  duration: "90 menit",
  amount: 180000,
  status: "Tersimpan",
});
assert.deepEqual(publicRecapEvidence, {
  period: "Juni 2026",
  sessionCount: 3,
  durationLabel: "5 jam",
  amount: 560000,
});
assert.equal(
  publicProductInvoiceData.items.reduce((sum, item) => sum + item.amount, 0),
  publicRecapEvidence.amount,
);

const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const features = await readFile(new URL("../app/fitur/page.tsx", import.meta.url), "utf8");
const guide = await readFile(new URL("../app/panduan/page.tsx", import.meta.url), "utf8");
const pricing = await readFile(new URL("../app/harga/page.tsx", import.meta.url), "utf8");
const workflow = await readFile(
  new URL("../components/public-ui/product-evidence/workflow-canvas.tsx", import.meta.url),
  "utf8",
);
const publicMotion = await readFile(new URL("../components/PublicMotion.tsx", import.meta.url), "utf8");
const siteCss = await readFile(new URL("../css/site.css", import.meta.url), "utf8");
const responsiveSweep = await readFile(
  new URL("../tests/responsive-sweep.spec.ts", import.meta.url),
  "utf8",
);

function countJsxTag(source, tag) {
  return (source.match(new RegExp(`<${tag}(?:\\s|/|>)`, "g")) ?? []).length;
}

function collectAttributeValues(source, attribute) {
  return [...source.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g"))]
    .map((match) => match[1]);
}

assert.match(home, /<WorkflowCanvas\s*\/>/);
assert.doesNotMatch(home, /proofStories/);
assert.equal(countJsxTag(home, "PublicProductProof"), 1, "homepage should budget exactly one full product proof");
assert.equal(countJsxTag(home, "WorkflowCanvas"), 1, "homepage should render exactly one lower workflow");
assert.ok(
  home.indexOf("<PublicProductProof") < home.indexOf("<WorkflowCanvas"),
  "homepage full proof should remain in the hero before the lower workflow",
);
assert.equal(
  (home.match(/aria-label="Alur produk TutorLog"/g) ?? []).length
    + (workflow.match(/aria-label="Alur produk TutorLog"/g) ?? []).length,
  1,
  "the workflow should expose one named region",
);
assert.deepEqual(
  collectAttributeValues(features, "data-evidence-group"),
  ["mobile-workspace", "cross-device-recap", "invoice-output"],
  "features should expose the three approved evidence groups in order",
);
assert.deepEqual(
  [...features.matchAll(/<PublicProductProof\s+id="([^"]+)"/g)].map((match) => match[1]),
  ["mobile", "history", "recap", "invoice"],
  "features should own exactly the four approved full product proofs",
);
assert.doesNotMatch(guide, /PublicProductProof/);
assert.equal(countJsxTag(guide, "PublicProductProof"), 0, "guide should contain zero full product proofs");
assert.match(guide, /<MobileGuideEvidence\s*\/>/);
assert.match(guide, /<WebGuideEvidence\s*\/>/);
assert.doesNotMatch(pricing, /PublicProductProof/);
assert.equal(countJsxTag(pricing, "PublicProductProof"), 0, "pricing should contain zero full product proofs");
assert.doesNotMatch(publicMotion, /\.tl-landing-feature-rows \.tls-rail-surface/);
assert.doesNotMatch(siteCss, /tl-landing-proof-(?:story|copy)/);
assert.doesNotMatch(siteCss, /\.tl-landing-feature-rows \.tls-rail-proof/);
assert.doesNotMatch(responsiveSweep, /\.tl-landing-feature-rows \[data-rail-proof\]/);

console.log("public product evidence contract valid");
