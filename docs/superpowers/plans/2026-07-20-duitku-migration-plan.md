# Duitku Payment Gateway Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace iPaymu with Duitku as the payment provider while keeping the existing `PaymentProvider` interface seam intact.

**Tech Stack:** Next.js App Router, TypeScript, HMAC-SHA256 signing, Supabase.

**Predecessor:** The current `feat/pricing-checkout-ui` branch merged to `develop`. The `PaymentProvider` interface and fallback catalog are already in place.

## Global Constraints

- The `PaymentProvider` interface must not change.
- UI code must not import Duitku types.
- Database `provider` column stores `"duitku"` for new payments.
- Existing `"ipaymu"` rows remain valid (historical).
- `BILLING_PAYMENT_PROVIDER_ENABLED` remains the master gate.
- Sandbox testing is required before production credentials.
- Callback URL changes require webhook route update.

---

### Task 1: Create Duitku signature module

**Files:**
- Create: `lib/billing/providers/duitku-signature.ts`

**Purpose:** HMAC-SHA256 signing for Duitku API requests and callback verification.

- [ ] **Step 1: Implement request signing**

```ts
// Signature formulas (all output hex lowercase):
// Create/Inquiry:  HMAC_SHA256(merchantCode + merchantOrderId + paymentAmount, apiKey)
// Status check:    HMAC_SHA256(merchantCode + merchantOrderId, apiKey)
// Callback verify: HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)
```

- [ ] **Step 2: Implement callback verification**

Parse `x-www-form-urlencoded` body, extract `signature` field, compute expected signature, constant-time compare.

- [ ] **Step 3: Implement state mapping**

Map Duitku `statusCode`/`resultCode` to normalized states:
- `"00"` -> `"paid"`
- `"01"` -> `"pending"` (inquiry) or `"failed"` (callback)
- `"02"` -> `"canceled"`

- [ ] **Step 4: Write signature contract test**

Add to `scripts/test-duitku-signature-contract.mjs`:
- Known-input signature generation.
- Callback verification with valid signature.
- Callback rejection with tampered signature.

---

### Task 2: Create Duitku provider adapter

**Files:**
- Create: `lib/billing/providers/duitku.ts`

**Purpose:** Implement `PaymentProvider` interface for Duitku.

- [ ] **Step 1: Implement `createPayment()`**

Map `CreateProviderPaymentInput` to Duitku inquiry request:
- `purchaseId` -> `merchantOrderId` (with `TL-` prefix)
- `amount` -> `paymentAmount`
- `method` -> `paymentMethod` (`"qris"` -> `"SP"`, `"va"` -> `"BC"`)
- Build `customerDetail`, `itemDetails` (single item: "TutorLog Plus")
- Sign with HMAC-SHA256
- POST to `${DUITKU_BASE_URL}/webapi/api/merchant/v2/inquiry`
- Map response to `ProviderPaymentResult`
- Handle `qrString` and `vaNumber` in provider-response summary

- [ ] **Step 2: Implement `getPaymentStatus()`**

Map reference to Duitku transaction status request:
- `merchantOrderId` = reference (strip `TL-` prefix if stored that way)
- Sign with `HMAC_SHA256(merchantCode + merchantOrderId, apiKey)`
- POST to `${DUITKU_BASE_URL}/webapi/api/merchant/transactionStatus`
- Map `statusCode` to normalized state
- Return `fee` as `channelFee`

- [ ] **Step 3: Implement `cancelPayment()`**

Duitku has no direct cancel API. Return `{ accepted: true }` and let transaction expire naturally.

- [ ] **Step 4: Implement `verifyCallback()`**

Parse `x-www-form-urlencoded` body:
- Extract all callback fields
- Verify `signature` = `HMAC_SHA256(merchantCode + amount + merchantOrderId, apiKey)`
- Map `resultCode` to normalized state
- Return `VerifiedProviderEvent` with full raw payload

- [ ] **Step 5: Implement `createPaymentProvider()` factory**

Read env vars: `DUITKU_MERCHANT_CODE`, `DUITKU_API_KEY`, `DUITKU_BASE_URL`, `DUITKU_CALLBACK_URL`, `DUITKU_RETURN_URL`. Return `DuitkuProvider` instance.

---

### Task 3: Create Duitku webhook route

**Files:**
- Create: `app/api/webhooks/duitku/route.ts`

**Purpose:** Receive Duitku callback POST and process payment event.

- [ ] **Step 1: Implement POST handler**

```ts
export async function POST(request: Request) {
  // 1. Read raw body as text
  // 2. Call processDuitkuCallback(rawBody, request.headers)
  // 3. Return { status: "ok" } on success
  // 4. Map BillingError to appropriate HTTP status
}
```

- [ ] **Step 2: Implement `processDuitkuCallback()` in `payments.ts`**

Similar to existing `processIpaymuCallback()`:
- Check `BILLING_PAYMENT_PROVIDER_ENABLED`
- Call `provider.verifyCallback()`
- Validate event timestamp (within -10min to +2min)
- Call Supabase RPC `process_billing_provider_event` with `p_provider: "duitku"`

---

### Task 4: Update provider factory and contracts

**Files:**
- Modify: `lib/billing/providers/index.ts`
- Modify: `lib/billing/contracts.ts`

- [ ] **Step 1: Update provider factory**

`lib/billing/providers/index.ts`:
```ts
import { createPaymentProvider as createDuitkuProvider } from "./duitku";
import { createPaymentProvider as createIpaymuProvider } from "./ipaymu";

export function createPaymentProvider() {
  if (process.env.DUITKU_MERCHANT_CODE) {
    return createDuitkuProvider();
  }
  return createIpaymuProvider();
}
```

- [ ] **Step 2: Widen provider type in contracts**

`lib/billing/contracts.ts`:
Change `provider: "ipaymu"` to `provider: "ipaymu" | "duitku"` in `PaymentStatusView`.

---

### Task 5: Update server payment processing

**Files:**
- Modify: `lib/billing/server/payments.ts`
- Modify: `lib/billing/server/purchases.ts`

- [ ] **Step 1: Accept `"duitku"` provider in payment status mapping**

In `toPaymentStatus()`, accept both `"ipaymu"` and `"duitku"` as valid provider values.

- [ ] **Step 2: Update callback URL sources**

In `purchases.ts`, read `DUITKU_CALLBACK_URL` and `DUITKU_RETURN_URL` with fallback to iPaymu vars.

- [ ] **Step 3: Add `processDuitkuCallback()` function**

Similar to `processIpaymuCallback()` but with Duitku-specific verification and `p_provider: "duitku"`.

---

### Task 6: Update environment and config

**Files:**
- Modify: `.env.local` (or `.env.example`)
- Modify: `.gitignore` if needed

- [ ] **Step 1: Add Duitku env vars**

```bash
DUITKU_MERCHANT_CODE=
DUITKU_API_KEY=
DUITKU_BASE_URL=https://sandbox.duitku.com
DUITKU_CALLBACK_URL=http://localhost:3000/api/webhooks/duitku
DUITKU_RETURN_URL=http://localhost:3000/pembayaran
```

- [ ] **Step 2: Update fixtures**

`lib/billing/fixtures.ts`: Change `provider: "ipaymu"` to `provider: "duitku"` in test fixtures.

---

### Task 7: Sandbox verification

**Files:**
- Create: `scripts/test-duitku-sandbox-flow.mjs`

**Purpose:** End-to-end sandbox flow test.

- [ ] **Step 1: Create sandbox test script**

Script that:
1. Registers a sandbox transaction via Duitku API
2. Verifies the response contains `reference`, `paymentUrl`, `statusCode: "00"`
3. Simulates callback with correct signature
4. Verifies callback signature validation passes

- [ ] **Step 2: Run sandbox flow test**

Execute with real Duitku sandbox credentials. Document results.

---

### Task 8: Cleanup iPaymu references

**Files:**
- Modify: Remove or archive iPaymu-specific files (after Duitku is verified in sandbox)

- [ ] **Step 1: Remove iPaymu provider files** (post-verification)

Files to remove:
- `lib/billing/providers/ipaymu.ts`
- `lib/billing/providers/ipaymu-signature.ts`
- `app/api/webhooks/ipaymu/route.ts`
- `scripts/test-ipaymu-signature-contract.mjs`

- [ ] **Step 2: Remove iPaymu env vars**

Clean up `.env.local` and any docs referencing iPaymu env vars.

- [ ] **Step 3: Update design docs**

Mark iPaymu as deprecated in `2026-07-16-pricing-paywall-payment-design.md`.

---

## Verification Checklist

After all tasks:

- [ ] `npm run build` passes
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run lint` — no new errors
- [ ] Duitku sandbox transaction creates successfully
- [ ] Callback signature verification works
- [ ] Status check returns correct state
- [ ] Webhook endpoint receives and processes callbacks
- [ ] Checkout displays correct channel fees
- [ ] QRIS QR string renders correctly
- [ ] VA number displays correctly
- [ ] Payment status page shows correct states
- [ ] `BILLING_PAYMENT_PROVIDER_ENABLED=false` still fails closed

## Migration Checklist

Before production:

- [ ] Duitku production account approved
- [ ] Production API keys obtained
- [ ] Callback URL updated to production domain
- [ ] IP whitelist configured (if using Vercel, may need relay)
- [ ] `DUITKU_BASE_URL` updated to production
- [ ] Production QRIS and VA transaction tested
- [ ] Settlement verification
- [ ] Old iPaymu env vars removed
