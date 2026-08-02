# Pricing Fallback and Payment Gateway Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep pricing and checkout fully visible for review while preventing payment creation until the provider is enabled.

**Architecture:** A production fallback catalog supplies display-only package data when Supabase catalog loading fails. Catalog availability remains independent from gateway readiness; checkout receives an explicit `paymentReady` flag and keeps the final payment action disabled unless both the live catalog and provider quote are ready.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Supabase, Node contract scripts.

## Global Constraints

- `/harga` always shows Free, Plus 30 Hari, Plus 12 Bulan, and Plus Selamanya.
- Fallback prices are exactly Rp0, Rp19.000, Rp149.000, and Rp249.000.
- Paid pricing CTAs stay active and navigate to `/checkout?package=<package-code>`.
- Plus 12 Bulan uses `Paling hemat` with mint/green decoration; Plus Selamanya
  uses `Sekali bayar` with lavender/dark-ink decoration.
- Checkout shows `← Kembali ke harga` above the panel and links to `/harga`.
- The checkout final button is disabled with label `Pembayaran segera tersedia` while payment creation is unavailable.
- A disabled checkout must not call quote or purchase APIs and must not redirect to a gateway.
- Server payment APIs remain fail-closed.
- Fallback data is display-only and must not be imported from test fixtures.
- Do not change schema, migrations, provider adapters, or shared browser DTOs.
- Preserve the existing modified `AGENTS.md` and untracked pricing plan/spec documents.

---

### Task 1: Render fallback pricing and gate payment creation

**Files:**
- Create: `lib/billing/fallback-catalog.ts`
- Modify: `lib/billing/server/catalog.ts`
- Modify: `app/harga/page.tsx`
- Modify: `app/checkout/page.tsx`
- Modify: `components/billing/checkout-panel.tsx`
- Modify: `scripts/test-billing-ui-contract.mjs`
- Modify: `scripts/test-billing-route-contract.mjs`

**Interfaces:**
- Produces: `FALLBACK_BILLING_CATALOG: readonly ProductSummary[]`
- Produces: `createDisplayQuote(product: ProductSummary, method: PaymentMethod): CheckoutQuote`
- Produces: `isPaymentProviderEnabled(): boolean`
- Extends: `CheckoutPanelProps` with `paymentReady: boolean`

- [ ] **Step 1: Write failing fallback and gateway-gate contracts**

Add contract assertions that require:

```js
assert.match(pricingPageSource, /FALLBACK_BILLING_CATALOG/);
assert.doesNotMatch(
  pricingPageSource,
  /catalogUnavailable\s*\?\s*\([\s\S]*Daftar paket belum dapat dimuat/,
);
assert.match(
  pricingPageSource,
  /<PricingCatalog products=\{products\} authenticated=\{authenticated\} \/>/,
);

assert.match(checkoutPageSource, /paymentReady/);
assert.match(checkoutPageSource, /createDisplayQuote/);
assert.match(
  checkoutPanelSource,
  /paymentReady\s*&&[\s\S]*termsAccepted/,
);
assert.match(
  checkoutPanelSource,
  /paymentReady \? "Lanjutkan pembayaran" : "Pembayaran segera tersedia"/,
);
```

Add runtime assertions for the fallback catalog:

```js
assert.deepEqual(
  FALLBACK_BILLING_CATALOG.map(({ code, amount }) => ({ code, amount })),
  [
    { code: "free", amount: 0 },
    { code: "plus_30d", amount: 19000 },
    { code: "plus_12m", amount: 149000 },
    { code: "plus_lifetime", amount: 249000 },
  ],
);
assert.equal(FALLBACK_BILLING_CATALOG.every((product) => product.available), true);
```

- [ ] **Step 2: Run contracts and verify RED**

Run:

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
```

Expected: both commands fail on missing fallback catalog and missing
`paymentReady` gateway gate.

- [ ] **Step 3: Add the display-only fallback catalog**

Create `lib/billing/fallback-catalog.ts` with a typed immutable catalog using
the four exact launch prices. Use `priceId: null` for every fallback entry so
the data cannot represent an authoritative transaction price. Export
`createDisplayQuote`, returning an IDR display quote with the selected method,
the product amount, zero channel fee, matching total, and `expiresAt: null`.

- [ ] **Step 4: Separate catalog availability from provider readiness**

In `lib/billing/server/catalog.ts`, add:

```ts
export function isPaymentProviderEnabled(): boolean {
  return process.env.BILLING_PAYMENT_PROVIDER_ENABLED === "true";
}
```

Use it inside `assertPaymentProviderEnabled`. In `toProductSummary`, calculate
`available` only from the product availability window. Keep `getQuote` guarded
by `assertPaymentProviderEnabled` so transaction APIs remain fail-closed.

- [ ] **Step 5: Always render pricing**

In `app/harga/page.tsx`, initialize `products` from
`FALLBACK_BILLING_CATALOG`, replace it only when `getCatalog()` succeeds, and
always render:

```tsx
<PricingCatalog products={products} authenticated={authenticated} />
```

Remove the blocking catalog error panel.

- [ ] **Step 6: Render checkout with an explicit payment gate**

In `app/checkout/page.tsx`:

1. Load access separately; redirect only if access cannot be checked.
2. Start with the fallback catalog and track whether live catalog loading
   succeeded.
3. Select the requested paid product from the chosen catalog.
4. Use `createDisplayQuote(product, "qris")` as the initial display quote.
5. Only call `getQuote` when the provider is enabled and the live catalog was
   loaded. If the quote fails, retain the display quote and set
   `paymentReady = false`.
6. Render:

```tsx
<CheckoutPanel
  product={product}
  initialQuote={initialQuote}
  paymentReady={paymentReady}
/>
```

- [ ] **Step 7: Keep checkout interactive but block the gateway step**

In `components/billing/checkout-panel.tsx`:

1. Add the required `paymentReady` prop.
2. When `paymentReady` is false, method changes update a local display quote
   through `createDisplayQuote` and return before calling `quoteClient`.
3. Include `paymentReady` in `canCreatePayment`.
4. Keep method selection and terms acknowledgement interactive.
5. Render the final label with:

```tsx
{paymentReady ? "Lanjutkan pembayaran" : "Pembayaran segera tersedia"}
```

The existing `if (!canCreatePayment) return` remains as defense in depth, so a
disabled state cannot call `purchaseClient` or redirect.

- [ ] **Step 8: Run focused GREEN verification**

Run:

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk node scripts/test-billing-route-contract.mjs
rtk git diff --check
```

Expected: both contracts print their valid messages and `git diff --check`
exits 0.

- [ ] **Step 9: Review and commit**

Review only the seven task files, confirm `AGENTS.md` and existing untracked
documents are untouched, then stage the task files and commit:

```bash
rtk git add lib/billing/fallback-catalog.ts lib/billing/server/catalog.ts app/harga/page.tsx app/checkout/page.tsx components/billing/checkout-panel.tsx scripts/test-billing-ui-contract.mjs scripts/test-billing-route-contract.mjs
rtk git commit -m "fix: keep pricing visible before gateway launch"
```

### Task 3: Differentiate annual and lifetime merchandising

**Files:**
- Modify: `components/billing/pricing-catalog.tsx`
- Modify: `components/billing/pricing.module.css`
- Modify: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Consumes: fixed package codes `plus_12m` and `plus_lifetime`
- Produces: distinct badge labels, supporting copy, and CSS classes for the two highlighted packages

- [ ] **Step 1: Write failing merchandising contracts**

Add assertions that require separate package roles:

```js
assert.match(pricingCatalogSource, /product\.code === "plus_12m"/);
assert.match(pricingCatalogSource, /product\.code === "plus_lifetime"/);
assert.match(pricingCatalogSource, /Paling hemat/);
assert.match(pricingCatalogSource, /Sekali bayar/);
assert.match(
  pricingCatalogSource,
  /Bayar sekali untuk akses Plus selamanya\./,
);
assert.match(pricingCatalogSource, /styles\.savings/);
assert.match(pricingCatalogSource, /styles\.lifetime/);
assert.match(pricingCatalogSource, /styles\.lifetimeBadge/);
assert.match(pricingStylesSource, /\.savings\s*\{/);
assert.match(pricingStylesSource, /\.lifetime\s*\{/);
assert.match(pricingStylesSource, /var\(--tl-lavender\)/);
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```bash
rtk node scripts/test-billing-ui-contract.mjs
```

Expected: FAIL because `Sekali bayar` and the lifetime decoration do not exist.

- [ ] **Step 3: Derive separate package presentation**

Inside the product loop in `components/billing/pricing-catalog.tsx`, derive:

```ts
const isSavings = product.code === "plus_12m";
const isLifetime = product.code === "plus_lifetime";
const badgeLabel = isSavings
  ? "Paling hemat"
  : isLifetime
    ? "Sekali bayar"
    : null;
```

Apply `styles.savings` only to Plus 12 Bulan and `styles.lifetime` only to Plus
Selamanya. Render `styles.lifetimeBadge` in addition to the shared badge class
only for the lifetime package. Do not map generic `featured: true` directly to
one badge label.

Use these supporting notes:

```tsx
{isSavings && savings > 0
  ? <p>Hemat {formatIdr(savings)} dibanding membeli paket 30 hari selama 12 bulan.</p>
  : isLifetime
    ? <p>Bayar sekali untuk akses Plus selamanya.</p>
    : <p>{isFree ? "Mulai tanpa biaya." : "Seluruh fitur Plus termasuk dalam paket ini."}</p>}
```

- [ ] **Step 4: Add distinct decoration**

Rename the existing mint highlight class to `.savings`. Add:

```css
.lifetime {
  margin: 0 calc(var(--tl-space-7) * -1);
  padding: var(--tl-space-9) var(--tl-space-7);
  border-left: 4px solid var(--tl-ink);
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--tl-lavender) 42%, transparent),
    transparent
  );
}

.lifetimeBadge {
  background: var(--tl-lavender);
  color: var(--tl-ink);
}
```

Apply the same mobile margin and padding rule to `.savings` and `.lifetime`.

- [ ] **Step 5: Run focused GREEN verification**

Run:

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk git diff --check
```

Expected: the contract prints `billing UI contract valid` and the diff check
exits 0.

- [ ] **Step 6: Include in the existing pricing fallback commit**

Stage the component, CSS module, and focused contract with Tasks 1 and 2. Keep:

```bash
rtk git commit -m "fix: keep pricing visible before gateway launch"
```

### Task 2: Add checkout back navigation

**Files:**
- Modify: `app/checkout/page.tsx`
- Modify: `scripts/test-billing-ui-contract.mjs`

**Interfaces:**
- Produces: a visible `← Kembali ke harga` link targeting `/harga`
- Preserves: existing checkout panel, gateway gate, and payment flow

- [ ] **Step 1: Write the failing contract**

Add:

```js
assert.match(
  checkoutPageSource,
  /<Link href="\/harga"[\s\S]*Kembali ke harga[\s\S]*<\/Link>/,
  "checkout must provide an in-page route back to pricing",
);
```

- [ ] **Step 2: Run the contract and verify RED**

Run:

```bash
rtk node scripts/test-billing-ui-contract.mjs
```

Expected: FAIL with `checkout must provide an in-page route back to pricing`.

- [ ] **Step 3: Add the navigation link**

Import `Link` from `next/link`, change the checkout page wrapper into a
content column, and place this link immediately before `CheckoutPanel`:

```tsx
<Link href="/harga">← Kembali ke harga</Link>
```

Reuse existing public typography and color tokens through a small local style;
do not introduce a shared component or change the checkout route.

- [ ] **Step 4: Run focused GREEN verification**

Run:

```bash
rtk node scripts/test-billing-ui-contract.mjs
rtk git diff --check
```

Expected: the contract prints `billing UI contract valid` and the diff check
exits 0.

- [ ] **Step 5: Include in the existing pricing fallback commit**

Stage `app/checkout/page.tsx` and `scripts/test-billing-ui-contract.mjs`
together with the Task 1 files. Keep the existing commit message:

```bash
rtk git commit -m "fix: keep pricing visible before gateway launch"
```
