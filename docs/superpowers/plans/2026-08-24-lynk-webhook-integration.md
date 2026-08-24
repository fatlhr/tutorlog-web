# Lynk.id Webhook Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route TutorLog Plus checkout to the three published Lynk.id products and grant
Supabase entitlements from verified, idempotent `payment.received` webhooks.

**Architecture:** Lynk.id owns checkout and payment success. A Cloudflare-hosted Next.js
Route Handler verifies the signed JSON event, then a service-role Supabase RPC atomically
records the webhook, purchase, payment, and entitlement. Existing access projection and
export authorization remain unchanged.

**Tech Stack:** Next.js 16 App Router, TypeScript, Node `crypto`, Cloudflare Workers via
OpenNext, Supabase PostgreSQL/RLS, Node assertion contract tests.

## Global Constraints

- Implement application code on `feat/lynk-webhook-integration` created from `develop`.
- Preserve user-owned changes and stage explicit paths only.
- Code commits, push, PR, merge, database migration apply, Cloudflare secret changes,
  Lynk dashboard changes, real payments, and deploy each retain their repository approval gate.
- Do not enable entitlement processing before the captured Lynk payload is reviewed.
- Do not log or commit customer email, phone, signature, merchant key, or an unredacted payload.
- Do not create a TutorLog account from checkout data.
- Do not automatically activate multi-item, discounted, add-on, shipping, or amount-mismatch orders.
- Keep `apply_billing_paid_event` as the entitlement authority.
- Use `rtk` for shell commands.

---

## File map

### Create

- `lib/billing/providers/lynk-signature.ts` — signature extraction and verification.
- `lib/billing/providers/lynk-webhook.ts` — payload parsing and normalized success event.
- `lib/billing/lynk-products.ts` — outbound URLs and webhook product allowlist.
- `lib/billing/server/lynk-webhook.ts` — service-role processing orchestration.
- `app/api/webhooks/lynk/route.ts` — public HTTP boundary.
- `supabase/migrations/202608240001_lynk_webhook_flow.sql` — private inbox and atomic RPC.
- `scripts/test-lynk-signature-contract.mjs` — deterministic signature tests.
- `scripts/test-lynk-webhook-contract.mjs` — route/parser/source contract.
- `scripts/test-lynk-webhook-sql-contract.mjs` — migration and privilege contract.
- `scripts/test-lynk-checkout-links-contract.mjs` — package-to-product-link contract.
- `scripts/fixtures/lynk-payment-received.redacted.json` — reviewed payload fixture from Test URL.
- `docs/operations/lynk-webhook-runbook.md` — review, reconciliation, refund, and rollback procedure.

### Modify

- `lib/billing/contracts.ts` — accept provider `lynk` and external payment method for stored rows.
- `lib/billing/fallback-catalog.ts` — keep package amounts aligned with Lynk.
- `components/billing/pricing-catalog.tsx` — link paid CTAs to Lynk.
- `components/billing/checkout-panel.tsx` — remove it from new-sale navigation; retain only if
  historical rows still require the component.
- `components/billing/payment-status-panel.tsx` — stop polling for new Lynk purchases.
- `components/PaywallDialog.tsx` and other package CTAs found by contract search — use Lynk links.
- `components/content/privacy-content.tsx` and `components/content/terms-content.tsx` — disclose
  Lynk only after legal-copy approval.
- `TASKS.md` — check items only after their evidence exists.

### Retire after production proof

- Legacy provider adapter, signature module, callback route, sandbox script, provider factory,
  and unused internal payment-creation paths.

---

### Task 1: Freeze the Lynk signature contract

**Files:**

- Create: `lib/billing/providers/lynk-signature.ts`
- Create: `scripts/test-lynk-signature-contract.mjs`

**Interfaces:**

```ts
export interface LynkSignatureInput {
  grandTotal: number;
  refId: string;
  messageId: string;
}

export function createLynkSignature(
  input: LynkSignatureInput,
  merchantKey: string,
): string;

export function verifyLynkSignature(
  input: LynkSignatureInput,
  receivedSignature: string,
  merchantKey: string,
): boolean;
```

- [ ] **Step 1: Write a failing deterministic contract test**

Use fake values only. Build the expected lower-hex digest with Node `crypto` from:

```text
19000ref-test-001message-test-001merchant-test-key
```

Assert valid, modified amount, modified reference, malformed hex, and empty key behavior.

- [ ] **Step 2: Run the test and confirm the module is missing**

```bash
rtk node scripts/test-lynk-signature-contract.mjs
```

Expected: non-zero exit because `lynk-signature.ts` does not exist.

- [ ] **Step 3: Implement the verifier**

Use `createHash("sha256")`, lower-hex output, exact safe-integer validation for
`grandTotal`, and `timingSafeEqual` only after both hex strings decode to equal-length buffers.

- [ ] **Step 4: Run the focused test**

```bash
rtk node scripts/test-lynk-signature-contract.mjs
```

Expected: `Lynk signature contract passed`.

- [ ] **Step 5: Review and request commit approval**

Stage only the two files from this task after approval.

---

### Task 2: Add a capture-only webhook boundary

**Files:**

- Create: `lib/billing/providers/lynk-webhook.ts`
- Create: `app/api/webhooks/lynk/route.ts`
- Create: `scripts/test-lynk-webhook-contract.mjs`

**Interfaces:**

```ts
export type LynkWebhookMode = "disabled" | "capture" | "process";

export function getLynkWebhookMode(env: NodeJS.ProcessEnv): LynkWebhookMode;

export interface ParsedLynkSignatureFields {
  grandTotal: number;
  refId: string;
  messageId: string;
}

export function parseLynkSignatureFields(payload: unknown): ParsedLynkSignatureFields;
export function describeRedactedPayloadShape(payload: unknown): unknown;
```

- [ ] **Step 1: Write failing route/source contract assertions**

Assert that the route:

- Rejects bodies above 64 KiB.
- Returns `503` in disabled mode.
- Performs no Supabase import or entitlement call in capture mode.
- Never calls `console.log` with raw request body.
- Returns only a redacted payload shape in capture diagnostics.

- [ ] **Step 2: Implement capture mode**

Environment behavior:

```ts
const enabled = process.env.LYNK_WEBHOOK_ENABLED === "true";
const captureOnly = process.env.LYNK_WEBHOOK_CAPTURE_ONLY === "true";
```

If disabled, return `503`. In capture mode, parse JSON, emit only key names, array lengths,
primitive types, and approved non-PII enum values. Do not persist or grant anything.

- [ ] **Step 3: Run focused tests**

```bash
rtk node scripts/test-lynk-signature-contract.mjs
rtk node scripts/test-lynk-webhook-contract.mjs
```

Expected: both contracts pass.

- [ ] **Step 4: Run `git diff --check` and request commit approval**

```bash
rtk git diff --check
```

---

### Task 3: Capture and freeze the real Lynk payload

**Files:**

- Create after capture: `scripts/fixtures/lynk-payment-received.redacted.json`
- Modify after capture: `lib/billing/providers/lynk-webhook.ts`
- Modify after capture: `scripts/test-lynk-webhook-contract.mjs`

**External actions requiring their own approval:** deploy capture endpoint, save webhook URL,
store merchant key, and run Test URL.

- [ ] **Step 1: Deploy capture-only mode to a public Worker**

Use:

```text
LYNK_WEBHOOK_ENABLED=true
LYNK_WEBHOOK_CAPTURE_ONLY=true
```

The endpoint is `https://tutorlog.id/api/webhooks/lynk` unless a reviewed staging URL is
selected. Do not promote the products during the capture window.

- [ ] **Step 2: Configure the correct Lynk account**

Use the other open Chrome profile that is already signed in to `@tutorlog`. In that dashboard,
open Settings → Integrations → Webhook, save the endpoint, then obtain the merchant key.
Confirm the public profile URL is `https://lynk.id/tutorlog` before saving.

- [ ] **Step 3: Store the merchant key as a Cloudflare secret**

Use the existing secret-loading workflow. Never print the value or pass it as a CLI argument.

- [ ] **Step 4: Run Test URL and inspect Webhook History**

Record the actual nested field paths and primitive types for event, success marker,
`message_id`, `refId`, `grandTotal`, timestamp, customer email, and item identity.

- [ ] **Step 5: Create a redacted fixture**

Replace personal values with deterministic examples while preserving exact nesting and types:

```json
{
  "event": "payment.received",
  "data": {
    "message_id": "message-test-001",
    "message_data": {
      "refId": "ref-test-001",
      "customer": { "email": "buyer@example.com" },
      "totals": { "grandTotal": 19000 },
      "items": []
    }
  }
}
```

The example above is a shape guide only. The committed fixture must use the exact nesting
observed from Test URL and must exclude signature, phone, real email, and merchant key.

- [ ] **Step 6: Freeze parser tests from the captured fixture**

Tests must prove valid success, unsupported event, non-success marker, missing email,
multi-item order, unknown item, and malformed amount.

- [ ] **Step 7: Return to capture-only deployment and request evidence review**

Do not proceed to database mutation until the fixture and mapping are approved.

---

### Task 4: Add product mapping and outbound Lynk links

**Files:**

- Create: `lib/billing/lynk-products.ts`
- Create: `scripts/test-lynk-checkout-links-contract.mjs`
- Modify: `lib/billing/fallback-catalog.ts`
- Modify: `components/billing/pricing-catalog.tsx`
- Modify: package CTAs found by `rtk rg -n "checkout\?package|/checkout" components app`

**Interfaces:**

```ts
export const LYNK_PRODUCTS = {
  plus_30d: {
    checkoutUrl: "https://lynk.id/tutorlog/q51pn0rykvq9",
    amount: 19000,
    canonicalTitle: "TutorLog Plus — 30 Hari",
  },
  plus_12m: {
    checkoutUrl: "https://lynk.id/tutorlog/gjvmgkznjqd6",
    amount: 149000,
    canonicalTitle: "TutorLog Plus — 12 Bulan",
  },
  plus_lifetime: {
    checkoutUrl: "https://lynk.id/tutorlog/65p8z7ewqj8r",
    amount: 249000,
    canonicalTitle: "TutorLog Plus — Selamanya, bayar sekali di awal",
  },
} as const;
```

- [ ] **Step 1: Write failing link/amount contract**

Assert all paid package codes exist once, use HTTPS `lynk.id/tutorlog/` URLs, and match the
fallback catalog amounts.

- [ ] **Step 2: Add the mapping and update paid CTAs**

Use external links with safe target/rel behavior according to the existing Button contract.
Add nearby copy: `Gunakan email yang sama dengan akun TutorLog saat checkout.`

- [ ] **Step 3: Confirm no new-sale CTA uses internal checkout**

```bash
rtk rg -n "checkout\?package|/pembayaran/" components app
rtk node scripts/test-lynk-checkout-links-contract.mjs
```

Expected: remaining internal route references are explicitly historical or administrative;
the focused contract passes.

- [ ] **Step 4: Review external-navigation accessibility and request commit approval**

---

### Task 5: Add the private webhook inbox and atomic RPC

**Files:**

- Create: `supabase/migrations/202608240001_lynk_webhook_flow.sql`
- Create: `scripts/test-lynk-webhook-sql-contract.mjs`
- Modify: `lib/billing/contracts.ts`

**Interfaces:**

```sql
public.process_lynk_payment_received(
  p_event_key text,
  p_provider_reference text,
  p_customer_email text,
  p_product_code text,
  p_amount integer,
  p_occurred_at timestamptz,
  p_payload jsonb
) returns jsonb
```

The RPC returns one stable status:

```text
processed | duplicate | user_not_found | user_ambiguous |
unknown_product | amount_mismatch | unsupported_order
```

- [ ] **Step 1: Write failing SQL source-contract checks**

Assert:

- Inbox has unique `(provider, event_key)` and nullable user/purchase/payment links.
- RLS is enabled and no `anon`/`authenticated` grants exist.
- RPC is executable only by `service_role`.
- Email lookup uses normalized exact equality against `auth.users`.
- Unknown/mismatched inputs never call `apply_billing_paid_event`.
- Processed flow inserts a pending payment, sets provider-reported amount, then invokes
  `apply_billing_paid_event` in the same transaction.

- [ ] **Step 2: Implement the migration**

Extend stored payment method with `external` and stored provider with `lynk` without making
legacy rows unreadable. Insert snapshots from active `billing_products`/`billing_prices`,
not from webhook title or amount.

- [ ] **Step 3: Verify migration contracts locally**

```bash
rtk node scripts/test-lynk-webhook-sql-contract.mjs
rtk git diff --check
```

Expected: contract passes and no whitespace errors.

- [ ] **Step 4: Request database migration review and apply approval**

Do not apply to Supabase merely because the source contract passes.

---

### Task 6: Process verified webhooks through Supabase

**Files:**

- Create: `lib/billing/server/lynk-webhook.ts`
- Modify: `app/api/webhooks/lynk/route.ts`
- Modify: `scripts/test-lynk-webhook-contract.mjs`

**Interfaces:**

```ts
export interface ProcessedLynkWebhook {
  eventKey: string;
  providerReference: string;
  customerEmail: string;
  packageCode: "plus_30d" | "plus_12m" | "plus_lifetime";
  amount: number;
  occurredAt: string;
  raw: Record<string, unknown>;
}

export async function processLynkWebhook(
  event: ProcessedLynkWebhook,
): Promise<"processed" | "duplicate" | "needs_review">;
```

- [ ] **Step 1: Add failing route behavior tests**

Cover `200 ok`, `200 review`, duplicate `200`, malformed `400`, invalid signature `401`,
disabled/missing secret `503`, and temporary RPC failure `503`.

- [ ] **Step 2: Implement process mode**

Order of operations:

1. Enforce body-size limit.
2. Parse JSON.
3. Extract signed fields.
4. Verify signature.
5. Parse normalized success event.
6. Call the service-role RPC.
7. Map stable RPC status to redacted HTTP response.

- [ ] **Step 3: Run focused and existing billing contracts**

```bash
rtk node scripts/test-lynk-signature-contract.mjs
rtk node scripts/test-lynk-webhook-contract.mjs
rtk node scripts/test-lynk-webhook-sql-contract.mjs
rtk node scripts/test-lynk-checkout-links-contract.mjs
rtk node scripts/test-billing-contract.mjs
rtk node scripts/test-quota-access-contract.mjs
rtk git diff --check
```

Expected: all pass.

- [ ] **Step 4: Request commit approval**

---

### Task 7: Add support, reconciliation, and legal handoff

**Files:**

- Create: `docs/operations/lynk-webhook-runbook.md`
- Modify after separate legal-copy approval: `components/content/privacy-content.tsx`
- Modify after separate legal-copy approval: `components/content/terms-content.tsx`
- Modify: support copy that mentions payment activation or transaction evidence.

**Interfaces:**

The runbook defines these stable review reasons:

```text
user_not_found
user_ambiguous
unknown_product
amount_mismatch
unsupported_order
processing_error
```

- [ ] **Step 1: Write the operations runbook**

Document the exact operator sequence:

1. Locate the event by `message_id` or `refId` without exposing customer data in shared notes.
2. Compare the inbox row with Lynk Orders and the active TutorLog catalog.
3. Verify the TutorLog account email before assigning a user.
4. Retry only through the reviewed idempotent RPC or operator command.
5. Confirm one purchase/payment/grant after retry.
6. Record the operator, timestamp, reason, and external evidence reference.

- [ ] **Step 2: Document reconciliation**

At the chosen interval, compare Lynk Orders/export with webhook inbox rows. Missing events,
amount mismatches, and unresolved customer emails become review records; do not infer payment
from screenshots or email receipts.

- [ ] **Step 3: Document refund handling**

Refund in Lynk first. Until a signed refund event is verified, revoke/recalculate TutorLog
access only through the existing reviewed administrative path with an evidence reference.

- [ ] **Step 4: Prepare the legal/support copy diff**

State that checkout and payment processing occur on Lynk.id, while TutorLog receives payment
confirmation and uses checkout email to activate Plus. Do not apply this wording without the
separate legal-copy approval required by `AGENTS.md`.

- [ ] **Step 5: Verify documentation and request commit approval**

```bash
rtk rg -n "Lynk|needs_review|refund|reconciliation" docs/operations TASKS.md
rtk git diff --check
```

Expected: runbook covers all stable review reasons and diff check passes.

---

### Task 8: Verify Cloudflare and a real 30-day purchase

**Files:**

- Modify after evidence: `TASKS.md`
- No test payload, screenshots, logs, or secrets are committed.

**External actions requiring approval:** deploy, Cloudflare secret/var updates, Lynk Test URL,
and a real Rp19.000 transaction.

- [ ] **Step 1: Deploy with processing disabled**

Confirm `POST /api/webhooks/lynk` returns redacted `503` and other routes are unaffected.

- [ ] **Step 2: Enable capture mode and repeat Test URL**

Confirm signature verification succeeds in Worker runtime and Webhook History records success.

- [ ] **Step 3: Enable processing mode**

Set `LYNK_WEBHOOK_ENABLED=true` and `LYNK_WEBHOOK_CAPTURE_ONLY=false` only after focused
contracts, migration evidence, and environment review pass.

- [ ] **Step 4: Buy Plus 30 Hari with a dedicated existing TutorLog test account**

Use the exact same email in Lynk checkout. Verify:

- One inbox row is `processed`.
- One purchase snapshot is `plus_30d` and Rp19.000.
- One payment is `paid` with provider `lynk`.
- One entitlement has the correct 30-day window.
- Profile reports Plus active.
- Invoice PDF and recap export authorization succeed.

- [ ] **Step 5: Replay and negative cases**

Replay the same signed fixture against the approved test environment and prove no second grant.
Run controlled unmatched-email, unknown-product, and amount-mismatch fixtures; each must be
stored for review without entitlement.

- [ ] **Step 6: Run release checks before any production merge**

Ask whether to run or skip responsive, accessibility, visual regression, and PDF export suites
as required by repository policy. Full test suite is required before a PR or merge to `main`.

- [ ] **Step 7: Update task checkboxes from returned evidence only**

Do not mark real webhook, payment, or entitlement checks complete from local fixtures.

---

### Task 9: Retire the legacy gateway flow

**Files:**

- Delete only after usage audit: legacy provider adapter/signature/callback/test files.
- Modify: `lib/billing/providers/index.ts`
- Modify: `lib/billing/server/purchases.ts`
- Modify: `lib/billing/server/payments.ts`
- Modify: `components/billing/checkout-panel.tsx`
- Modify: `components/billing/payment-status-panel.tsx`
- Modify: environment documentation and `TASKS.md`

- [ ] **Step 1: Prove there are no active consumers**

```bash
rtk rg -n "createPaymentProvider|createPayment\(|getPaymentStatus|cancelPayment|BILLING_PAYMENT_PROVIDER_ENABLED|MERCHANT_CODE|CALLBACK_URL|RETURN_URL" app components lib scripts docs TASKS.md
```

Classify every match as new-sales runtime, historical display support, test, or documentation.

- [ ] **Step 2: Audit stored historical providers before narrowing types**

Use read-only Supabase evidence. Preserve display support for any provider value present in
production rows.

- [ ] **Step 3: Remove unreachable payment creation, inquiry, polling, cancellation, and callback code**

Do not change entitlement functions, access projection, export authorization, or historical
row rendering in the same cleanup.

- [ ] **Step 4: Run all billing and route contracts plus production build**

```bash
rtk npm run lint
rtk node scripts/test-billing-contract.mjs
rtk node scripts/test-billing-ui-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
rtk node scripts/test-quota-access-contract.mjs
rtk npm run build
rtk git diff --check
```

Expected: all checks pass and build output includes `/api/webhooks/lynk`.

- [ ] **Step 5: Request final review, commit, push, PR, merge, and deploy approvals separately**

---

## Completion evidence

The implementation is complete only when the handoff includes:

- Redacted Test URL fixture and signature result.
- Cloudflare deployment URL and webhook route smoke result.
- Lynk Webhook History success evidence.
- Real Plus 30 Hari transaction reference, with personal data redacted.
- Supabase evidence for exactly one purchase, payment, and entitlement.
- Duplicate replay and needs-review evidence.
- Focused tests, required full tests, lint, build, and `git diff --check` results.
- Final Git branch, commit, PR, merge, and deployment state.
