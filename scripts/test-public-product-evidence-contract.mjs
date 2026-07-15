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

  const module = { exports: {} };
  const requireFixture = (specifier) => {
    assert.ok(specifier in imports, `Unexpected fixture import: ${specifier}`);
    return imports[specifier];
  };

  Function("require", "module", "exports", outputText)(requireFixture, module, module.exports);
  return module.exports;
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

assert.equal(publicProductInvoiceData.no, "INV-2026-06-014");
assert.equal(publicProductInvoiceData.items.length, 3);
assert.deepEqual(publicSessionEvidence, {
  date: "03 Jun",
  description: "Matematika - Trigonometri",
  hours: 1.5,
  amount: 180000,
  status: "Selesai",
});
assert.deepEqual(publicRecapEvidence, {
  period: "Juni 2026",
  sessionCount: 3,
  hours: 5,
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

assert.match(home, /<WorkflowCanvas\s*\/>/);
assert.doesNotMatch(home, /proofStories/);
assert.equal(
  (home.match(/aria-label="Alur produk TutorLog"/g) ?? []).length
    + (workflow.match(/aria-label="Alur produk TutorLog"/g) ?? []).length,
  1,
  "the workflow should expose one named region",
);
assert.equal((features.match(/data-evidence-group=/g) ?? []).length, 3);
assert.doesNotMatch(guide, /PublicProductProof/);
assert.match(guide, /<MobileGuideEvidence\s*\/>/);
assert.match(guide, /<WebGuideEvidence\s*\/>/);
assert.doesNotMatch(pricing, /PublicProductProof/);
assert.doesNotMatch(publicMotion, /\.tl-landing-feature-rows \.tls-rail-surface/);
assert.doesNotMatch(siteCss, /tl-landing-proof-(?:story|copy)/);
assert.doesNotMatch(siteCss, /\.tl-landing-feature-rows \.tls-rail-proof/);
assert.doesNotMatch(responsiveSweep, /\.tl-landing-feature-rows \[data-rail-proof\]/);

console.log("public product evidence contract valid");
