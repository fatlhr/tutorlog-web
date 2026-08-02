# Login Submit Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menampilkan pending state pada tombol login dan mencegah submit magic link ganda.

**Architecture:** Tambahkan Client Component kecil di dalam form login yang membaca `useFormStatus()`. Pending state diteruskan ke API `loading` milik `MarketingButton`, yang sudah menangani spinner, disabled state, dan `aria-busy`.

**Tech Stack:** Next.js 16 Server Actions, React 19, TypeScript, Node.js focused contract.

## Global Constraints

- Label loading harus tepat `Mengirim link...`.
- Hanya tombol submit yang dinonaktifkan selama pending; field email tidak dikunci.
- Jangan mengubah Server Action, validasi email, redirect, atau konfigurasi Supabase.
- Jangan menambah dependency.

---

### Task 1: Pending-aware Login Submit Button

**Files:**
- Create: `app/login/login-submit-button.tsx`
- Modify: `app/login/page.tsx`
- Create: `scripts/test-login-submit-loading-contract.mjs`

**Interfaces:**
- Consumes: `MarketingButton` dengan props `loading?: boolean` dan `loadingLabel?: string`; pending state dari `useFormStatus()`.
- Produces: `LoginSubmitButton(): JSX.Element`, dipakai sebagai child dari form `sendMagicLink`.

- [x] **Step 1: Write the failing focused contract**

```js
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const componentPath = "app/login/login-submit-button.tsx";
const component = existsSync(componentPath) ? readFileSync(componentPath, "utf8") : "";
const page = readFileSync("app/login/page.tsx", "utf8");

assert.match(component, /^"use client";/m, "submit button must be a Client Component");
assert.match(component, /useFormStatus/, "submit button must read its parent form status");
assert.match(component, /loading=\{pending\}/, "pending state must drive MarketingButton loading");
assert.match(component, /loadingLabel="Mengirim link\.\.\."/, "loading label must explain the request");
assert.match(page, /<LoginSubmitButton\s*\/>/, "login form must render LoginSubmitButton");
assert.doesNotMatch(page, /<MarketingButton/, "login page must not bypass pending-aware submit button");

console.log("login submit loading contract passed");
```

- [x] **Step 2: Run the contract and verify RED**

Run: `rtk node scripts/test-login-submit-loading-contract.mjs`

Expected: FAIL with `submit button must be a Client Component` because the component does not exist yet.

- [x] **Step 3: Add the pending-aware component**

```tsx
"use client";

import { PaperPlaneTilt } from "@phosphor-icons/react";
import { useFormStatus } from "react-dom";
import { MarketingButton } from "@/components/public-ui/marketing-button";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <MarketingButton
      type="submit"
      size="large"
      block
      leadingIcon={<PaperPlaneTilt size={18} weight="fill" />}
      loading={pending}
      loadingLabel="Mengirim link..."
    >
      Kirim link masuk
    </MarketingButton>
  );
}
```

- [x] **Step 4: Wire it into the login form**

Remove the direct `PaperPlaneTilt` and `MarketingButton` imports from `app/login/page.tsx`, import `LoginSubmitButton`, then replace the existing submit button with:

```tsx
<LoginSubmitButton />
```

- [x] **Step 5: Run focused verification and verify GREEN**

Run: `rtk node scripts/test-login-submit-loading-contract.mjs`

Expected: PASS with `login submit loading contract passed`.

Run: `rtk git diff --check`

Expected: exit code 0 with no output.

- [x] **Step 6: Review scope**

Run: `rtk git diff -- app/login/page.tsx app/login/login-submit-button.tsx scripts/test-login-submit-loading-contract.mjs`

Expected: only the submit component, its focused contract, and the login page wiring change. Do not commit application code without explicit user approval.
