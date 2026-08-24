# TutorLog Pricing and Payment Integration Implementation Plan

> **Status: Superseded.** Do not execute this provider flow. The current payment plan is
> `docs/superpowers/plans/2026-08-24-lynk-webhook-integration.md`, using external Lynk.id
> checkout and a signed successful-transaction webhook. This file remains only as historical
> implementation evidence for the billing foundation already present in the repository.

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Historical goal:** Build the TutorLog-owned catalog, purchase, payment, entitlement, export-authorization, analytics, and notification backend behind a provider-neutral contract.

**Architecture:** Supabase/Postgres owns commercial and entitlement state. Next.js Route Handlers authenticate users, call focused billing application services, and map provider-specific results into shared DTOs. iPaymu callbacks and reconciliation use a server-only Supabase admin client; browser code never writes payment or entitlement state.

**Tech Stack:** Next.js 16 App Router, TypeScript, Supabase PostgreSQL and RLS, native `fetch`, Node `crypto`, iPaymu REST API, Resend HTTP API, Node `assert` contract tests.

## MVP Cut (2026-07-16)

The user explicitly prioritized shipping the MVP quickly and asked to skip non-essential hardening. After Task I5:

- Keep Task I6 because verified callback-to-entitlement activation is required for a real paid MVP.
- Defer Task I7 reconciliation, automated refunds, cron route, and bulk legacy tooling to post-MVP. The existing one-user manual grant foundation is enough for now.
- Defer Task I8 analytics and Resend confirmation email to post-MVP. Payment status in the web app is the initial confirmation path.
- Reduce Task I9 to source-contract verification and an honest disabled-provider/UI handoff. Do not wait for merchant or sandbox evidence; list it as the external blocker for enabling payment.
- Skip optional abstractions, expanded operational tooling, and minor review polish. Fix only correctness/security issues that can lose money, grant wrong access, leak secrets, or break the core user flow.

## Global Constraints

- This plan implements the Integration/Data workstream from `docs/superpowers/specs/2026-07-16-pricing-paywall-payment-design.md`.
- UI/Product work is owned by `docs/superpowers/plans/2026-07-16-pricing-checkout-ui.md`.
- Use `rtk` as the prefix for every shell command.
- Never change application code directly on `develop`; create `feat/pricing-payment-integration` from `develop` before implementation.
- Do not use a worktree unless the user explicitly requests one.
- Code commits require explicit user approval. Every commit step below is a pause point, not standing authorization.
- Do not push, merge, create a PR, change production environment variables, apply a production migration, or enable a scheduler without separate approval.
- Do not run tests, responsive sweeps, accessibility checks, visual regression, PDF export tests, or production payment calls unless the user explicitly approves the relevant checkpoint.
- Preserve existing session, student, recap-filter, invoice-field, invoice-calculation, and browser PDF contracts.
- Preserve existing `get_user_access_status` and `record_feature_usage_event` behavior until their live SQL definitions have been captured and reviewed.
- Treat the Task I0 Supabase CLI schema-only dump as the authority for legacy objects: `user_entitlements`, `user_feature_usage`, and `user_feature_usage_events`; there is no `user_profiles` table in the verified live contract.
- The iPaymu merchant account is not registered yet. `BILLING_PAYMENT_PROVIDER_ENABLED` defaults to `false`, and no provider request, checkout handoff, webhook mutation, reconciliation inquiry, or payment-ready response may occur while it is false.
- Provider-neutral foundations and a documented iPaymu adapter may be prepared while the provider is disabled. Redirect, Direct, QRIS, VA, fees, callbacks, inquiry, cancellation, static IP, domain, sandbox, and live readiness remain unapproved until Task I9 evidence passes review.
- Do not add a payment SDK. Use native `fetch` and `crypto` behind the provider adapter.
- Do not add the Resend SDK. Use the documented `POST https://api.resend.com/emails` HTTP endpoint.
- Never log provider secrets, signatures, full VA numbers, QR payloads, raw callbacks, access tokens, or service-role credentials.
- A browser return URL never proves payment.
- Payment transition and entitlement issuance must be atomic and idempotent.
- All shell test commands in this plan are proposed future checks. Repository policy and explicit user approval determine when they may run.

---

## Subagent-Driven Execution Protocol

- Integration/Data is executed as its own workstream on `feat/pricing-payment-integration`. UI/Product remains outside this branch.
- Dispatch one fresh implementer subagent for each task `I0` through `I9`; never dispatch two implementers concurrently.
- Each implementer receives only its extracted task brief, the interfaces it consumes, the binding Global Constraints, and the required report path.
- Each code task follows `superpowers:test-driven-development` when its approved verification scope permits tests.
- After every task, dispatch a separate task reviewer. The reviewer must return both a spec-compliance verdict and a code-quality verdict.
- Critical and Important findings go back to a fix subagent and must pass re-review before the next Integration task begins. Record Minor findings in the SDD progress ledger for the final reviewer.
- After `I9`, dispatch a broad whole-branch reviewer using `superpowers:requesting-code-review`. Integration is not handed to UI until that review has no open Critical or Important findings.
- Complete and review the Integration branch before starting UI implementation. UI begins only after the user approves synchronizing the reviewed Integration work into its branch base.
- `I1` remains the first contract gate: its reviewed DTOs and normalized errors become the only contract consumed by UI Task `U1`.
- Keep durable execution state in `.superpowers/sdd/progress.md` only while this workflow is active, then remove the temporary ledger before final handoff unless the user asks to retain it.
- Repository approval boundaries still govern the workflow. Worktree creation and task-scoped code commits require explicit approval before execution starts.

---

## File Responsibility Map

### Shared application contract

- `lib/billing/contracts.ts`: stable package, access, purchase, payment, quote, latest-payment, and export-authorization DTOs shared with UI.
- `lib/billing/errors.ts`: normalized error codes and `BillingError`.
- `scripts/test-billing-contract.mjs`: pure contract and state-transition assertions.

### Database and Supabase

- `supabase/migrations/202607160001_billing_foundation.sql`: enum-like checks, catalog, purchases, payments, provider events, entitlement grants, analytics, RLS, and launch catalog.
- `supabase/migrations/202607160002_billing_functions.sql`: access projection, atomic paid-event application, export authorization, refund recalculation, and administrative legacy-grant function.
- `lib/supabase/admin.ts`: service-role client for webhook and internal jobs only.

### Billing services

- `lib/billing/server/auth.ts`: authenticated-user requirement for Route Handlers.
- `lib/billing/server/catalog.ts`: active catalog and price lookup.
- `lib/billing/server/purchases.ts`: create/resume purchase and safe purchase projection.
- `lib/billing/server/payments.ts`: payment-attempt lifecycle and provider handoff.
- `lib/billing/server/access.ts`: normalized access and latest-payment reads.
- `lib/billing/server/exports.ts`: atomic export authorization.
- `lib/billing/server/analytics.ts`: allowlisted first-party funnel events.
- `lib/billing/server/reconciliation.ts`: stale pending-payment inquiry and recovery.

### Provider and notifications

- `lib/billing/providers/provider.ts`: provider-neutral interface and normalized provider result types.
- `lib/billing/providers/ipaymu-signature.ts`: request and callback canonicalization plus HMAC verification.
- `lib/billing/providers/ipaymu.ts`: iPaymu Redirect, inquiry, and cancellation adapter.
- `lib/billing/providers/index.ts`: configured provider factory.
- `lib/billing/notifications/email.ts`: email adapter interface.
- `lib/billing/notifications/resend.ts`: Resend HTTP implementation with idempotency key.
- `lib/billing/notifications/payment-confirmation.ts`: safe payment-confirmation content.

### HTTP boundary

- `app/api/products/route.ts`: public active catalog.
- `app/api/quotes/route.ts`: authenticated package and method quote before payment creation.
- `app/api/purchases/route.ts`: authenticated create-or-resume purchase.
- `app/api/purchases/[purchaseId]/route.ts`: authenticated purchase and payment status.
- `app/api/payments/[paymentId]/cancel/route.ts`: authenticated supersede and best-effort provider cancellation.
- `app/api/exports/authorize/route.ts`: authenticated export authorization.
- `app/api/analytics/route.ts`: allowlisted first-party funnel event ingestion.
- `app/api/webhooks/ipaymu/route.ts`: raw-body callback verification and atomic processing.
- `app/api/internal/reconcile-payments/route.ts`: secret-protected reconciliation entry point; scheduling is separately approved.

### Focused verification

- `scripts/test-billing-migration-contract.mjs`: migration source and RLS contract.
- `scripts/test-ipaymu-signature-contract.mjs`: deterministic signature and callback verification vectors.
- `scripts/test-billing-route-contract.mjs`: HTTP boundary, auth, and secret-leak source contract.
- `scripts/test-billing-notification-contract.mjs`: email content and idempotency contract.

## Dependency Graph

```text
Task I0 evidence gate
  -> Task I1 shared contract
  -> Task I2 database foundation
  -> Task I2A grant provenance amendment
  -> Task I3 entitlement and export functions
  -> Task I4 provider adapter
  -> Task I5 purchase and payment services/routes
  -> Task I6 webhook and atomic activation
  -> Task I7 reconciliation, refund, and legacy migration
  -> Task I8 analytics and confirmation email
  -> Task I9 integration verification handoff
```

The UI workstream is planned separately and begins only after the reviewed Integration branch is approved as its branch base. UI still uses fixtures until Task I5's real application contract is available.

---

### Task I0: Capture Live Database and Merchant Evidence

**Files:**
- Read: `docs/superpowers/specs/2026-07-16-pricing-paywall-payment-design.md`
- Read: `.env.local` variable names only; do not print values
- Temporary evidence: `/tmp/tutorlog-billing-schema-audit.txt`
- Temporary evidence: `/tmp/tutorlog-ipaymu-sandbox-audit.txt`

**Interfaces:**
- Consumes: current live Supabase objects and the iPaymu sandbox merchant account.
- Produces: verified legacy SQL definitions, RLS inventory, Redirect capability result, provider status mapping, fee behavior, and a go/no-go decision for iPaymu Redirect.

- [ ] **Step 1: Confirm the repository and environment boundary**

Run:

```bash
rtk git status --short --branch
rtk awk -F= '/^[A-Z0-9_]+=/{print $1}' .env.local
rtk rg --files supabase lib/billing app/api 2>/dev/null
```

Expected:

- The branch is `feat/pricing-payment-integration` before code work begins.
- Environment output contains names only.
- No existing billing migration or provider implementation is accidentally overwritten.

- [ ] **Step 2: Capture live function definitions through Supabase SQL Editor**

Run this read-only SQL in the target Supabase project's SQL Editor and copy the result to `/tmp/tutorlog-billing-schema-audit.txt` without secrets or user rows:

```sql
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('get_user_access_status', 'record_feature_usage_event')
order by p.proname, arguments;
```

Expected: one or more exact definitions for both runtime RPC names. Stop if either definition is missing.

- [ ] **Step 3: Capture legacy table, constraint, and RLS shape**

Run this read-only SQL and append the result to the same temporary evidence file:

```sql
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('user_profiles', 'user_feature_usage_events')
order by table_name, ordinal_position;

select schemaname, tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('user_profiles', 'user_feature_usage_events')
order by tablename, policyname;
```

Expected: enough evidence to identify where the legacy plan and expiry are stored and how the RPC derives access. Stop before Task I2 if the table names differ.

- [ ] **Step 4: Verify iPaymu sandbox behavior**

Using the sandbox merchant account and official documentation, record only redacted evidence for:

```text
business_model_allowed=yes|no
redirect_available=yes|no
qris_available=yes|no
va_available=yes|no
method_selection_location=tutorlog|ipaymu
channel_fee_source=request|response|dashboard
callback_reference_field=<verified field name>
callback_status_values=<verified values>
callback_retry_condition=<verified condition>
inquiry_available=yes|no
cancellation_available=yes|no
production_static_ip_required=yes|no
```

Expected during pre-registration: account-specific lines are `deferred_until_merchant_registration`, each public-documentation fact has its source URL, and no provider mode is approved.

- [ ] **Step 5: Apply the provider-mode gate**

Decision:

```text
Use `deferred integration preparation` while the merchant account does not exist. Keep `BILLING_PAYMENT_PROVIDER_ENABLED=false`.
Use Redirect only after SaaS is allowed and Redirect exposes QRIS, VA, total, expiry, reference, callback, and inquiry in the merchant sandbox.
Return to design review before choosing Direct when any required Redirect capability is missing.
```

Expected: the user approved provider-neutral preparation on 2026-07-16. Task I2 may proceed, but provider credentials and readiness remain blocked until Task I9.

---

### Task I1: Freeze the Shared Billing Contract

**Files:**
- Create: `lib/billing/contracts.ts`
- Create: `lib/billing/errors.ts`
- Create: `scripts/test-billing-contract.mjs`

**Interfaces:**
- Consumes: approved package and state decisions from the design spec.
- Produces: `PackageCode`, `AccessSummary`, `ProductSummary`, `CheckoutQuote`, `PurchaseSummary`, `PaymentStatusView`, `LatestPaymentSummary`, `ExportAuthorizationResult`, `BillingErrorCode`, and `BillingError`.

- [ ] **Step 1: Write the failing contract test**

Create `scripts/test-billing-contract.mjs`:

```js
import assert from "node:assert/strict";
import {
  PACKAGE_CODES,
  PAYMENT_STATES,
  assertPaymentTransition,
  isPackageCode,
} from "../lib/billing/contracts.ts";
import { BillingError } from "../lib/billing/errors.ts";

assert.deepEqual(PACKAGE_CODES, ["free", "plus_30d", "plus_12m", "plus_lifetime"]);
assert.equal(isPackageCode("plus_12m"), true);
assert.equal(isPackageCode("founding_lifetime"), false);
assert.ok(PAYMENT_STATES.includes("superseded"));
assert.doesNotThrow(() => assertPaymentTransition("pending", "paid"));
assert.doesNotThrow(() => assertPaymentTransition("superseded", "paid"));
assert.throws(() => assertPaymentTransition("paid", "pending"), BillingError);

console.log("billing contract valid");
```

- [ ] **Step 2: Run the contract test and observe failure**

Run only after the user approves this focused check:

```bash
rtk node scripts/test-billing-contract.mjs
```

Expected: FAIL because `lib/billing/contracts.ts` does not exist.

- [ ] **Step 3: Implement normalized contracts**

Create `lib/billing/contracts.ts` with these exported values and exact public shapes:

```ts
export const PACKAGE_CODES = ["free", "plus_30d", "plus_12m", "plus_lifetime"] as const;
export type PackageCode = (typeof PACKAGE_CODES)[number];

export const ACCESS_STATES = ["free", "plus_active", "plus_expired"] as const;
export type AccessState = (typeof ACCESS_STATES)[number];
export type EntitlementType = "term" | "lifetime" | null;

export const PAYMENT_STATES = [
  "created", "pending", "superseded", "paid", "expired", "failed", "canceled", "refunded",
] as const;
export type PaymentState = (typeof PAYMENT_STATES)[number];
export type PaymentMethod = "qris" | "va";

export interface ProductSummary {
  code: PackageCode;
  name: string;
  description: string;
  priceId: string | null;
  amount: number;
  currency: "IDR";
  durationKind: "free" | "days" | "months" | "lifetime";
  durationValue: number | null;
  featured: boolean;
  available: boolean;
}

export interface CheckoutQuote {
  package: ProductSummary;
  method: PaymentMethod;
  baseAmount: number;
  channelFee: number;
  totalAmount: number;
  currency: "IDR";
  expiresAt: string | null;
}

export interface AccessSummary {
  state: AccessState;
  entitlementType: EntitlementType;
  isLifetime: boolean;
  activeFrom: string | null;
  activeUntil: string | null;
}

export interface LatestPaymentSummary {
  id: string;
  packageName: string;
  method: PaymentMethod;
  state: PaymentState;
  baseAmount: number;
  channelFee: number;
  totalAmount: number;
  currency: "IDR";
  safeReference: string;
  createdAt: string;
  paidAt: string | null;
}

export interface PurchaseSummary {
  id: string;
  packageCode: PackageCode;
  packageName: string;
  state: "open" | "completed" | "canceled" | "refunded";
  payment: PaymentStatusView | null;
}

export interface PaymentStatusView extends LatestPaymentSummary {
  purchaseId: string;
  provider: "ipaymu";
  expiresAt: string | null;
  redirectUrl: string | null;
  instructions: string[];
  verificationDeadline: string | null;
  duplicateReview: boolean;
}

export interface ExportAuthorizationResult {
  allowed: boolean;
  authorizationId: string | null;
  reason: "free-limit" | "expired" | "invoice-locked" | null;
  used: number | null;
  limit: number | null;
}

export function isPackageCode(value: unknown): value is PackageCode {
  return typeof value === "string" && PACKAGE_CODES.includes(value as PackageCode);
}

const transitions: Record<PaymentState, readonly PaymentState[]> = {
  created: ["pending", "failed", "canceled"],
  pending: ["superseded", "paid", "expired", "failed", "canceled"],
  superseded: ["paid", "expired", "canceled"],
  paid: ["refunded"],
  expired: [],
  failed: [],
  canceled: [],
  refunded: [],
};

export function assertPaymentTransition(from: PaymentState, to: PaymentState): void {
  if (!transitions[from].includes(to)) {
    throw new Error(`Invalid payment transition: ${from} -> ${to}`);
  }
}
```

Create `lib/billing/errors.ts`:

```ts
export type BillingErrorCode =
  | "AUTH_REQUIRED"
  | "PAYMENT_PROVIDER_NOT_READY"
  | "PACKAGE_NOT_FOUND"
  | "PACKAGE_UNAVAILABLE"
  | "PRICE_CHANGED"
  | "LIFETIME_ALREADY_ACTIVE"
  | "PURCHASE_NOT_FOUND"
  | "PAYMENT_NOT_FOUND"
  | "PAYMENT_NOT_CANCELABLE"
  | "INVALID_PAYMENT_TRANSITION"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_RESPONSE_INVALID"
  | "EXPORT_NOT_ALLOWED";

export class BillingError extends Error {
  constructor(public readonly code: BillingErrorCode, message: string) {
    super(message);
    this.name = "BillingError";
  }
}
```

Update `assertPaymentTransition` to throw `BillingError("INVALID_PAYMENT_TRANSITION", ...)` after importing `BillingError` from `./errors`.

- [ ] **Step 4: Run the contract test**

Run only after approval:

```bash
rtk node scripts/test-billing-contract.mjs
```

Expected: PASS with `billing contract valid`.

- [ ] **Step 5: Review and request commit approval**

```bash
rtk git diff -- lib/billing/contracts.ts lib/billing/errors.ts scripts/test-billing-contract.mjs
rtk git diff --check
```

If the user approves the code commit:

```bash
rtk git add lib/billing/contracts.ts lib/billing/errors.ts scripts/test-billing-contract.mjs
rtk git diff --cached --check
rtk git commit -m "feat: define billing application contract"
```

---

### Task I2: Add the Billing Schema, Catalog, and RLS

**Files:**
- Create: `supabase/.gitignore`
- Create: `supabase/migrations/202607160001_billing_foundation.sql`
- Create: `scripts/test-billing-migration-contract.mjs`
- Create: `lib/supabase/admin.ts`

**Interfaces:**
- Consumes: Task I0 live definitions for `user_entitlements`, `user_feature_usage`, `user_feature_usage_events`, and Task I1 package and payment states.
- Produces: `billing_products`, `billing_prices`, `billing_purchases`, `billing_payments`, `billing_provider_events`, `billing_entitlement_grants`, `billing_analytics_events`, and a server-only admin client.

- [ ] **Step 1: Write the failing migration contract**

The test must read the migration source and assert all table names, foreign keys to `auth.users`, unique provider references, non-negative amount checks, RLS enablement, and launch package codes. It must explicitly assert that `service_role` is used only in server policy or grants and that no secret literal appears.

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/migrations/202607160001_billing_foundation.sql", "utf8");
for (const table of [
  "billing_products", "billing_prices", "billing_purchases", "billing_payments",
  "billing_provider_events", "billing_entitlement_grants", "billing_analytics_events",
]) assert.match(sql, new RegExp(`create table public\\.${table}`));
assert.match(sql, /unique \(provider, provider_reference\)/);
assert.match(sql, /alter table public\.billing_payments enable row level security/);
assert.match(sql, /'plus_30d'[\s\S]*19000/);
assert.match(sql, /'plus_12m'[\s\S]*149000/);
assert.match(sql, /'plus_lifetime'[\s\S]*249000/);
assert.doesNotMatch(sql, /service_role_key|ipaymu_api_key|re_[A-Za-z0-9]/i);
console.log("billing migration contract valid");
```

- [ ] **Step 2: Run and observe the missing migration failure**

```bash
rtk node scripts/test-billing-migration-contract.mjs
```

Expected: FAIL with missing migration file.

- [ ] **Step 3: Implement the migration**

Create `supabase/.gitignore` with exactly:

```gitignore
.temp/
```

This preserves the local linked-project state without allowing it into a commit.

The migration must use UUID primary keys with `gen_random_uuid()`, `timestamptz`, integer IDR amounts, immutable snapshot columns on purchases, one partial unique active price per product, a unique `(provider, provider_reference)` constraint, a unique entitlement `purchase_id`, and indexed pending-payment and user-access lookups.

Required checks:

```sql
check (amount >= 0)
check (channel_fee >= 0)
check (total_amount = base_amount + channel_fee)
check (duration_kind in ('free', 'days', 'months', 'lifetime'))
check (state in ('created', 'pending', 'superseded', 'paid', 'expired', 'failed', 'canceled', 'refunded'))
check ((entitlement_type = 'lifetime' and active_until is null) or entitlement_type = 'term')
```

RLS contract:

- Authenticated users may read active catalog rows.
- Users may read their own purchases, safe payments, and entitlement grants.
- Users may not insert or update payment/provider/grant rows directly.
- Raw provider events have no end-user select policy.
- Analytics inserts occur through a server function, not direct public insert.

Compatibility contract:

- Do not create or reference `user_profiles`.
- Do not replace the verified legacy tables or silently widen their existing `plan`, `source`, or `event_type` checks.
- New billing tables own purchases, provider payments, and immutable entitlement grants. Compatibility projection into `user_entitlements` is handled deliberately in Task I3.

Seed exactly the four approved product codes and launch price rows. Plus Selamanya must have no availability cap or end timestamp.

- [ ] **Step 4: Add the admin client**

Create `lib/supabase/admin.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase admin environment is not configured");

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

- [ ] **Step 5: Run the focused migration contract**

```bash
rtk node scripts/test-billing-migration-contract.mjs
rtk git diff --check
```

Expected: PASS with `billing migration contract valid` and no whitespace errors. Do not apply the migration yet.

- [ ] **Step 6: Request schema review and migration-apply approval**

Review the full SQL diff. Applying it to sandbox or production is a separate approval from committing the source.

---

### Task I2A: Add Explicit Purchase and Legacy Grant Provenance

**Files:**
- Modify: `supabase/migrations/202607160001_billing_foundation.sql`
- Modify: `scripts/test-billing-migration-contract.mjs`

**Interfaces:**
- Consumes: reviewed Task I2 schema and Task I3's required `admin_grant_legacy_entitlement` contract.
- Produces: one grant table that distinguishes purchase-backed grants from manually verified legacy grants without synthetic purchases.

- [ ] **Step 1: Add failing provenance assertions**

Extend the focused migration contract to require:

```text
source in ('purchase', 'legacy_verified')
purchase source -> purchase_id is not null
legacy_verified source -> purchase_id is null and evidence_reference is non-empty
one grant per non-null purchase_id
```

Run:

```bash
rtk node scripts/test-billing-migration-contract.mjs
```

Expected: FAIL because the reviewed Task I2 grant table has no `source` or `evidence_reference` and requires every grant to reference a purchase.

- [ ] **Step 2: Amend the unapplied foundation migration**

In `billing_entitlement_grants`:

- Make `purchase_id` nullable while retaining its unique constraint and foreign keys. PostgreSQL unique semantics permit multiple null legacy grants while preserving one grant per real purchase.
- Add `source text not null` with allowed values `purchase` and `legacy_verified`.
- Add nullable `evidence_reference text`.
- Add a check requiring purchase-backed grants to have a purchase ID and no evidence reference.
- Add a check requiring legacy grants to have no purchase ID and a non-empty trimmed evidence reference.
- Preserve user ownership, explicit term/lifetime type, product code, access dates, RLS, client read-only posture, and account-delete cascade.

- [ ] **Step 3: Run focused contract and commit**

```bash
rtk node scripts/test-billing-migration-contract.mjs
rtk git diff --check
```

Expected: PASS with `billing migration contract valid`. Do not apply the migration.

---

### Task I3: Add Atomic Entitlement and Export Functions

**Files:**
- Create: `supabase/migrations/202607160002_billing_functions.sql`
- Modify: `scripts/test-billing-migration-contract.mjs`
- Modify: `lib/data/quota-access.ts`
- Modify: `lib/data/quota.ts`
- Create: `lib/billing/server/access.ts`
- Create: `lib/billing/server/exports.ts`
- Create: `app/api/exports/authorize/route.ts`

**Interfaces:**
- Consumes: verified legacy RPC definitions, `user_entitlements`, `user_feature_usage`, `user_feature_usage_events`, billing tables, and Task I1 DTOs.
- Produces: `apply_billing_paid_event`, `get_billing_access_status`, `authorize_feature_export`, `admin_grant_legacy_entitlement`, `getAccessSummary()`, and `authorizeExport()`.

- [ ] **Step 1: Extend failing contracts for lifetime and atomic export**

Add assertions that lifetime is explicit, invalid dates do not become active, term expiry is compared as a timestamp without an unconditional extra day, a paid purchase can issue only one grant, and export authorization increments usage inside one SQL function.

Run:

```bash
rtk node scripts/test-quota-access-contract.mjs
rtk node scripts/test-billing-migration-contract.mjs
```

Expected: FAIL on missing lifetime fields and billing functions.

- [ ] **Step 2: Implement SQL functions with security boundaries**

`apply_billing_paid_event(p_payment_id uuid, p_paid_at timestamptz)` must:

1. Lock the payment and purchase rows.
2. Confirm provider amount and snapshot total match.
3. Return the existing result when the payment is already paid.
4. Mark the payment paid without moving a refunded payment backward.
5. Insert one grant using the unique purchase constraint.
6. Extend term access from `greatest(p_paid_at, current active_until)`.
7. Add `interval '30 days'` for `plus_30d` and `interval '12 months'` for `plus_12m`.
8. Create explicit lifetime access for `plus_lifetime`.
9. Mark the purchase completed.
10. Return normalized access fields.

`authorize_feature_export(p_feature text)` must lock or atomically update the legacy usage source identified in Task I0, then return `allowed`, `authorization_id`, `reason`, `used`, and `limit`. It must never use the existing check-then-record pattern.

Feature policy is fixed to the existing product behavior:

- `recap_pdf` and `recap_csv`: Free receives one successful authorization per feature in a rolling 30-day window; active Plus is unlimited. Successful authorization inserts one `user_feature_usage_events` row using legacy `feature_key = 'recap_export'` and `metadata.format = 'pdf' | 'csv'`.
- `invoice_pdf`: active Plus only. Successful authorization inserts one `user_feature_usage_events` row using `feature_key = 'invoice_export'` and `metadata.format = 'pdf'`.
- Rejected authorization inserts no usage event. The per-user/per-feature lock and the count-plus-insert must happen in the same transaction so concurrent Free requests cannot both consume the final slot.
- `authorization_id` is the inserted usage-event ID for an allowed request and `null` when rejected. `used` is the post-authorization count for limited recap access and the observed count otherwise; `limit` is `1` for Free recap and `null` for unlimited or invoice access.

`admin_grant_legacy_entitlement` must be executable only by `service_role`, accept one reviewed user at a time, and record `source = 'legacy_verified'` plus an operator-supplied evidence reference.

Compatibility projection is deliberate:

- Keep the existing `get_user_access_status()` RPC signature and legacy response keys available for mobile and current web consumers.
- Extend the legacy `user_entitlements.source` constraint without removing `voucher` or `manual`; add `billing` and `legacy_verified` for projections created by the new functions.
- A paid billing grant projects `plan = 'full_access'`, `source = 'billing'`, `voucher_id = null`, and its effective expiry into `user_entitlements`. A lifetime grant projects `active_until = null`.
- Never downgrade an existing legacy unlimited entitlement when a term purchase is activated. Term stacking uses the later active term expiry; explicit billing lifetime remains lifetime.
- `admin_grant_legacy_entitlement` writes the immutable billing grant first, then projects `source = 'legacy_verified'` into `user_entitlements`.
- `get_billing_access_status()` prefers explicit billing grants, then uses the verified legacy contract as a compatibility fallback. Legacy `full_access` with `active_until is null` may be normalized to `entitlement_type = 'lifetime'` because Task I0 verified that exact database meaning; client code must not infer lifetime from a missing date alone.

- [ ] **Step 3: Normalize access without implicit lifetime**

Extend `QuotaInfo` with `entitlementType` and `isLifetime`. Change `getAccessState()` so lifetime requires the explicit flag and term expiry uses the normalized server timestamp. Preserve legacy payload fallbacks only during the compatibility window.

Invalid or unparsable `active_until` values never produce active term access. Expiry comparisons use the timestamp exactly, with no unconditional extra day. `normalizeQuotaPayload()` accepts the normalized snake-case fields from `get_billing_access_status()` while retaining the existing quota keys used by current components.

- [ ] **Step 4: Replace export check-then-record server actions**

Expose:

```ts
export async function authorizeExport(
  feature: "recap_pdf" | "recap_csv" | "invoice_pdf",
): Promise<ExportAuthorizationResult>;
```

The server action calls `authorize_feature_export` once. Keep `recordExportEvent()` temporarily only for compatibility until both UI consumers move, then remove it in Task U7 of the UI plan.

Expose the same operation to browser clients through authenticated `POST /api/exports/authorize`. Validate the feature allowlist server-side and return only `ExportAuthorizationResult`.

- [ ] **Step 5: Run focused access and migration contracts**

```bash
rtk node scripts/test-quota-access-contract.mjs
rtk node scripts/test-billing-migration-contract.mjs
rtk git diff --check
```

Expected: both focused contracts pass. Do not claim remote SQL behavior until the migration is applied to an approved sandbox and exercised there.

---

### Task I4: Implement the Provider Adapter and Signature Verification

**Files:**
- Create: `lib/billing/providers/provider.ts`
- Create: `lib/billing/providers/ipaymu-signature.ts`
- Create: `lib/billing/providers/ipaymu.ts`
- Create: `lib/billing/providers/index.ts`
- Create: `scripts/test-ipaymu-signature-contract.mjs`

**Interfaces:**
- Consumes: Task I0 public-documentation evidence and the approved deferred merchant gate; merchant-specific endpoint, callback, status, and fee evidence remains unavailable.
- Produces: `PaymentProvider`, fail-closed `createPaymentProvider()`, deterministic request signing, constant-time callback verification, and normalized provider payment results that cannot make a live request while readiness is disabled.

- [ ] **Step 1: Write deterministic failing signature tests**

Use fixed VA, API key, timestamp, method, and JSON body fixtures. Compute the expected HMAC value once from the verified iPaymu documentation and store only fake test secrets. Assert body-key ordering, SHA-256 body hashing, header casing normalization, timestamp parsing, signature mismatch, and callback amount coercion.

Official-doc snapshot refreshed on 2026-07-16:

- Request signature: `stringToSign = METHOD + ":" + VA + ":" + lowerHexSha256(exactJsonBody) + ":" + API_KEY`; result is lower-hex `HMAC-SHA256(stringToSign, API_KEY)`. The exact JSON string signed must be the string sent. Source: `https://docs.ipaymu.com/id/docs/signature` and the official Node sample linked from `https://docs.ipaymu.com/id/docs`.
- Request headers are `va`, `signature`, and `timestamp`; request timestamp format is `YYYYMMDDHHmmss` for signing. Header lookup in application code is case-insensitive.
- Callback verification is a separate contract: normalize the documented callback field types, add `additional_info = []` when absent, remove a body `signature` field if present, sort keys ascending, JSON-stringify, escape `/` as `\/`, and calculate lower-hex `HMAC-SHA256(canonicalJson, VA)`. Compare against `X-Signature`. Source: `https://docs.ipaymu.com/id/docs/callback`.
- The callback fixture for this task is JSON-only and requires `X-Signature`, `X-External-ID`, and a parseable ISO `X-Timestamp`. Form-encoded callback handling remains deferred until the merchant dashboard content type is configured and captured in Task I9.
- For the documented JSON fixture, coerce `trx_id`, `status_code`, `transaction_status_code`, and `paid_off` to integers; coerce `is_escrow` to boolean; keep documented amount fields as strings for signature canonicalization, then require `amount` and `fee` to be non-negative whole-rupiah integers for the normalized result.
- Normalize documented callback states only: `berhasil`/`1` to `paid`, `pending`/`0` to `pending`, and `expired`/`-2` to `expired`; reject contradictory or unknown status pairs. Use `X-External-ID` as `eventReference`, the documented `trx_id` as the provider transaction reference, and the parsed `X-Timestamp` as `occurredAt`. Merchant payload evidence must confirm these mappings in Task I9 before enablement.

Expected command after approval:

```bash
rtk node scripts/test-ipaymu-signature-contract.mjs
```

Expected initial result: FAIL because the signature module does not exist.

- [ ] **Step 2: Define the provider interface**

```ts
export interface CreateProviderPaymentInput {
  purchaseId: string;
  amount: number;
  method: "qris" | "va";
  customer: { name: string; email: string; phone?: string };
  callbackUrl: string;
  returnUrl: string;
}

export interface ProviderPaymentResult {
  providerReference: string;
  state: "pending" | "failed";
  redirectUrl: string;
  channelFee: number;
  totalAmount: number;
  expiresAt: string | null;
}

export interface VerifiedProviderEvent {
  eventReference: string;
  providerReference: string;
  state: "pending" | "paid" | "expired" | "failed" | "canceled";
  amount: number;
  channelFee: number;
  occurredAt: string;
  raw: Record<string, unknown>;
}

export interface PaymentProvider {
  createPayment(input: CreateProviderPaymentInput): Promise<ProviderPaymentResult>;
  getPaymentStatus(reference: string): Promise<VerifiedProviderEvent>;
  cancelPayment(reference: string): Promise<{ accepted: boolean }>;
  verifyCallback(input: { rawBody: string; headers: Headers }): VerifiedProviderEvent;
}
```

`createPaymentProvider()` must throw `BillingError("PAYMENT_PROVIDER_NOT_READY", ...)` unless `BILLING_PAYMENT_PROVIDER_ENABLED === "true"` and every required iPaymu environment value is present. Tests and local fixtures keep the flag false. Do not infer readiness from credential presence alone.

- [ ] **Step 3: Implement signing and verification**

Use `createHash`, `createHmac`, and `timingSafeEqual` from `node:crypto`. Reject missing headers, invalid timestamps, signatures with different byte length, malformed JSON, unknown status, missing reference, and non-integer IDR amounts.

- [ ] **Step 4: Implement the iPaymu adapter using verified sandbox fields**

Prepare request and response mapping only for fields supported by current official documentation. Mark merchant-dependent mappings in the task report and keep them unreachable behind the readiness guard until Task I9 supplies redacted sandbox fixtures. Do not add placeholders that silently guess callback or fee behavior.

The current official request-signature page and Node sample support preparing `POST /api/v2/payment` with `product`, `qty`, `price`, `returnUrl`, `cancelUrl`, `notifyUrl`, `referenceId`, and optional buyer fields. Do not send a method/channel selection for Redirect until Task I9 confirms how QRIS and VA appear for the TutorLog merchant.

Current public material does not provide reviewed TutorLog fixtures for Redirect response, inquiry, or cancellation. Therefore:

- Request serialization, signing, timeout, redacted error handling, and strict response-decoder boundaries may be implemented now.
- Any response field needed for `ProviderPaymentResult` that is not explicitly present in the refreshed official material must cause a redacted `PAYMENT_PROVIDER_NOT_READY` failure; it must not be guessed or defaulted.
- `getPaymentStatus()` and `cancelPayment()` remain explicit fail-closed `PAYMENT_PROVIDER_NOT_READY` operations until Task I9 supplies official endpoint/field evidence and redacted sandbox fixtures. Do not fabricate endpoints.
- `BILLING_PAYMENT_PROVIDER_ENABLED` remains false in all current environments. This task must not edit `.env*`, add credentials, or make network calls.

Environment names:

```text
IPAYMU_BASE_URL
IPAYMU_VA
IPAYMU_API_KEY
IPAYMU_CALLBACK_URL
IPAYMU_RETURN_URL
```

The adapter must use `AbortSignal.timeout(10000)`, redact provider errors, and normalize all provider responses before returning them. Do not pass raw errors or provider bodies to UI callers.

- [ ] **Step 5: Run signature contract and request review**

```bash
rtk node scripts/test-ipaymu-signature-contract.mjs
rtk git diff --check
```

Expected: PASS with deterministic fake vectors. A sandbox request requires separate network and merchant approval.

---

### Task I5: Implement Catalog, Purchase, Payment, and Status APIs

**Files:**
- Create: `supabase/migrations/202607160003_billing_purchase_functions.sql`
- Modify: `scripts/test-billing-migration-contract.mjs`
- Create: `lib/billing/server/auth.ts`
- Create: `lib/billing/server/catalog.ts`
- Create: `lib/billing/server/purchases.ts`
- Create: `lib/billing/server/payments.ts`
- Create: `app/api/products/route.ts`
- Create: `app/api/quotes/route.ts`
- Create: `app/api/purchases/route.ts`
- Create: `app/api/purchases/[purchaseId]/route.ts`
- Create: `app/api/payments/[paymentId]/cancel/route.ts`
- Create: `scripts/test-billing-route-contract.mjs`

**Interfaces:**
- Consumes: Task I1 DTOs, Task I2 schema, and Task I4 provider adapter.
- Produces: public catalog, authenticated quote, create-or-resume purchase, safe status polling, and supersede/cancel behavior for UI.

- [ ] **Step 1: Write failing route-source and service contracts**

Assert that product reads expose only active catalog fields, every purchase/status/cancel route calls `requireUser()`, package and payment IDs are validated, provider errors are mapped to billing error codes, and no route returns raw provider payloads.

Extend the migration contract for the exact transactional support needed by this task. The route/service test may assert the TypeScript call sites, but purchase concurrency, inquiry throttling, and cancellation recording must not be implemented as process-local locks.

- [ ] **Step 2: Implement `requireUser()`**

```ts
export async function requireUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new BillingError("AUTH_REQUIRED", "Login diperlukan");
  return { supabase, user };
}
```

- [ ] **Step 3: Implement active catalog reads and quotes**

Catalog sorting is `free`, `plus_30d`, `plus_12m`, `plus_lifetime`. While `BILLING_PAYMENT_PROVIDER_ENABLED` is false, paid products return `available=false` and quote/purchase/payment endpoints fail with `PAYMENT_PROVIDER_NOT_READY` before any provider call. After Task I9 readiness approval, `POST /api/quotes` accepts `{ packageCode, method }`, requires authentication, and returns `CheckoutQuote`. QRIS quote has `channelFee = 0` for the user. VA quote uses the verified provider fee and must be revalidated during payment creation.

Read active catalog rows through the server-only admin client because the route is public while billing table RLS is authenticated-read-only. Return only the `ProductSummary` fields from Task I1. Never expose catalog row IDs other than the approved `priceId` DTO field.

While merchant fee evidence is unavailable, VA quotes fail closed with `PAYMENT_PROVIDER_NOT_READY`; do not default the VA fee to zero. Free is catalog-only and cannot create a paid quote or purchase. Route error mapping is stable: malformed/invalid input `400`, `AUTH_REQUIRED` `401`, not-found `404`, state/package conflicts `409`, invalid provider response `502`, and provider not-ready/unavailable `503`. Return `{ error: { code, message } }` for known billing errors and a redacted generic `500` for unknown errors.

- [ ] **Step 4: Implement create-or-resume purchase**

Input:

```ts
{ packageCode: PackageCode; method: PaymentMethod }
```

Behavior:

- Reject unavailable package and lifetime user purchases.
- Reuse an unexpired pending attempt for the same user, product, price snapshot, and method.
- Snapshot product and price before provider creation.
- Create the provider payment once and persist the normalized result.
- Return `PurchaseSummary`, never the raw provider response.

`lifetime user purchases` means any paid purchase attempt by a user whose normalized access reports `isLifetime = true`; return `LIFETIME_ALREADY_ACTIVE`. It does not mean that the `plus_lifetime` product itself is unavailable.

Add a service-role-only `reserve_billing_purchase(...)` SQL function. It must take a guaranteed advisory transaction lock keyed by user plus package plus method, re-read the active product/price inside the transaction, and atomically either:

- return the newest unexpired `created` or `pending` payment with matching user, product, price, and method and `should_create_provider = false`; or
- snapshot a new purchase plus a `created` payment attempt and return `should_create_provider = true`.

Only the caller receiving `should_create_provider = true` may call `createPayment()`. This prevents concurrent requests from making the provider request twice. Provider creation failure marks that attempt `failed` with a redacted internal code; it never stores a raw error/body. No process-local mutex is acceptable. The current disabled readiness guard must run before this reservation so disabled requests make no database mutation and no provider call.

The reservation result must return the authoritative price ID, base amount, channel fee, total amount, and currency snapshots. The provider request must use those returned snapshots, never the earlier quote object. If the pre-reservation quote differs, atomically fail the reserved attempt with `PRICE_CHANGED` and return that conflict before any provider call.

Persist provider creation through a service-role-only `finalize_billing_provider_payment(...)` SQL function that locks the owned payment and verifies a returned row. For `created`, persist the normalized provider reference/result and move to the normalized state. If cancellation already moved it to `superseded`, still persist the provider reference and normalized evidence, keep `superseded`, and return `requires_cancellation = true`; never orphan a live provider payment because an `update ... where state = 'created'` matched zero rows.

Provider exceptions use a checked SQL failure-recording function. A normalized provider result with `state = 'failed'` stores a stable redacted `PROVIDER_REPORTED_FAILED` code. Every database mutation must verify a returned row/result; checking only Supabase's `error` property is insufficient.

Reservation SQL raises stable machine-readable billing codes for expected package or price conflicts. The TypeScript service maps only those exact codes to known 4xx billing errors; missing RPCs, permissions, connectivity, and unexpected SQL failures remain unknown and reach the generic redacted 500.

- [ ] **Step 5: Implement status polling**

The route verifies purchase ownership and returns the safe projection. Add `provider_last_checked_at timestamptz` to `billing_payments`; an inquiry is eligible only when a pending payment's last check is null or older than 30 seconds. The service claims the inquiry window atomically before calling the provider so concurrent polls cannot both inquire. Because inquiry evidence is deferred, the current provider method fails closed and the safe stored projection is returned without raw provider data. A return query parameter never changes state and is ignored by the service.

- [ ] **Step 6: Implement supersede and best-effort cancellation**

The cancel route calls a service-role-only SQL function that locks the user's `created` or `pending` payment and changes it to `superseded` before any provider cancellation request. Add `cancellation_requested_at timestamptz` and `cancellation_error_code text` to `billing_payments`. Provider cancellation failure records only a redacted stable internal code and does not restore the attempt as active. A later verified paid event remains valid through Task I3's `superseded -> paid` contract. When the provider is disabled, fail before changing database state.

Cancellation-failure persistence must also verify a returned row/result. The shared Task I1 transition contract must allow `created -> superseded` because the SQL cancellation contract intentionally accepts both `created` and `pending`. Create-versus-cancel is resolved by the provider finalization function above, not by silently discarding a zero-row update.

- [ ] **Step 7: Run focused contracts and request review**

```bash
rtk node scripts/test-billing-contract.mjs
rtk node scripts/test-billing-migration-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
rtk git diff --check
```

Expected: focused contracts pass. No live provider call is implied.

---

### Task I6: Implement Webhook Processing and Atomic Activation

**Files:**
- Create: `supabase/migrations/202607160004_billing_webhook_functions.sql`
- Create: `app/api/webhooks/ipaymu/route.ts`
- Modify: `lib/billing/server/payments.ts`
- Modify: `scripts/test-billing-route-contract.mjs`
- Modify: `scripts/test-billing-migration-contract.mjs`

**Interfaces:**
- Consumes: verified callback, admin client, provider-event table, and `apply_billing_paid_event`.
- Produces: replay-safe provider event ingestion and atomic payment-to-entitlement activation.

- [ ] **Step 1: Add failing callback contract assertions**

Cover missing signature, invalid signature, stale timestamp, malformed body, unknown reference, amount mismatch, duplicate event, pending event, paid event, paid event for a superseded attempt, and out-of-order pending after paid.

- [ ] **Step 2: Implement raw-body callback handling**

The Route Handler must call `await request.text()` exactly once, verify the callback before JSON use, and construct its response from the verified provider contract captured in Task I0.

Keep the MVP boundary small: when provider readiness is disabled, return a redacted `503` before database mutation. Invalid signature, malformed JSON, or invalid/stale callback timestamp returns `400`; treat timestamps older than 10 minutes or more than 2 minutes in the future as stale. Valid processed/duplicate/ignored-forward-state callbacks return `{ "status": "ok" }` with `200`. A valid callback whose provider reference is not yet known returns redacted `503` so iPaymu may retry after payment persistence.

- [ ] **Step 3: Persist and process the event idempotently**

Within one database transaction or security-definer function:

1. Insert or load the unique provider event.
2. Lock payment and purchase.
3. Confirm reference and amounts.
4. Apply only a valid forward transition.
5. Call atomic paid activation for `paid`.
6. Mark the event processed.
7. Return the provider-required acknowledgement.

Implement this transaction as service-role-only `process_billing_provider_event(...)` in migration `004`, with an empty search path and no authenticated execution. Use `eventReference` as the unique provider event key and store the verified raw object only in the private provider-event table. Amount mismatch is persisted as a processed event with a stable `AMOUNT_MISMATCH` code, does not activate access, and returns the normal `200` acknowledgement to avoid permanent retries. Do not add reconciliation, notification, analytics, or refund behavior here.

- [ ] **Step 4: Verify duplicate and superseded payment behavior**

A duplicate callback must return the same acknowledgement without issuing another grant. A paid event for a superseded attempt must activate the purchase once and mark any other paid attempt on the purchase for duplicate review.

- [ ] **Step 5: Run focused contracts**

```bash
rtk node scripts/test-ipaymu-signature-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
rtk node scripts/test-billing-migration-contract.mjs
rtk git diff --check
```

Expected: all focused source contracts pass. Sandbox callback verification remains a separately approved check.

---

### Task I7: Add Reconciliation, Refund Recalculation, and Legacy Migration Tools

**Files:**
- Create: `lib/billing/server/reconciliation.ts`
- Create: `app/api/internal/reconcile-payments/route.ts`
- Modify: `supabase/migrations/202607160002_billing_functions.sql`
- Create: `scripts/test-billing-reconciliation-contract.mjs`

**Interfaces:**
- Consumes: admin client, provider inquiry, atomic activation, and verified legacy user list.
- Produces: bounded reconciliation, refund recalculation, and auditable one-user legacy grants.

- [ ] **Step 1: Write failing reconciliation contracts**

Assert bounded batch size, stale-pending selection, per-payment failure isolation, no secret logging, forward-only transitions, paid recovery, and terminal-state exclusion.

- [ ] **Step 2: Implement bounded reconciliation**

`reconcilePendingPayments({ limit: 50, olderThanMinutes: 2 })` selects pending or superseded attempts whose last check is stale, calls provider inquiry one at a time or under a small fixed concurrency, and processes results through the same event path as webhooks.

- [ ] **Step 3: Add the protected internal route**

Require `Authorization: Bearer ${BILLING_CRON_SECRET}` using constant-time comparison. Return aggregate counts only. Do not add `vercel.json` or enable a schedule without explicit configuration approval.

- [ ] **Step 4: Implement refund recalculation**

The admin-only function marks the paid payment refunded, revokes its grant, recalculates current access from remaining valid grants, and stores operator reference plus reason. It must not allow an end user to trigger refund mutation.

- [ ] **Step 5: Prepare verified legacy migration**

Call `admin_grant_legacy_entitlement` one reviewed user at a time from an approved administrative context. Record user ID, term or lifetime, verified expiry, evidence reference, and operator. Never infer lifetime from null expiry.

- [ ] **Step 6: Run focused contract and request operational review**

```bash
rtk node scripts/test-billing-reconciliation-contract.mjs
rtk git diff --check
```

Expected: PASS. Scheduler enablement, refund execution, and legacy migration execution remain separately approved operations.

---

### Task I8: Add First-Party Analytics and Resend Confirmation Email

**Files:**
- Create: `lib/billing/server/analytics.ts`
- Create: `app/api/analytics/route.ts`
- Create: `lib/billing/notifications/email.ts`
- Create: `lib/billing/notifications/resend.ts`
- Create: `lib/billing/notifications/payment-confirmation.ts`
- Create: `scripts/test-billing-notification-contract.mjs`
- Modify: `lib/billing/server/payments.ts`

**Interfaces:**
- Consumes: allowlisted analytics events, verified paid transition, user email, and safe payment projection.
- Produces: private first-party events and idempotent TutorLog payment-confirmation email.

- [ ] **Step 1: Write failing analytics and email contracts**

Assert the analytics allowlist, rejection of arbitrary event names, metadata size limit, removal of forbidden keys, payment email subject/body fields, absence of full VA/QR/signature, and use of `Idempotency-Key: payment-confirmation-<payment-id>`.

- [ ] **Step 2: Implement analytics ingestion**

Allow only the events in the design spec. Attach authenticated user ID server-side. Accept package code, surface, paywall reason, payment method, normalized state, and request correlation ID. Reject or delete keys named `signature`, `qr`, `qrPayload`, `vaNumber`, `raw`, `token`, or `secret`.

- [ ] **Step 3: Define the email adapter**

```ts
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

export interface EmailSender {
  send(input: SendEmailInput): Promise<{ messageId: string }>;
}
```

- [ ] **Step 4: Implement Resend over native fetch**

Use:

```text
RESEND_API_KEY
BILLING_EMAIL_FROM
BILLING_SUPPORT_EMAIL
```

POST to `https://api.resend.com/emails` with `Authorization: Bearer`, JSON content, and `Idempotency-Key`. Use `AbortSignal.timeout(10000)`. Redact response errors. Domain verification is a deployment gate.

- [ ] **Step 5: Send after durable activation**

Email delivery occurs after the database transaction commits. Failure records an operational error but never rolls back payment or entitlement. Retry uses the same idempotency key.

- [ ] **Step 6: Run focused contracts**

```bash
rtk node scripts/test-billing-notification-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
rtk git diff --check
```

Expected: PASS without calling Resend. A real email requires verified domain, API key, network approval, and a test recipient approved by the user.

---

### Task I9: Integration Verification and UI Handoff

**Files:**
- Review: all files listed in this plan
- Update after verified evidence: `docs/superpowers/specs/2026-07-16-pricing-paywall-payment-design.md`
- Update contract handoff only if changed: `lib/billing/contracts.ts`

**Interfaces:**
- Consumes: completed Integration/Data tasks.
- Produces: stable DTO contract, sandbox evidence, migration rehearsal result, and an explicit UI integration handoff.

- [ ] **Step 1: Run the approved focused contract set**

Only after the user selects the checks to run:

```bash
rtk node scripts/test-billing-contract.mjs
rtk node scripts/test-billing-migration-contract.mjs
rtk node scripts/test-ipaymu-signature-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
rtk node scripts/test-billing-reconciliation-contract.mjs
rtk node scripts/test-billing-notification-contract.mjs
rtk node scripts/test-quota-access-contract.mjs
rtk git diff --check
```

Expected: each approved focused contract prints its success message and exits zero.

- [ ] **Step 2: Rehearse migrations in an approved sandbox**

Apply migrations only to the approved sandbox. Verify catalog rows, RLS, unauthenticated denial, user-owned reads, service-role webhook mutation, one-grant idempotency, term renewal, lifetime, refund recalculation, and legacy grant behavior.

- [ ] **Step 3: Exercise approved iPaymu sandbox cases**

Verify QRIS pending/paid/expired, VA pending/paid/expired, delayed callback, duplicate callback, amount mismatch, superseded attempt later paid, inquiry recovery, and callback retry acknowledgement.

Only after these cases and the Task I0 deferred evidence matrix pass review may `BILLING_PAYMENT_PROVIDER_ENABLED` be approved for a non-production environment. Production enablement remains a separate approval.

- [ ] **Step 4: Publish the UI handoff evidence in the task summary**

Provide:

```text
catalog DTO examples
checkout quote examples for QRIS and VA
pending, verifying, paid, expired, failed, and duplicate-review PaymentStatusView examples
free, term-active, expired, and lifetime AccessSummary examples
safe LatestPaymentSummary example
normalized error-code table
```

- [ ] **Step 5: Stop before rollout**

Before merge or sync to `develop`, ask whether to run or skip tests, responsive sweep, accessibility check, visual regression, and PDF export test as required by repository policy. Production environment changes, migrations, scheduler, push, PR, and deploy each require separate approval.
