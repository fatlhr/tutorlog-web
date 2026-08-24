# TutorLog Pricing, Paywall, and Payment Design

**Status:** Current product/domain design; provider flow updated 2026-08-24

**Original date:** 2026-07-16

**Current payment direction:** Lynk.id external checkout with signed successful-transaction webhook

**Provider design:** `2026-08-24-lynk-webhook-integration-design.md`

**Implementation plan:** `../plans/2026-08-24-lynk-webhook-integration.md`

## 1. Purpose

This document defines the stable TutorLog Plus product, entitlement, paywall, and access
rules. Lynk.id owns checkout and payment collection. TutorLog owns user matching, payment
evidence, entitlement activation, access projection, and feature authorization.

The detailed webhook contract, security model, rollout gates, and operational behavior live
in the provider design linked above. If this overview conflicts with that document, the
2026-08-24 provider design wins for payment processing.

## 2. Packages

| Package | Price | Duration | Package code |
| --- | ---: | --- | --- |
| Free | Rp0 | No paid entitlement | `free` |
| Plus 30 Hari | Rp19.000 | Exactly 30 days | `plus_30d` |
| Plus 12 Bulan | Rp149.000 | 12 calendar months | `plus_12m` |
| Plus Selamanya | Rp249.000 | Lifetime | `plus_lifetime` |

Rules:

- Plus 12 Bulan is presented as `Paling hemat`.
- Plus Selamanya is presented as `Sekali bayar`.
- Paid packages do not auto-renew.
- Every accepted payment retains product, duration, price, and external evidence snapshots.
- Future price changes do not modify previous purchases.

## 3. Renewal and lifetime

- A term purchase starts from the later of payment time or the current term expiry.
- Early renewal does not discard remaining paid time.
- A lifetime grant immediately makes access lifetime.
- A later term payment cannot downgrade lifetime access.
- Lifetime is explicit entitlement metadata; `active_until = null` by itself is insufficient.
- One external payment event may create at most one entitlement grant.

## 4. Free and Plus access

Free users retain the product's free limits. Plus users receive:

- Unlimited recap export under the current Plus contract.
- Invoice PDF download.
- Plus access until the term expiry or without expiry for lifetime.

The server remains authoritative. UI visibility, local state, a Lynk success page, a receipt,
or a return URL cannot bypass `billing_access_status_for_user` and export authorization.

## 5. Checkout

Paid CTAs open the published Lynk product pages:

| Package code | Checkout URL |
| --- | --- |
| `plus_30d` | `https://lynk.id/tutorlog/q51pn0rykvq9` |
| `plus_12m` | `https://lynk.id/tutorlog/gjvmgkznjqd6` |
| `plus_lifetime` | `https://lynk.id/tutorlog/65p8z7ewqj8r` |

TutorLog does not select payment methods, add channel fees, create provider transactions,
poll payment status, cancel provider transactions, or trust browser-return state.

The buyer must enter the same email used by their existing TutorLog account. Checkout data
never creates a new TutorLog account automatically.

## 6. Payment evidence and activation

The only automatic activation input is a valid Lynk `payment.received` webhook.

Activation requires all of the following:

- Valid `X-Lynk-Signature` using the configured merchant key.
- Supported success event and payload shape proven by Test URL.
- One known allowlisted product.
- Exact active catalog amount.
- Exactly one existing TutorLog user matching the normalized customer email.
- Unique external event/reference that has not already issued a grant.

If any business match fails, store the event as `needs_review` without issuing access. If
signature or payload integrity fails, reject the request before database mutation.

## 7. Data ownership

Supabase/Postgres remains the source of truth for:

- Product catalog and active prices.
- Immutable purchase snapshots.
- Payment evidence used by TutorLog.
- Private webhook inbox and review status.
- Entitlement grants and current access projection.
- Feature authorization and first-party analytics.

Lynk remains the source of truth for checkout, payment collection, settlement, payout,
platform fees, and refund actions performed on its platform.

## 8. Required routes

User-facing routes:

```text
/harga
/app
/app/profil
```

Provider boundary:

```text
POST /api/webhooks/lynk
```

The internal `/checkout` and `/pembayaran/[purchaseId]` routes are not part of new Lynk
sales. They may remain temporarily for historical data until the legacy runtime is audited.

## 9. Paywall and account surfaces

- Public pricing and protected paywalls use one package-to-Lynk URL mapping.
- Each checkout CTA reminds the buyer to use their TutorLog account email.
- Profile reads the existing Supabase access projection.
- Support copy directs unresolved activation to `halo@tutorlog.id` with the Lynk transaction
  number and TutorLog account email.
- A `needs_review` event must not expose whether an email exists through public responses.

## 10. Refunds

- Refund requests follow Lynk's checkout/refund process and TutorLog's published terms.
- TutorLog support reviews the external order evidence before revoking access.
- Until a signed refund event is documented and tested, entitlement revocation is manual.
- Every manual change requires an evidence reference and audit trail.
- A refund of one purchase must not revoke unrelated valid grants.

## 11. Privacy and logging

- Webhook payloads are untrusted private data.
- Raw payload access is restricted to `service_role`.
- Merchant key, signature, phone, customer email, and raw payload are absent from normal logs.
- Responses are redacted and never disclose user lookup results.
- Privacy and terms must identify Lynk's checkout/payment role before paid promotion.

## 12. Rollout boundary

Paid product pages may remain published while integration is being prepared, but they must not
be promoted as automatically activated until production verification succeeds.

Automatic processing remains disabled until:

- Test URL payload shape is captured and redacted.
- Signature verification passes with the account merchant key.
- Product, amount, and email mapping tests pass.
- Database idempotency and `needs_review` behavior pass.
- A real Plus 30 Hari purchase creates exactly one 30-day entitlement.
- Duplicate delivery creates no additional access.
- Profile and export authorization reflect the grant.

## 13. Out of scope

- Provider API transaction creation.
- Payment-method UI inside TutorLog.
- Inquiry, polling, cancellation, or provider return flow.
- Multi-item carts, add-ons, discounts, shipping, and pay-what-you-want activation.
- Automatic account creation from checkout.
- Automatic refund processing without a verified signed event.
- Changes to session, student, recap, invoice calculation, or mobile billing semantics.

## 14. Acceptance criteria

- All paid CTAs use the correct Lynk product URL.
- A valid signed event creates one purchase, one paid payment, and one entitlement.
- Term renewal and lifetime behavior remain consistent with existing billing functions.
- Duplicate, unknown user, unknown product, and amount mismatch cannot duplicate or issue access.
- Sensitive provider/customer data is absent from public responses and application logs.
- Existing web and mobile clients continue to receive access through the same Supabase projection.
