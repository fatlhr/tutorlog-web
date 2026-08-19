import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Keep lint scoped to this checkout instead of linked worktrees and build output.
  globalIgnores([
    ".next/**",
    ".open-next/**",
    ".worktrees/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "design/**",
  ]),
]);

export default eslintConfig;
