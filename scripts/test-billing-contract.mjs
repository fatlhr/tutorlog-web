import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const contractsUrl = new URL("../lib/billing/contracts.ts", import.meta.url);
const errorsUrl = new URL("../lib/billing/errors.ts", import.meta.url);
const [contractsSource, errorsSource] = await Promise.all([
  readFile(contractsUrl, "utf8"),
  readFile(errorsUrl, "utf8"),
]);

assert.match(contractsSource, /from ["']\.\/errors["']/);
assert.doesNotMatch(contractsSource, /from ["']\.\/errors\.ts["']/);

function transpile(source, fileName) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName,
  }).outputText;
}

function toDataUrl(source) {
  return `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
}

const compiledErrorsUrl = toDataUrl(transpile(errorsSource, "errors.ts"));
const compiledContracts = transpile(contractsSource, "contracts.ts").replace(
  'from "./errors";',
  `from "${compiledErrorsUrl}";`,
);

const contracts = await import(toDataUrl(compiledContracts));
const { BillingError } = await import(compiledErrorsUrl);
const {
  PACKAGE_CODES,
  PAYMENT_STATES,
  assertPaymentTransition,
  isPackageCode,
} = contracts;

assert.deepEqual(PACKAGE_CODES, ["free", "plus_30d", "plus_12m", "plus_lifetime"]);
assert.equal(isPackageCode("plus_12m"), true);
assert.equal(isPackageCode("founding_lifetime"), false);
assert.ok(PAYMENT_STATES.includes("superseded"));
assert.doesNotThrow(() => assertPaymentTransition("pending", "paid"));
assert.doesNotThrow(() => assertPaymentTransition("created", "superseded"));
assert.doesNotThrow(() => assertPaymentTransition("superseded", "paid"));
assert.throws(() => assertPaymentTransition("paid", "pending"), BillingError);

console.log("billing contract valid");
