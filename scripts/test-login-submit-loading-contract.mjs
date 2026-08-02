import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const componentPath = "app/login/login-submit-button.tsx";
const component = existsSync(componentPath) ? readFileSync(componentPath, "utf8") : "";
const page = readFileSync("app/login/page.tsx", "utf8");
const buttonPrimitive = readFileSync("components/ui/button-primitive.tsx", "utf8");

assert.match(component, /^"use client";/m, "submit button must be a Client Component");
assert.match(component, /useFormStatus/, "submit button must read its parent form status");
assert.match(component, /loading=\{pending\}/, "pending state must drive MarketingButton loading");
assert.match(component, /loadingLabel="Mengirim link\.\.\."/, "loading label must explain the request");
assert.match(page, /<LoginSubmitButton\s*\/>/, "login form must render LoginSubmitButton");
assert.doesNotMatch(page, /<MarketingButton/, "login page must not bypass pending-aware submit button");
assert.match(
  buttonPrimitive,
  /disabled=\{buttonProps\.disabled \|\| loading\}/,
  "loading state must disable the native submit button",
);
assert.match(
  buttonPrimitive,
  /aria-busy=\{loading \|\| undefined\}/,
  "loading state must expose the pending request to assistive technology",
);

console.log("login submit loading contract passed");
