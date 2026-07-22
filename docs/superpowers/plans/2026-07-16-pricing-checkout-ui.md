# TutorLog Pricing and Checkout UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and connect TutorLog pricing, login return, checkout, payment status, paywall, entitlement presentation, latest-payment, and export-authorization UI without provider-specific logic in browser code.

**Architecture:** Presentational billing components consume shared DTOs and pure view models. They are built against fake fixtures, reviewed independently, then wired to provider-neutral services from the Integration/Data plan. Existing protected-app primitives and browser PDF generators remain in place.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TutorLog public and protected UI primitives, CSS Modules and existing tokens, Phosphor icons, Playwright, Node `assert` contracts.

## Global Constraints

- This plan implements the UI/Product workstream from `docs/superpowers/specs/2026-07-16-pricing-paywall-payment-design.md`.
- Integration/Data work is owned by `docs/superpowers/plans/2026-07-16-pricing-payment-integration.md`.
- Task U1 starts only after Integration Task I1 freezes `lib/billing/contracts.ts`.
- Use fixtures until the relevant Integration endpoint passes its focused contract.
- Use `rtk` for every shell command.
- Create `feat/pricing-checkout-ui` from `develop` only after the reviewed Integration branch has been approved and synchronized into `develop`. Do not use a worktree unless explicitly requested.
- Every code commit is a pause point requiring explicit user approval. Do not push, merge, create a PR, deploy, or modify production state without separate approval.
- Do not run tests, responsive sweeps, accessibility checks, visual regression, or PDF export tests unless the user approves that checkpoint.
- Preserve session, student, recap-filter, invoice-field, invoice-calculation, invoice-template, and browser PDF behavior.
- Preserve protected-app tokens and primitives. Checkout and status use product UI, not landing-page composition.
- `/harga` stays public. `/checkout` and `/pembayaran/<purchase-id>` require authentication.
- Plus 12 Bulan is featured. Plus Selamanya has no scarcity counter, buyer cap, or time limit.
- UI never hardcodes provider fees, derives entitlement expiry, trusts a return query, or imports provider-specific types.
- Paywall dialogs open only after locked actions. Dashboard upgrade messaging stays passive.
- Mobile code is outside this repository. This plan changes only the documented web destination contract.
- Legal copy waits for verified business identity, support, provider, and refund evidence.

---

## Subagent-Driven Execution Protocol

- UI/Product is executed as its own workstream on `feat/pricing-checkout-ui`; Integration/Data implementation remains outside this branch.
- Start the UI workstream only from a base that contains the reviewed Integration work through `I9`. Starting that branch or synchronizing Integration requires the repository's normal approval.
- Dispatch one fresh implementer subagent for each task `U1` through `U10`; never dispatch two implementers concurrently.
- Each implementer receives only its extracted task brief, the interfaces it consumes, the binding Global Constraints, and the required report path.
- Each code task follows `superpowers:test-driven-development` when its approved verification scope permits tests.
- After every task, dispatch a separate task reviewer. The reviewer must return both a spec-compliance verdict and a code-quality verdict.
- Critical and Important findings go back to a fix subagent and must pass re-review before the next UI task begins. Record Minor findings in the SDD progress ledger for the final reviewer.
- Cross-workstream gates remain binding: reviewed `I1` precedes `U1`, reviewed `I3` precedes `U7`, and reviewed `I5` precedes `U8`.
- After `U10`, dispatch a broad whole-branch reviewer using `superpowers:requesting-code-review`. UI is not ready for merge or rollout while Critical or Important findings remain open.
- Keep durable execution state in `.superpowers/sdd/progress.md` only while this workflow is active, then remove the temporary ledger before final handoff unless the user asks to retain it.
- Repository approval boundaries still govern the workflow. Worktree creation and task-scoped code commits require explicit approval before execution starts.

---

## File Responsibility Map

- `lib/billing/ui-model.ts`: currency, duration, access, payment-state, and CTA copy.
- `lib/billing/fixtures.ts`: fake DTOs for component work and tests.
- `lib/billing/client.ts`: provider-neutral browser API client.
- `lib/billing/analytics-client.ts`: allowlisted fire-and-forget events.
- `lib/auth/safe-next.ts`: validated local magic-link return paths.
- `components/billing/pricing-catalog.tsx` and `pricing.module.css`: public package comparison.
- `components/billing/checkout-panel.tsx` and `checkout.module.css`: method, quote, terms, and handoff.
- `components/billing/payment-status-panel.tsx` and `payment-status.module.css`: pending through terminal states.
- `components/billing/access-summary-card.tsx`, `latest-payment-card.tsx`, and `billing-surfaces.module.css`: protected billing summaries.
- `app/harga/page.tsx`: public catalog route.
- `app/checkout/page.tsx`: authenticated checkout route.
- `app/pembayaran/[purchaseId]/page.tsx`: authenticated payment status route.
- `components/ProfileContent.tsx`, `components/AppTopBar.tsx`, `components/HomeUpgradePrompt.tsx`, and `components/PaywallDialog.tsx`: normalized access and paywall surfaces.
- `components/RekapContent.tsx` and `app/app/invoice/page.tsx`: server export authorization before existing local generation.
- `app/login/actions.ts`, login pages, auth callback, and `proxy.ts`: safe checkout return and protected routes.
- `components/content/terms-content.tsx` and `kontak-content.tsx`: verified payment and refund copy.
- `scripts/test-billing-ui-contract.mjs`, `scripts/test-billing-auth-return-contract.mjs`, and `scripts/test-export-authorization-contract.mjs`: focused development contracts.
- `tests/billing-ui.spec.ts`: fixture-backed browser flow.

## Dependency Graph

```text
Integration I1 shared DTOs
  -> U1 view models and fixtures
  -> U2 pricing component
  -> U3 safe login return
  -> U4 checkout component
  -> U5 payment status component
  -> U6 protected billing surfaces

Integration I3 export authorization -> U7 export wiring
Integration I5 real APIs -> U8 route wiring
Integration I0 verified legal inputs -> U9 legal copy
U1-U9 -> U10 approved QA and handoff
```

U2 through U6 run against fixtures even though the reviewed Integration implementation is already present in the branch base. U7 and U8 remain explicit contract gates for export authorization and real API wiring.

---

### Task U1: Create View Models, Fixtures, and Browser Client

**Files:**
- Create: `lib/billing/ui-model.ts`
- Create: `lib/billing/fixtures.ts`
- Create: `lib/billing/client.ts`
- Create: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Consumes: shared billing DTOs from Integration I1.
- Produces: `formatIdr`, `productPeriodLabel`, `annualSavings`, `accessLabel`, `paymentStatusCopy`, `billingFixtures`, and browser client methods.

- [ ] **Step 1: Write the failing pure contract**

```js
import assert from "node:assert/strict";
import { accessLabel, annualSavings, formatIdr, paymentStatusCopy, productPeriodLabel } from "../lib/billing/ui-model.ts";
import { billingFixtures } from "../lib/billing/fixtures.ts";

assert.equal(formatIdr(149000), "Rp149.000");
assert.equal(productPeriodLabel(billingFixtures.products[1]), "30 hari");
assert.equal(productPeriodLabel(billingFixtures.products[2]), "12 bulan");
assert.equal(productPeriodLabel(billingFixtures.products[3]), "selamanya");
assert.equal(annualSavings(billingFixtures.products), 79000);
assert.equal(accessLabel(billingFixtures.access.lifetime), "Plus Selamanya");
assert.equal(paymentStatusCopy(billingFixtures.payments.verifying).title, "Memverifikasi pembayaran");
assert.equal(paymentStatusCopy(billingFixtures.payments.paid).title, "Plus sudah aktif");
console.log("billing UI contract valid");
```

- [ ] **Step 2: Run after approval and observe missing-module failure**

```bash
rtk node scripts/test-billing-ui-contract.mjs
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement pure UI models**

`formatIdr` uses `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })` and normalizes the space after `Rp`. `annualSavings()` derives `12 * plus_30d.amount - plus_12m.amount` from the active catalog. `paymentStatusCopy()` returns `{ title, body, tone }` for every normalized state and never displays provider status text.

- [ ] **Step 4: Create complete fake fixtures**

Include four products, QRIS and VA quotes, Free/active/expired/lifetime access, pending/verifying/paid/expired/failed/canceled/duplicate-review payment states, a latest payment, and allowed/blocked exports. Use identifiers such as `PAY-TEST-001`; never use real account or payment data.

- [ ] **Step 5: Implement the provider-neutral browser client**

```ts
export async function getProducts(): Promise<ProductSummary[]>;
export async function getCheckoutQuote(packageCode: PackageCode, method: PaymentMethod): Promise<CheckoutQuote>;
export async function createOrResumePurchase(packageCode: PackageCode, method: PaymentMethod): Promise<PurchaseSummary>;
export async function getPurchaseStatus(purchaseId: string): Promise<PurchaseSummary>;
export async function cancelPendingPayment(paymentId: string): Promise<PurchaseSummary>;
export async function authorizeExport(feature: "recap_pdf" | "recap_csv" | "invoice_pdf"): Promise<ExportAuthorizationResult>;
```

Use same-origin `fetch`, content-type checks, and normalized `BillingErrorCode`. Do not return raw server errors.

- [ ] **Step 6: Run the focused contract and review**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk git diff --check
```

Expected: PASS with `billing UI contract valid`.

---

### Task U2: Build the Pricing Catalog Against Fixtures

**Files:**
- Create: `components/billing/pricing-catalog.tsx`
- Create: `components/billing/pricing.module.css`
- Modify: `scripts/test-billing-ui-contract.mjs`
- Do not modify yet: `app/harga/page.tsx`

**Interfaces:**
- Consumes: `ProductSummary[]`, `formatIdr`, `productPeriodLabel`, and `authenticated`.
- Produces: `PricingCatalog({ products, authenticated })` with safe package actions.

- [ ] **Step 1: Add failing pricing assertions**

Assert all four package codes, featured annual package, catalog-derived Rp79.000 saving, no Lynk URL, no scarcity copy, no crossed fake price, no “berhenti kapan saja”, and action URLs derived from package code.

- [ ] **Step 2: Implement package actions**

```ts
const checkoutPath = `/checkout?package=${encodeURIComponent(product.code)}`;
const href = authenticated
  ? checkoutPath
  : `/login?next=${encodeURIComponent(checkoutPath)}`;
```

Free routes to `/login` or `/app`. Lifetime copy may say its price can change for future buyers, without urgency or scarcity language.

- [ ] **Step 3: Implement layout inside the existing public system**

Reuse `MarketingButton`, `--tl-*` tokens, typography, and the ledger concept. Keep one-column mobile layout. Mark Plus 12 Bulan with a visible `Paling hemat` label that does not depend on motion.

- [ ] **Step 4: Run focused contract**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk git diff --check
```

Expected: PASS. No visual claim is made before route wiring.

---

### Task U3: Preserve Safe Checkout Return Through Magic-Link Login

**Files:**
- Create: `lib/auth/safe-next.ts`
- Create: `scripts/test-billing-auth-return-contract.mjs`
- Modify: `app/login/actions.ts`
- Modify: `app/login/page.tsx`
- Modify: `app/login/sent/page.tsx`
- Modify: `app/auth/callback/route.ts`

**Interfaces:**
- Consumes: requested local `next` value.
- Produces: `safeNextPath(value)` and a magic link that returns only to allowed TutorLog routes.

- [ ] **Step 1: Write failing safe-return tests**

```js
import assert from "node:assert/strict";
import { safeNextPath } from "../lib/auth/safe-next.ts";

assert.equal(safeNextPath("/checkout?package=plus_12m"), "/checkout?package=plus_12m");
assert.equal(safeNextPath("/pembayaran/test-id"), "/pembayaran/test-id");
assert.equal(safeNextPath("/app/invoice"), "/app/invoice");
assert.equal(safeNextPath("//evil.example"), "/app");
assert.equal(safeNextPath("https://evil.example"), "/app");
assert.equal(safeNextPath("/terms"), "/app");
console.log("billing auth return contract valid");
```

- [ ] **Step 2: Implement the allowlist**

Allow exact `/app` and `/checkout`, plus descendants of `/app/` and `/pembayaran/`. Reject absolute URLs, protocol-relative URLs, and unrelated paths.

- [ ] **Step 3: Carry the normalized path through every auth surface**

Read `next`, normalize it, add it as a hidden form value, include it in `emailRedirectTo`, preserve it on validation/send errors, preserve it in resend, redirect an already-authenticated visitor to it, and normalize it again in the callback before combining with `origin`.

- [ ] **Step 4: Run approved contracts**

```bash
rtk node scripts/test-billing-auth-return-contract.mjs
rtk node scripts/test-public-product-evidence-contract.mjs
rtk git diff --check
```

Expected: safe-return contract passes and the existing public contract remains passing.

---

### Task U4: Build Checkout Against Fixtures

**Files:**
- Create: `components/billing/checkout-panel.tsx`
- Create: `components/billing/checkout.module.css`
- Modify: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Consumes: product, initial QRIS quote, quote client, and create-or-resume client.
- Produces: accessible method selection, exact quote, terms acknowledgement, and redirect handoff.

- [ ] **Step 1: Add failing checkout assertions**

Assert QRIS default, VA secondary, separate base/fee/total rows, no-auto-renew copy, required terms checkbox, disabled action while quote changes, normalized errors, and no provider-specific fields.

- [ ] **Step 2: Implement quote switching**

Use existing protected controls. Call `getCheckoutQuote()` when the method changes. Ignore stale responses with a monotonically increasing request ID. Disable payment creation until the selected method and loaded quote match.

- [ ] **Step 3: Implement payment creation conditions**

Enable the primary action only when the quote is loaded, method matches, terms are acknowledged, product remains available, and no request is pending. Navigate to the safe provider redirect URL for a new attempt or `/pembayaran/<purchase-id>` for a resumed pending attempt.

- [ ] **Step 4: Implement normalized failure states**

Cover unavailable package, changed price, active lifetime, provider unavailable, request timeout, and invalid response. Never display provider error bodies.

- [ ] **Step 5: Run focused contract**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk git diff --check
```

Expected: PASS without a live route or provider.

---

### Task U5: Build Payment Status and Recovery Against Fixtures

**Files:**
- Create: `components/billing/payment-status-panel.tsx`
- Create: `components/billing/payment-status.module.css`
- Modify: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Consumes: initial purchase, status client, and cancel client.
- Produces: polling, ten-minute verification window, method replacement, and terminal-state actions.

- [ ] **Step 1: Add failing status assertions**

Assert every normalized state, `role="status"` for transitions, `role="alert"` for load failure, ten-minute cutoff, increasing polling delays, safe reference, no raw provider copy, and duplicate-review support messaging.

- [ ] **Step 2: Implement polling and cleanup**

```ts
const POLL_DELAYS_MS = [2000, 3000, 5000, 10000, 15000, 30000] as const;
const VERIFY_WINDOW_MS = 10 * 60 * 1000;
```

Clear timers on unmount. Stop after terminal state or ten minutes. Refresh once after browser visibility returns when the last check is stale.

- [ ] **Step 3: Implement state actions**

- Pending: instructions, expiry, refresh, and change method.
- Verifying: progress and safe reference.
- Paid: new access and `/app` action.
- Expired/failed/canceled: retry from checkout with package code.
- Duplicate review: Contact link containing safe reference only.
- Ten-minute delay: support path and manual refresh.

- [ ] **Step 4: Implement replacement handoff**

Confirm the user's intent, call `cancelPendingPayment`, and return to checkout. Explain that a payment completed on the old instrument will still be reviewed and honored.

- [ ] **Step 5: Run focused contract**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk git diff --check
```

Expected: PASS.

---

### Task U6: Build Access, Latest Payment, Dashboard, and Paywall Surfaces

**Files:**
- Create: `components/billing/access-summary-card.tsx`
- Create: `components/billing/latest-payment-card.tsx`
- Create: `components/billing/billing-surfaces.module.css`
- Modify: `components/ProfileContent.tsx`
- Modify: `components/AppTopBar.tsx`
- Modify: `components/HomeUpgradePrompt.tsx`
- Modify: `components/PaywallDialog.tsx`
- Modify: `app/app/layout.tsx`
- Modify: `app/app/profil/page.tsx`
- Modify: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Consumes: `AccessSummary` and `LatestPaymentSummary | null`.
- Produces: consistent Free, active-term, expired, and lifetime presentation.

- [ ] **Step 1: Add failing entitlement-surface assertions**

Assert Plus Selamanya, term expiry, renewal CTA for active term and expired users, no renewal CTA for lifetime, latest-payment fields, safe reference only, and `/harga` for upgrade actions.

- [ ] **Step 2: Replace top-bar booleans with normalized access**

Pass `access: AccessSummary` to `AppTopBar` and derive its compact label through `accessLabel()`. Preserve all dropdown, focus, Escape, outside-click, navigation, and logout behavior.

- [ ] **Step 3: Compose Profile billing cards**

Change `ProfileContent` props to:

```ts
access: AccessSummary;
latestPayment: LatestPaymentSummary | null;
```

Keep name editing and the existing mobile-app card unchanged. Replace only the access block and add latest payment below it.

- [ ] **Step 4: Preserve contextual paywall behavior**

Dashboard prompt stays passive. Paywall opens only through parent action, keeps existing Dialog accessibility, goes to `/harga`, and does not embed packages or direct checkout. Add an analytics surface identifier without changing behavior.

- [ ] **Step 5: Run focused contracts**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk node scripts/test-quota-access-contract.mjs
rtk git diff --check
```

Expected: focused contracts pass. Visual QA remains unverified.

---

### Task U7: Replace Export Check-Then-Record with Server Authorization

**Files:**
- Modify: `components/RekapContent.tsx`
- Modify: `app/app/invoice/page.tsx`
- Modify: `lib/data/quota.ts`
- Create: `scripts/test-export-authorization-contract.mjs`
- Modify: `scripts/test-invoice-export-contract.mjs`

**Interfaces:**
- Consumes: atomic `authorizeExport(feature)` from Integration I3.
- Produces: one server decision before each existing local file generation.

- [ ] **Step 1: Write failing export assertions**

Assert `recap_csv`, `recap_pdf`, and `invoice_pdf` authorization calls, contextual paywall on blocked result, and absence of post-download `record_feature_usage_event` calls.

- [ ] **Step 2: Update recap exports**

Set loading, await authorization, open paywall and stop when blocked, generate the existing file when allowed, remove the second usage call, and clear loading in `finally`.

- [ ] **Step 3: Update invoice export**

Keep form validation, `html2canvas`, JPEG quality, jsPDF A4 sizing, filename, templates, preview, and success toast unchanged. Use server authorization as authority. DOM access metadata may remain only for the initial lock icon and helper.

- [ ] **Step 4: Remove obsolete recording after both consumers migrate**

Delete `recordExportEvent()` and direct client `record_feature_usage_event` calls only when recap and invoice both use atomic authorization.

- [ ] **Step 5: Run approved focused checks**

```bash
rtk node scripts/test-export-authorization-contract.mjs
rtk node scripts/test-invoice-export-contract.mjs
rtk node scripts/test-quota-access-contract.mjs
rtk git diff --check
```

Expected: contracts pass while invoice rasterization assertions remain unchanged. This does not prove visual PDF output.

---

### Task U8: Wire Pricing, Checkout, Status, Protection, and Analytics

**Files:**
- Modify: `app/harga/page.tsx`
- Create: `app/checkout/page.tsx`
- Create: `app/checkout/loading.tsx`
- Create: `app/pembayaran/[purchaseId]/page.tsx`
- Create: `app/pembayaran/[purchaseId]/loading.tsx`
- Modify: `proxy.ts`
- Create: `lib/billing/analytics-client.ts`
- Modify: billing components from U2, U4, and U5
- Modify: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Consumes: real catalog, quote, purchase, status, cancel, access, and analytics services.
- Produces: complete public-price-to-protected-payment flow.

- [ ] **Step 1: Add failing route wiring assertions**

Assert no Lynk constant, package-code validation, opaque purchase ownership, protection for checkout and payment routes, existing loading primitives, and analytics allowlist.

- [ ] **Step 2: Wire `/harga` to server catalog service**

Do not make a loopback HTTP request. Determine authentication with Supabase server auth and render `PricingCatalog`. On catalog failure, show an honest public error instead of stale hardcoded prices.

- [ ] **Step 3: Create authenticated checkout route**

Validate package code. Redirect invalid, Free, unavailable, or lifetime-blocked selections to `/harga` with a safe reason. Fetch product and QRIS quote, then render `CheckoutPanel`.

- [ ] **Step 4: Create authenticated status route**

Load a safe user-owned purchase projection and use `notFound()` for missing or foreign IDs. Provider return query parameters may select initial verifying presentation but never change state.

- [ ] **Step 5: Extend proxy matching and preserve return path**

```ts
export const config = {
  matcher: ["/app/:path*", "/checkout", "/pembayaran/:path*"],
};
```

Redirect unauthenticated users to `/login?next=<encoded-path-and-query>`.

- [ ] **Step 6: Add fire-and-forget analytics**

Track pricing view, package selection, paywall open, checkout start, method selection, payment-state view, entitlement activation view, and export allow/block. Failure never blocks product flow.

- [ ] **Step 7: Run approved focused contracts**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk node scripts/test-billing-auth-return-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
rtk git diff --check
```

Expected: source contracts pass. Live behavior still requires approved local runtime and sandbox data.

---

### Task U9: Update Terms, Refund, Contact, and Pricing Guidance

**Files:**
- Modify: `components/content/terms-content.tsx`
- Modify: `components/content/kontak-content.tsx`
- Modify: `app/harga/page.tsx`
- Modify: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Consumes: verified legal operator, support, provider fee, fulfillment, and refund evidence.
- Produces: consistent package, no-auto-renew, fee, refund, dispute, and support copy.

- [ ] **Step 1: Enforce the legal-copy gate**

Require exact operator name, support email, refund path, dispute path, QRIS fee treatment, VA fee treatment, fulfillment wording, and provider-required disclosure. Stop and request missing information rather than inventing it.

- [ ] **Step 2: Add failing copy assertions**

Assert approved package names, no auto-renewal, seven-day limited refund reasons, QRIS absorbed, VA fee visible, and removal of Beli Putus, legacy prices, blanket no-refund, and “berhenti kapan saja”.

- [ ] **Step 3: Update public copy consistently**

Terms explain duration, activation after verification, fees, refund reasons, seven-day window, and support. Contact asks for safe payment reference and warns users not to send QR, VA, OTP, login link, or credentials. Pricing FAQ links to Terms and Contact for full conditions.

- [ ] **Step 4: Run focused contract**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk git diff --check
```

Expected: PASS with no legacy price or blanket refund text.

---

### Task U10: UI Verification and Integration Handoff

**Files:**
- Create: `tests/billing-ui.spec.ts`
- Modify only after route approval: responsive and accessibility route inventories
- Review: all files in this plan

**Interfaces:**
- Consumes: completed UI and stable Integration services.
- Produces: fixture-backed browser coverage, approved visual evidence, and rollout readiness report.

- [ ] **Step 1: Add fixture-backed browser scenarios**

Cover public packages, login return, QRIS default, VA fee, terms acknowledgement, pending resume, replacement, verifying, paid, expired retry, duplicate review, four Profile access states, and action-triggered paywall. Mock shared DTOs, never iPaymu responses.

- [ ] **Step 2: Ask the required pre-merge check question**

Ask the user whether to run or skip focused billing contracts, test suite, responsive sweep, accessibility, visual regression, and PDF export test.

- [ ] **Step 3: Run only approved checks**

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk node scripts/test-billing-auth-return-contract.mjs
rtk node scripts/test-export-authorization-contract.mjs
rtk node scripts/test-invoice-export-contract.mjs
rtk npx playwright test tests/billing-ui.spec.ts
rtk npm run test:responsive
rtk npm run test:a11y
rtk npm run test:visual-diff
rtk git diff --check
```

Report skipped checks as skipped.

- [ ] **Step 4: Perform only approved visual review**

Review `/harga`, `/checkout`, payment states, dashboard prompt, paywall, Profile, top bar, recap, and invoice at approved viewports. Keep temporary artifacts outside the repo or remove them before handoff.

- [ ] **Step 5: Review intentional files and stop before integration actions**

```bash
rtk git status --short
rtk git diff --check
```

Explain each changed file. Commit, push, PR, merge, migration, environment update, and deploy remain separate approvals.
