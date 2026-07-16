import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { safeNextPath } from "../lib/auth/safe-next.ts";

assert.equal(safeNextPath("/checkout?package=plus_12m"), "/checkout?package=plus_12m");
assert.equal(safeNextPath("/pembayaran/test-id"), "/pembayaran/test-id");
assert.equal(safeNextPath("/app/invoice"), "/app/invoice");
assert.equal(safeNextPath("//evil.example"), "/app");
assert.equal(safeNextPath("https://evil.example"), "/app");
assert.equal(safeNextPath("/terms"), "/app");

const actions = await readFile(new URL("../app/login/actions.ts", import.meta.url), "utf8");
const login = await readFile(new URL("../app/login/page.tsx", import.meta.url), "utf8");
const sent = await readFile(new URL("../app/login/sent/page.tsx", import.meta.url), "utf8");
const callback = await readFile(new URL("../app/auth/callback/route.ts", import.meta.url), "utf8");

assert.match(actions, /safeNextPath\(formData\.get\("next"\)\)/);
assert.match(actions, /emailRedirectTo: `\$\{origin\}\/auth\/callback\?next=\$\{encodeURIComponent\(next\)\}`/);
assert.match(login, /<input type="hidden" name="next" value=\{next\} \/>/);
assert.match(sent, /<input type="hidden" name="next" value=\{next\} \/>/);
assert.match(callback, /const next = safeNextPath\(searchParams\.get\("next"\)\)/);

console.log("billing auth return contract valid");
