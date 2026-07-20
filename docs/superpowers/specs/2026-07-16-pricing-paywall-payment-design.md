# TutorLog Pricing, Paywall, and Payment Design

**Status:** Approved

**Date:** 2026-07-16

**Architecture direction:** Domain-first payment and entitlement system with a Duitku payment provider

**Provider update (2026-07-20):** Duitku Payment Gateway (PT Kharisma Catur Mandala) replaces iPaymu as the payment provider. See `2026-07-20-duitku-migration-design.md` for the migration spec and `2026-07-20-duitku-migration-plan.md` for the implementation plan. The `PaymentProvider` interface remains unchanged; only the adapter implementation changes.

**Implementation boundary:** UI/Product and Integration/Data are separate workstreams joined through a typed application contract.

## 1. Purpose

This document defines the pricing, checkout, payment, entitlement, paywall, and mobile compatibility design for TutorLog Plus.

The design replaces the current hardcoded Lynk purchase flow with a TutorLog-owned purchase and entitlement domain. iPaymu is the first payment provider, but provider-specific objects must not leak into UI components, product rules, or mobile access contracts.

This document is a design contract only. It does not authorize implementation, tests, branch changes, commits, provider activation, database migration, or production rollout.

## 2. Authority and boundaries

Authority order:

1. The product decisions recorded in this document.
2. `AGENTS.md`.
3. Existing route, auth, invoice, recap, and export behavior unless explicitly changed here.
4. Existing protected-app visual system and shared UI contracts.
5. iPaymu's verified merchant and sandbox behavior.

This design changes:

- Public pricing packages and copy.
- The purchase path from external Lynk links to TutorLog checkout.
- Payment and entitlement data contracts.
- Paywall destinations and access-state presentation.
- Payment status, transaction summary, and confirmation email behavior.
- Server authorization for recap and invoice export.

This design does not change:

- Session, student, recap filter, invoice field, or invoice calculation contracts.
- Invoice template appearance or browser-based PDF rendering in the MVP.
- Supabase Auth magic-link behavior except for returning the user to the selected checkout.
- Core protected-app navigation and visual tokens.
- Mobile payment processing. All payments remain on the web.
- Legal wording until the business identity, refund contact, and provider requirements are verified.

## 3. Approved product decisions

### 3.1 Packages

| Package | Price at launch | Duration | Availability |
| --- | ---: | --- | --- |
| Free | Rp0 | No paid entitlement | Permanent |
| Plus 30 Hari | Rp19.000 | Exactly 30 days | Permanent |
| Plus 12 Bulan | Rp149.000 | 12 calendar months | Permanent |
| Plus Selamanya | Rp249.000 initially | Lifetime | Permanent, with no buyer or time limit |

Additional rules:

- Plus 12 Bulan is the featured package on `/harga`.
- The annual saving is Rp79.000 compared with twelve 30-day purchases at the launch price.
- Plus Selamanya remains available, but its price may change for future purchases.
- A purchase always retains its package, duration, price, and fee snapshot.
- There is no auto-renewal.

### 3.2 Renewal and lifetime

- A term purchase extends from the later of the current time or the existing expiry.
- Remaining paid access is not discarded during an early renewal.
- A successful lifetime purchase immediately replaces a term entitlement.
- Remaining term access is not converted into credit or a partial refund.
- A lifetime user cannot purchase another Plus package.
- Lifetime is explicit metadata. `active_until = null` alone does not prove lifetime.

### 3.3 Refund

- A refund request must be submitted within seven days of the payment.
- Refunds are limited to duplicate payment, wrong amount, or a paid entitlement that failed to activate.
- Requests are reviewed manually.
- A validated refund revokes the grant created by the refunded purchase.
- Entitlement is recalculated from the user's remaining valid grants.

### 3.4 Payment methods and fees

- QRIS is the default method.
- TutorLog absorbs the QRIS merchant fee.
- Virtual Account is the secondary method.
- The user pays the exact VA channel fee reported by the configured provider contract.
- Checkout shows package price, channel fee, and total before creating a payment.
- Provider settlement and withdrawal costs are internal business costs and are not added as separate user fees.

## 4. Architecture

### 4.1 Domain ownership

Supabase/Postgres is the source of truth for:

- Product catalog and active prices.
- Purchase intent and immutable commercial snapshots.
- Provider payment attempts.
- Provider callback and reconciliation events.
- Entitlement grants and current access projection.
- First-party funnel events.

Duitku (PT Kharisma Catur Mandala) owns payment execution and provider status. It does not own TutorLog product definitions or final access rules.

The browser may request actions and display status. It cannot mark a payment as paid, issue an entitlement, alter a price, or write provider events.

### 4.2 Provider boundary

Payment integration must implement an internal provider interface comparable to:

```ts
interface PaymentProvider {
  createPayment(input: CreateProviderPaymentInput): Promise<ProviderPaymentResult>;
  getPaymentStatus(reference: string): Promise<ProviderPaymentStatus>;
  cancelPayment(reference: string): Promise<ProviderCancellationResult>;
  verifyCallback(request: ProviderCallbackRequest): Promise<VerifiedProviderEvent>;
}
```

Rules:

- UI code does not import iPaymu types.
- Database product codes do not use iPaymu identifiers.
- Provider statuses are normalized before reaching the payment domain.
- Raw provider responses remain private server data.
- A future provider can be added without rewriting pricing, paywall, entitlement, or mobile contracts.

### 4.3 MVP provider mode

The intended MVP uses Duitku Payment Gateway via redirect to their payment page (`paymentUrl`). QRIS and VA are the primary methods.

This choice remains conditional until sandbox verification confirms:

- TutorLog's SaaS or digital-access business is allowed for the merchant account and API product.
- Redirect can present the required QRIS and VA options.
- Channel fee, expiry, return state, and provider reference are available with sufficient clarity.
- Callback, inquiry, cancellation, and retry behavior match the required state machine.

If Redirect cannot meet these requirements, Duitku POP (popup/iframe) becomes the fallback without changing the product, purchase, or entitlement domain. See `2026-07-20-duitku-migration-design.md` for the full provider comparison.

### 4.4 Application routes and endpoints

Proposed user-facing routes:

```text
/harga
/checkout?package=<package-code>
/pembayaran/<purchase-id>
```

`/checkout` and `/pembayaran/<purchase-id>` require authentication. The purchase identifier must be opaque and access-controlled. A provider return points to the payment-status route and adds no trusted payment state of its own.

Proposed server boundary:

```text
GET  /api/products
POST /api/quotes
POST /api/purchases
GET  /api/purchases/<purchase-id>
POST /api/payments/<payment-id>/cancel
POST /api/webhooks/duitku
```

The exact Next.js file placement may change during implementation planning, but these application responsibilities and response contracts remain stable. Server components may query the same application services directly where an HTTP endpoint adds no value.

## 5. Data model

All schema changes must be versioned under `supabase/migrations/`.

### 5.1 Catalog

`products` owns stable package identity and availability.

`product_prices` owns price versions, currency, channel-independent base amount, and activation time.

The first phase has no pricing admin UI. Authorized operators update the catalog through Supabase Dashboard or reviewed SQL. Existing purchases are unaffected because they retain snapshots.

### 5.2 Purchases

A purchase represents the user's commercial intent for one selected package.

It stores at least:

- User ID.
- Product and price-version references.
- Package code, display name, duration, base amount, and currency snapshots.
- Purchase state.
- Created and completed timestamps.

### 5.3 Payments

A payment represents one provider attempt for a purchase.

It stores at least:

- Purchase and user references.
- Provider and provider reference.
- Method, base amount, channel fee, and total amount.
- Normalized state and provider state.
- Expiry, paid, canceled, and last-checked timestamps.
- Whether the attempt was superseded by a user-requested method change.
- A private provider-response summary suitable for support and reconciliation.

Only one payment attempt is treated as active for a purchase.

### 5.4 Provider events

`provider_events` stores private callback and inquiry evidence.

Requirements:

- Unique provider event or external reference.
- Signature-verification result.
- Received timestamp and normalized event type.
- Private raw payload with restrictive access.
- Processing result and linked payment.
- Safe replay of an already-processed event.

### 5.5 Entitlement grants

Each successful purchase creates at most one entitlement grant.

A grant stores:

- User and purchase references.
- `term` or `lifetime` type.
- Start and end timestamps for term access.
- Explicit lifetime flag.
- Active, revoked, or refunded state.
- Creation and revocation reason.

The current-access projection exposes normalized access without discarding the immutable grant history.

### 5.6 Analytics

First-party analytics records product and funnel context only.

Allowed event examples:

- `pricing_viewed`
- `package_selected`
- `paywall_opened`
- `checkout_started`
- `payment_method_selected`
- `payment_pending`
- `payment_paid`
- `payment_expired`
- `payment_failed`
- `entitlement_activated`
- `export_allowed`
- `export_blocked`

Analytics must not store QR payloads, full VA numbers, signatures, secrets, or raw provider callbacks.

## 6. Access and entitlement contract

### 6.1 Application access states

The application keeps three access states:

```text
free
plus_active
plus_expired
```

Package type is separate metadata:

```text
entitlement_type: term | lifetime | null
is_lifetime: boolean
active_from: timestamp | null
active_until: timestamp | null
```

This keeps existing access checks understandable while allowing the UI to distinguish Plus Selamanya from a record with missing expiry data.

### 6.2 Activation rules

1. A browser return URL never activates access.
2. A validated callback or verified provider inquiry may move a payment to `paid`.
3. Payment transition and grant issuance occur in one database transaction.
4. A unique purchase constraint prevents duplicate grants.
5. A 30-day grant adds exactly 30 days.
6. A 12-month grant adds a calendar interval of 12 months.
7. Renewal begins from `max(now, current_active_until)`.
8. Lifetime makes the current access non-expiring and blocks further Plus purchases.

### 6.3 Legacy migration

- Existing Plus users are migrated from a reviewed, verified user list.
- Verified lifetime purchasers receive explicit lifetime grants.
- Ambiguous `active_until = null` records are reviewed manually.
- No ambiguous record is automatically converted into lifetime access.
- The existing `get_user_access_status` RPC remains compatible while web and mobile consumers migrate.
- New fields are additive during the compatibility period.

## 7. Payment state and recovery

### 7.1 Normalized state machine

```text
created -> pending -> paid
                   -> expired
                   -> failed
                   -> canceled
          pending -> superseded -> paid
                                -> expired
                                -> canceled
paid -> refunded
```

`superseded` means TutorLog has stopped presenting the attempt as active after a method change. It does not assert that the provider has made the old payment instrument impossible to pay. A later verified `paid` event therefore remains valid.

Provider-confirmed terminal events must not move a payment backward to `pending`.

### 7.2 Pending payment

- Returning users resume the existing pending QRIS or VA payment.
- The status page shows the same reference and remaining expiry.
- A replacement payment is not created automatically.

### 7.3 Changing payment method

- The user may cancel the current pending attempt and create a replacement.
- TutorLog marks the old attempt `superseded` and requests provider cancellation when the provider supports it.
- The replacement is linked to the same purchase when its commercial snapshot remains valid.
- If the canceled attempt is paid later, TutorLog honors the valid payment and flags the purchase for duplicate-payment review.
- The system must not silently discard a verified payment.

### 7.4 Delayed verification

- Provider return opens a `verifying` UI state.
- The page polls TutorLog status with increasing intervals for up to ten minutes.
- TutorLog may use provider inquiry when safe rate limits allow it.
- After ten minutes, the page shows the payment reference and support path.
- Webhook and scheduled reconciliation continue after the page closes.

## 8. Web product flow

### 8.1 Public pricing

`/harga` remains public and becomes the single package-selection surface.

Required presentation:

- Free.
- Plus 30 Hari.
- Plus 12 Bulan as the featured package.
- Plus Selamanya without a scarcity counter or founding-limit claim.
- Explicit no-auto-renew wording.
- Annual saving derived from catalog prices.
- Clear QRIS and VA fee explanation without exposing provider implementation details.

### 8.2 Authentication return

- An unauthenticated user may view pricing and select a package.
- Checkout requires authentication.
- The selected package is retained through magic-link login using a validated server-side return target or equivalent safe state.
- After authentication, the user returns to checkout for the selected active package.
- Price and availability are revalidated before a purchase is created.

### 8.3 Checkout

Checkout is a dedicated protected product flow.

It displays:

- Selected package and duration.
- Base price.
- QRIS or VA method.
- Channel fee.
- Final total.
- No-auto-renew statement.
- Terms and refund acknowledgement.

Changing a method before provider payment creation updates the quote. Changing it after creation follows the cancellation and replacement rules.

### 8.4 Payment status

The status surface supports:

- Pending with QRIS or VA instructions supplied by the provider.
- Verifying after return.
- Paid and entitlement activated.
- Expired, failed, or canceled with safe retry.
- Delayed verification with reference and support path.
- Duplicate-payment review messaging without promising an automatic refund.

### 8.5 Profile and top bar

- Profile displays normalized plan state, expiry, or Plus Selamanya.
- A term user may renew before expiry.
- A lifetime user does not see renewal actions.
- Profile displays the latest payment only: package, date, total, method, status, and safe reference.
- Full history remains available to authorized support through the database.
- The top bar displays a compact Free, Plus active, Plus expired, or Plus Selamanya label.

## 9. Paywall and export behavior

### 9.1 Paywall frequency

- A paywall dialog opens only after the user attempts a locked action.
- The dashboard may show a passive upgrade card.
- No automatic upgrade dialog appears on page load or once per session.
- Paywall CTA goes to `/harga` rather than preselecting a package or embedding package cards in the dialog.

### 9.2 Rekap and invoice export

- The server checks entitlement and records an export authorization or usage decision.
- The browser retains the existing CSV and PDF generation behavior in the MVP.
- Invoice creation and preview remain available on the web for Free users.
- Download follows the server authorization result.
- This is a commercial gate. Browser-generated documents cannot be treated as a strong DRM boundary.
- Server-side PDF generation is deferred unless abuse or product requirements justify the migration cost.

## 10. Mobile contract

- All payments occur on the web.
- Mobile does not display package prices, checkout, or a contextual purchase CTA.
- Profile or Help may display `Buka TutorLog Web` and open the authenticated web dashboard rather than `/harga` or `/checkout`.
- The invoice feature may display `Buat Invoice di Web` and open `/app/invoice`.
- The invoice CTA opens a web-only product function. It does not link directly to payment.
- Free users may create and preview an invoice on the web; download remains governed by the web entitlement flow.
- Store review notes must describe the invoice link as access to the web invoice editor.
- Mobile reads the same normalized entitlement through the compatible access RPC.

Store policy remains a release-time verification item. Neutral wording does not override the destination and context evaluated during store review.

## 11. Security and access control

### 11.1 Server-only responsibilities

- Provider secrets, signing material, and production credentials.
- Payment creation, cancellation, and inquiry.
- Callback verification and raw payload storage.
- Payment state transitions.
- Entitlement issuance, revocation, and recalculation.
- Refund administration.
- Reconciliation.
- Transactional email dispatch.

### 11.2 Callback requirements

- Verify signature using the exact provider contract.
- Validate timestamp and apply an agreed replay window.
- Match provider reference, purchase, user, amount, currency, and expected method.
- Use unique constraints and atomic processing for idempotency.
- Accept repeated valid delivery without repeating side effects.
- Record invalid and mismatched events for investigation without exposing details to the client.
- Return the provider-required response only after the event is durably handled.

### 11.3 RLS intent

- Public or authenticated clients may read active catalog data needed for pricing.
- A user may read their own current access and safe latest-payment projection.
- A user cannot update catalog price, provider event, payment state, or entitlement.
- Raw provider data is server-only.
- Support access requires a separately authorized operational path. It is not part of the end-user UI in this phase.

## 12. Transactional email

TutorLog sends its own payment confirmation after a verified transition to `paid`.

The email contains:

- Package name.
- Paid amount and channel fee summary.
- Payment date and safe reference.
- New expiry or Plus Selamanya status.
- Support and refund-request path.

The transactional email provider is selected during implementation planning. Email delivery failure does not roll back a valid payment or entitlement.

## 13. Workstream separation

Implementation must be planned as two primary workstreams with a small shared-contract gate.

### 13.1 Shared contract gate

This gate is completed before UI and Integration implementation diverge.

It owns:

- Stable package codes.
- Normalized access and payment states.
- Request and response DTOs.
- Route and endpoint names.
- Error codes intended for UI decisions.
- Mock fixtures for Free, active, expired, lifetime, pending, verifying, paid, expired payment, failed payment, and duplicate-review states.

Expected application-facing types include:

```text
ProductSummary
CheckoutQuote
PaymentMethodOption
PurchaseSummary
PaymentStatusView
AccessSummary
LatestPaymentSummary
ExportAuthorizationResult
```

The contract must not expose iPaymu response shapes.

### 13.2 Integration/Data workstream

Owns:

- Supabase migrations, constraints, index, and RLS.
- Catalog and price versioning.
- Purchase, payment, provider-event, entitlement, and analytics repositories.
- Provider adapter and Duitku implementation.
- Create, resume, cancel, status, callback, and reconciliation endpoints.
- Atomic entitlement activation and refund recalculation.
- Legacy access RPC compatibility and verified-user migration.
- Export authorization RPC or server action.
- Transactional email event and provider integration.
- Operational logs and safe support references.

It exposes only the agreed application DTOs and normalized errors.

### 13.3 UI/Product workstream

Owns:

- `/harga` package presentation and updated copy.
- Authentication return UX after package selection.
- Checkout selection and quote presentation.
- Redirect handoff and payment-status surfaces.
- Paywall destination and contextual copy.
- Dashboard upgrade card.
- Profile and top-bar entitlement presentation.
- Latest-payment presentation.
- Export authorization states while retaining the browser PDF generator.
- Terms, refund, contact, and payment guidance copy after legal inputs are verified.
- Responsive, keyboard, focus, loading, empty, and error states.

The UI workstream develops against mock fixtures until Integration satisfies the shared contract.

### 13.4 Integration seam

UI may depend on a thin application client such as:

```text
listProducts()
createOrResumePurchase(packageCode, method)
cancelPendingPayment(paymentId)
getPaymentStatus(paymentId)
getAccessSummary()
getLatestPayment()
authorizeExport(feature)
```

The UI must not:

- Call iPaymu directly.
- Construct provider signatures.
- Derive paid status from a return URL.
- Calculate entitlement expiry.
- Hardcode provider fees.
- Import database row types into route components.

The Integration workstream must not:

- Own route markup or visual copy.
- Encode UI layout decisions into domain responses.
- Return raw provider errors to users.

### 13.5 Coordination rules

- Contract changes require review by both workstreams.
- Mock fixtures and production DTOs use the same runtime validation.
- Integration can ship behind a disabled feature flag or inaccessible route until UI is ready.
- UI can be reviewed with fixtures before provider credentials are available.
- Execute both plans with `superpowers:subagent-driven-development`.
- Integration/Data and UI/Product remain separate workstreams and separate branches.
- Complete the Integration branch and its whole-branch review before starting UI implementation from the user-approved reviewed Integration base.
- Use one fresh implementer per task, followed by a separate reviewer that checks spec compliance and code quality.
- Do not start the next task while the current review has open Critical or Important findings; fix and re-review first.
- Run a broad whole-branch review after the final task in each workstream.
- No worktree is assumed. Worktree creation and task-scoped code commits require explicit approval under repository rules.
- Until a Duitku merchant exists and Task I9 verifies the account-specific matrix, provider-neutral preparation uses `BILLING_PAYMENT_PROVIDER_ENABLED=false`. Paid products are unavailable and provider calls fail closed while disabled.

## 14. Implementation sequencing

### Phase 0: Merchant and contract proof

- Confirm iPaymu business eligibility and production requirements.
- Verify Redirect capabilities in sandbox.
- Freeze package codes, DTOs, normalized states, and safe errors.
- Create UI fixtures from the frozen contract.

Gate: UI and Integration agree on the contract. Redirect remains selected or Direct is chosen as the provider-mode fallback.

### Phase 1I: Integration foundation

- Add versioned schema and RLS.
- Seed catalog and launch prices.
- Implement purchase, payment, provider-event, and entitlement domain.
- Preserve legacy RPC compatibility.

### Phase 1U: UI foundation

- Build pricing and checkout surfaces against fixtures.
- Build payment-state presentation against fixtures.
- Prepare entitlement presentation in Profile and top bar.

Phase 1I and Phase 1U remain separate workstreams. Under Subagent-Driven execution, complete and review Integration first, obtain approval to synchronize it, then start UI from the reviewed Integration base. Only one implementer runs at a time.

### Phase 2I: Provider and activation

- Implement Duitku adapter, callback verification, inquiry, cancellation, idempotency, and atomic activation.
- Add reconciliation and email event handling.
- Add export authorization and first-party analytics.

### Phase 2U: Product integration

- Connect UI application client to real endpoints.
- Update paywall, dashboard, Profile, top bar, and export states.
- Update legal and support surfaces using verified provider information.

Phase 2U begins when the relevant Phase 2I endpoint passes its contract verification. It does not need to wait for every Integration endpoint.

### Phase 3: Migration and rollout preparation

- Audit and migrate verified legacy Plus users.
- Exercise payment states in sandbox.
- Review mobile RPC compatibility and store-facing links.
- Prepare operational runbook, refund handling, and reconciliation checks.
- Run the separately approved test and QA matrix before any production rollout.

## 15. Estimate

Estimates are engineer-days of focused implementation and review. They exclude provider-account approval, legal review waiting time, production settlement observation, and App Store or Play Store review time.

### 15.1 Shared and provider proof

| Work | Estimate |
| --- | ---: |
| Duitku sandbox capability proof | 0.5-1.5 days |
| Typed contract, normalized states, validation, and fixtures | 1-1.5 days |
| **Subtotal** | **1.5-3 days** |

### 15.2 Integration/Data

| Work | Estimate |
| --- | ---: |
| Schema, catalog, RLS, constraints, and repositories | 2-3 days |
| Purchase and payment application services | 1.5-2.5 days |
| Duitku adapter, callback, inquiry, and cancellation | 2-3 days |
| Atomic entitlement, refund recalculation, and legacy compatibility | 2-3 days |
| Reconciliation, analytics, export authorization, and email event | 2-3 days |
| Verified legacy-user migration preparation | 0.5-1 day |
| **Integration/Data subtotal** | **10-15.5 days** |

### 15.3 UI/Product

| Work | Estimate |
| --- | ---: |
| Pricing page and package-state update | 1-1.5 days |
| Login return and checkout UI against fixtures | 1.5-2.5 days |
| Payment pending, verifying, paid, and recovery surfaces | 1.5-2.5 days |
| Paywall, dashboard, Profile, top bar, and latest payment | 1.5-2.5 days |
| Export authorization states and browser-generator integration | 1-1.5 days |
| Terms, refund, contact, and payment guidance | 0.5-1 day |
| **UI/Product subtotal** | **7-11.5 days** |

### 15.4 Integration review, migration, and rollout QA

| Work | Estimate |
| --- | ---: |
| UI and endpoint contract integration | 1-2 days |
| Legacy migration rehearsal and rollback preparation | 1-1.5 days |
| Security, payment-state, responsive, accessibility, and visual QA | 2.5-4 days |
| Production rollout and initial reconciliation observation | 0.5-1 day |
| **Rollout subtotal** | **5-8.5 days** |

### 15.5 Overall range

| Execution model | Estimated elapsed work |
| --- | --- |
| One engineer, mostly sequential | 24-38 working days, roughly 5-8 weeks |
| Two focused workstreams after the shared gate | 15-23 working days, roughly 3-5 weeks |

The critical path runs through Duitku sandbox proof, shared contract, schema, provider callback and entitlement activation, real UI integration, migration rehearsal, and payment-state QA.

External waiting time may extend the calendar schedule even when engineering work is complete. The largest uncertainty is Duitku merchant eligibility and redirect behavior. If Duitku POP is required instead, add approximately 2-3 engineer-days for popup integration and method-specific UI changes.

## 16. Verification strategy for the future implementation

No checks are authorized or executed by this design document. Before implementation completion or rollout, the plan must cover:

- Domain and migration contract tests.
- RLS checks for catalog, payment, provider-event, and entitlement access.
- Callback signature, replay, duplicate, amount-mismatch, and out-of-order event tests.
- Renewal, lifetime, refund, and legacy migration cases.
- Checkout loading, cancellation, retry, delayed callback, and duplicate-payment states.
- Export authorization behavior without changing invoice visual output.
- Responsive, keyboard, focus, accessibility, and visual review.
- Sandbox QRIS and VA flows.
- Reconciliation after a simulated missing callback.
- Transactional email failure without entitlement rollback.
- Mobile access RPC compatibility and store-facing link review.

The repository test policy and explicit user approval determine which checks run at each implementation checkpoint.

## 17. Risks and unresolved verification items

The following are verification tasks, not product preference questions:

- Duitku acceptance of TutorLog's SaaS and digital-access model.
- Redirect support for the intended QRIS and VA experience.
- Merchant-specific fees, settlement, withdrawal, refund, and cancellation behavior.
- Exact callback signature, retry, timestamp, response, event-reference, and inquiry contracts.
- Production static-IP and domain requirements.
- Resend domain authentication and approved test-recipient verification; Resend Free is the selected transactional provider.
- The authoritative legacy Plus-user list; Task I0 already verified the live object definitions and RLS for `user_entitlements`, `user_feature_usage`, and `user_feature_usage_events`.
- Mobile repository RPC consumption and final store-review treatment of web links.
- TutorLog legal operator identity, support address, dispute flow, and final public wording.

None of these items may be filled with assumptions in the implementation plan. Each must have an owner, evidence, and a gate or fallback.

## 18. Completion criteria for design review

This design is ready for implementation planning only when:

- The user approves this written spec.
- No placeholder or contradictory product decision remains.
- The UI/Product and Integration/Data boundaries remain separate in the plan.
- Provider unknowns are represented as explicit discovery tasks and gates.
- The implementation plan identifies branch, checkpoint, verification, and approval boundaries without assuming a worktree, commit, push, merge, or deployment authorization.
