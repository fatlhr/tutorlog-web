import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const footerSource = await readFile(path.join(repoRoot, "components/ui/footer.tsx"), "utf8");
const footerStyles = await readFile(path.join(repoRoot, "components/ui/footer.module.css"), "utf8");
const appShellFooterSource = await readFile(
  path.join(repoRoot, "components/app-ui/app-shell-footer.tsx"),
  "utf8",
);

assert.match(
  footerSource,
  /context === "public" \|\| context === "protected"/,
  "Partner footer column must render in both public and protected contexts",
);
assert.match(
  footerSource,
  /href="https:\/\/tutorplis\.id"/,
  "Partner footer column must link to TutorPlis",
);
assert.match(
  appShellFooterSource,
  /<AppFooter context="protected" \/>/,
  "The /app shell must use the protected footer context",
);
assert.match(
  footerStyles,
  /\.footer\[data-footer="public"\],\s*\.footer\[data-footer="protected"\]\s*\{\s*grid-template-columns: repeat\(4, 1fr\);/s,
  "Public and protected desktop footers must reserve a Partner column",
);

console.log("Footer Partner contract passed");
