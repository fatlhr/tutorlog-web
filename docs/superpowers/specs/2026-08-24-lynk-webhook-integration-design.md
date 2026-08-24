# TutorLog Lynk.id Webhook Integration Design

**Status:** Approved direction; implementation not started

**Date:** 2026-08-24

**Decision:** Lynk.id owns checkout and payment execution. TutorLog owns account matching,
payment evidence, entitlement activation, feature authorization, and support review.

**Implementation plan:** `docs/superpowers/plans/2026-08-24-lynk-webhook-integration.md`

## 1. Purpose

This document replaces the planned payment-gateway integration with an external checkout
and signed-webhook flow using the published products at `https://lynk.id/tutorlog`.

TutorLog will not call a provider API to create, inspect, cancel, or refund transactions.
The only automatic provider input is a successful-transaction webhook from Lynk.id.

## 2. Public products

| TutorLog package code | Lynk product | Price | Public URL |
| --- | --- | ---: | --- |
| `plus_30d` | TutorLog Plus — 30 Hari | Rp19.000 | `https://lynk.id/tutorlog/q51pn0rykvq9` |
| `plus_12m` | TutorLog Plus — 12 Bulan | Rp149.000 | `https://lynk.id/tutorlog/gjvmgkznjqd6` |
| `plus_lifetime` | TutorLog Plus — Selamanya | Rp249.000 | `https://lynk.id/tutorlog/65p8z7ewqj8r` |

The product description tells the buyer to enter the same email used by their TutorLog
account. Checkout must not create a TutorLog account automatically.

## 3. Authority and boundaries

Supabase remains authoritative for:

- TutorLog product codes, duration, and price snapshots.
- TutorLog user identity.
- Purchase and payment evidence used by TutorLog.
- Term and lifetime entitlement grants.
- Current access status and export authorization.

Lynk.id remains authoritative for:

- Checkout form and payment-method presentation.
- Payment collection and payment-success determination.
- Lynk order/reference identifiers.
- Settlement, payout, platform fee, and refund operations performed in Lynk.

The browser cannot mark a payment as paid or issue an entitlement. A webhook return URL,
query parameter, screenshot, email receipt, or user-submitted transaction number is not
sufficient evidence for automatic activation.

## 4. Target flow

```text
/harga or paywall
  -> public Lynk product URL
  -> buyer completes Lynk checkout with TutorLog account email
  -> Lynk sends payment.received
  -> POST /api/webhooks/lynk
  -> verify X-Lynk-Signature
  -> parse and validate event
  -> match product, exact amount, and TutorLog user email
  -> atomically store inbox event + purchase + payment + entitlement
  -> existing access projection exposes Plus to web and mobile
```

The new-sales flow does not use `/checkout`, `/pembayaran/[purchaseId]`, provider inquiry,
payment polling, payment cancel, or provider return URLs.

## 5. Webhook contract

### 5.1 Officially documented facts

Lynk documents a successful-transaction webhook with:

- Event purpose: successful payment notification.
- Header: `X-Lynk-Signature`.
- Signed values: `grandTotal`, `refId`, and `message_id`.
- Secret: merchant key shown after a webhook URL is saved.
- Signature algorithm: lower-hex SHA-256.

Canonical input:

```text
String(grandTotal) + refId + message_id + merchantKey
```

References:

- `https://lynk.id/faq/detail/6908cd80402bd9e753aa85e0-4149-956987938`
- `https://documenter.getpostman.com/view/43601478/2sBXc8o3kn`

### 5.2 Evidence gate

The public documentation does not fully freeze the nested JSON payload or a stable product
identifier. Before activation code is allowed to grant access, TutorLog must capture a real
`Test URL` request from the Lynk dashboard and record a redacted fixture.

The fixture must prove the actual paths and types for:

- Event name and success marker.
- `message_id`.
- `refId`.
- `grandTotal`.
- Transaction timestamp.
- Customer email.
- Item collection and stable product identity, if provided.

The capture endpoint must not create purchases, payments, users, or entitlements.

### 5.3 Signature verification

Verification rules:

- Read `X-Lynk-Signature` case-insensitively.
- Require exactly one non-empty signature value.
- Parse `grandTotal` as a non-negative safe integer without decimal coercion.
- Reject missing or ambiguous `refId` and `message_id`.
- Calculate SHA-256 with the exact string representation proven by the captured fixture.
- Compare lower-hex values with a constant-time comparison.
- Never log the merchant key or received signature.

Invalid signatures are rejected before any database mutation.

## 6. Product and amount mapping

Automatic activation uses an explicit allowlist. URL slugs are suitable for outbound links
but must not be assumed to appear in webhook payloads.

Preferred mapping order:

1. Stable Lynk item/product ID proven by the captured payload.
2. If no stable ID exists, exact canonical item title plus exact catalog amount.

Initial activation does not support carts containing multiple products, add-ons, shipping,
discounted totals, pay-what-you-want amounts, or an amount different from the active TutorLog
price. Such events are stored as `needs_review` and never grant access automatically.

## 7. User matching

The webhook customer email is normalized with trim and lowercase, then resolved against
`auth.users` inside a security-definer RPC callable only by `service_role`.

Rules:

- Exactly one matching existing user is required.
- Zero matches produce `needs_review` with reason `user_not_found`.
- More than one match produces `needs_review` with reason `user_ambiguous`.
- The webhook never creates a user or changes an account email.
- Support may resolve a review only after confirming the Lynk order and TutorLog account.

## 8. Atomic persistence

The existing `billing_provider_events` table requires a known user and payment, so it cannot
safely receive unmatched external events. Add a private webhook inbox that can exist before
user resolution.

Required inbox fields:

- Provider (`lynk`).
- Event key and provider reference.
- Event type and occurred/received timestamps.
- Customer email used for matching.
- Reported amount and resolved package code.
- Redacted/private raw payload.
- Processing status and stable review reason.
- Nullable user, purchase, and payment references.

Required statuses:

- `received`
- `processed`
- `needs_review`
- `rejected`

The processing RPC must:

1. Claim a unique event key.
2. Return the stored outcome for a duplicate.
3. Resolve user, product, and amount.
4. Insert a purchase with immutable catalog snapshots.
5. Insert a pending payment with provider `lynk` and the reported amount.
6. Call the existing `apply_billing_paid_event` function.
7. Link the resulting purchase/payment to the inbox row.
8. Commit all mutations in one transaction.

A duplicate webhook must never extend access twice.

## 9. HTTP behavior

`POST /api/webhooks/lynk` returns:

| Condition | Response |
| --- | --- |
| Processed entitlement | `200 {"status":"ok"}` |
| Duplicate already recorded | `200 {"status":"ok"}` |
| Stored for manual review | `200 {"status":"review"}` |
| Malformed JSON or unsupported shape | `400` |
| Missing or invalid signature | `401` |
| Webhook disabled or merchant key unavailable | `503` |
| Temporary database failure | `503` |

Business mismatches that have been safely recorded return `200` so Lynk does not repeatedly
send an event that requires human review. Infrastructure failures return `503` to permit retry.

## 10. Runtime configuration

Required runtime values:

```text
LYNK_MERCHANT_KEY
LYNK_WEBHOOK_ENABLED
LYNK_WEBHOOK_CAPTURE_ONLY
```

`LYNK_MERCHANT_KEY` is a Cloudflare secret. The flags may be non-secret runtime variables.

Safe rollout states:

| State | `ENABLED` | `CAPTURE_ONLY` | Behavior |
| --- | --- | --- | --- |
| Disabled | `false` | either | Return `503`, no mutation |
| Contract capture | `true` | `true` | Verify/capture only, no entitlement |
| Production processing | `true` | `false` | Validate and process atomically |

The webhook URL configured in the Lynk `@tutorlog` account is:

```text
https://tutorlog.id/api/webhooks/lynk
```

## 11. UI changes

- `/harga` and paywall CTAs open the correct Lynk product URL.
- CTA copy states that checkout is processed by Lynk.id.
- Near the CTA, remind buyers to use their TutorLog account email.
- Existing access summary and export gating remain driven by Supabase entitlement state.
- New Lynk purchases do not use internal pending-payment polling.
- Support instructions use `halo@tutorlog.id` and ask for the Lynk transaction number plus
  TutorLog account email.

## 12. Security and privacy

- Verify signatures before any entitlement mutation.
- Keep raw webhook payload private to `service_role`.
- Redact email, phone, signature, merchant key, and raw payload from application logs.
- Treat item title, customer name, email, and all payload strings as untrusted input.
- Enforce payload size and JSON depth limits in the route parser.
- Use database uniqueness for replay protection; timestamps alone are insufficient.
- Do not expose whether a customer email exists through the webhook response.
- Update privacy and terms before promoting paid checkout so Lynk's processing role is clear.

## 13. Operations

Webhook History in Lynk and the TutorLog inbox are the first-line evidence sources.

Because this integration does not rely on payment inquiry:

- Reconciliation compares Lynk Orders/export against TutorLog webhook inbox and payments.
- `needs_review` events are retried through a reviewed operator action.
- Refunds are handled in Lynk and then reflected manually in TutorLog until a verified refund
  event is available.
- Email confirmation is sent only after entitlement creation and cannot roll it back.

## 14. Rollout gates

Production processing remains disabled until all gates pass:

- Correct Lynk account is `@tutorlog`.
- Test URL request captured and redacted fixture reviewed.
- Merchant key stored as a Cloudflare secret.
- Signature vectors pass locally and in Cloudflare preview.
- Product identity and amount mapping use captured evidence.
- Duplicate, unmatched email, unknown product, and amount mismatch tests pass.
- One real Plus 30 Hari purchase creates one 30-day entitlement.
- Replaying that event creates no additional entitlement.
- Profile and export authorization show the new access.
- Support/reconciliation instructions are documented.

## 15. Out of scope

- Creating payments through a provider API.
- Payment-method selection inside TutorLog.
- Payment polling, inquiry, cancellation, or provider return routes.
- Automatic account creation from checkout email.
- Multi-item carts, add-ons, discounts, shipping, and pay-what-you-want.
- Automatic refunds before a verified Lynk refund event exists.
- Changing session, student, recap, invoice calculation, or mobile billing contracts.

## 16. Acceptance criteria

- A valid signed `payment.received` for a known product, exact amount, and existing user
  creates one purchase, one paid payment, and one entitlement.
- Thirty-day and twelve-month renewals extend from the later of payment time or current expiry.
- Lifetime access remains lifetime and cannot be downgraded by a later term event.
- Duplicate delivery is idempotent.
- Invalid signature causes no database mutation.
- Unknown user, product, amount, or multi-item order causes no entitlement.
- Sensitive webhook data is absent from responses and normal logs.
- `/harga` and paywalls point to the correct three Lynk products.
- Existing web/mobile access projection continues to read the same entitlement authority.
