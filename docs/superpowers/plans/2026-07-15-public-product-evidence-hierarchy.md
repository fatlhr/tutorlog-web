# Public Product Evidence Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `/`, `/fitur`, `/harga`, and `/panduan` distinct marketing roles by concentrating full product screenshots on `/fitur` and using one consistent session-to-recap-to-invoice artifact system elsewhere.

**Architecture:** Extract the existing public invoice fixture into a data-only module, derive session and recap evidence from that same fixture, and render it through small public-only artifact components. Route files own narrative composition, `PublicProductRail` continues to own full screenshots and proof dialogs, and a focused CSS module owns artifact internals while `css/site.css` owns route-level layout.

**Tech Stack:** Next.js 16 App Router, React 19 server components, TypeScript, CSS Modules, existing global public CSS, GSAP, Playwright, Node contract tests.

## Global Constraints

- Start implementation from `develop` on a new `feat/public-product-evidence` branch. Never edit application code directly on `develop`.
- Do not create a worktree unless Fatih explicitly requests it.
- Keep the current homepage hero timetable and overlapping mobile proof composition.
- Keep routes, navigation, CTA intent, analytics hooks, pricing logic, protected app behavior, invoice export logic, and invoice PDF layout unchanged.
- Do not add dependencies, external images, photography, or new full product screenshots.
- Full product screenshots are allowed only in the homepage hero and `/fitur`.
- `/panduan` must preserve steps 01-06, their order, and their existing copy.
- `/harga` must preserve plans, FAQ, purchase links, and purchase behavior.
- Public evidence components must not import components from `components/app-ui`.
- Reuse `TplModern` for invoice evidence; do not duplicate or simplify its data contract.
- Decorative connectors use `aria-hidden="true"`; document order must remain session, recap, invoice.
- Motion may animate only `transform` and `opacity`, and must render immediately under `prefers-reduced-motion: reduce`.
- Required responsive widths are 320, 390, 768, 1024, and 1440 pixels.
- Before running tests, responsive sweep, accessibility, visual regression, or PDF export checks during implementation, follow the repo test policy and obtain the required user instruction.
- Before every code commit, obtain explicit user approval as required by `AGENTS.md`.
- Before merge or sync to `develop`, stop and ask whether to run or skip test, responsive sweep, accessibility, visual regression, and PDF export checks.

---

## File Map

### Create

- `components/public-ui/product-evidence/product-evidence-data.ts`: single public fixture and derived session/recap evidence.
- `components/public-ui/product-evidence/session-artifact.tsx`: compact completed-session paper.
- `components/public-ui/product-evidence/recap-artifact.tsx`: monthly summary paper.
- `components/public-ui/product-evidence/invoice-artifact.tsx`: scaled wrapper around `TplModern`.
- `components/public-ui/product-evidence/workflow-canvas.tsx`: homepage and guide evidence compositions.
- `components/public-ui/product-evidence/product-evidence.module.css`: artifact internals, connectors, responsive collapse, reduced motion.
- `scripts/test-public-product-evidence-contract.mjs`: fixture integrity and route evidence-budget contract.

### Modify

- `components/PublicProductRail.tsx`: consume the extracted invoice fixture while retaining screenshots and dialogs.
- `components/PublicMotion.tsx`: target the new workflow and feature evidence containers.
- `app/page.tsx`: replace three lower screenshot stories with `WorkflowCanvas`.
- `app/fitur/page.tsx`: regroup four repeated rows into three evidence groups.
- `app/panduan/page.tsx`: replace full proof IDs with guide artifact compositions.
- `app/harga/page.tsx`: add `data-symbolic-evidence="pricing"` to the symbolic receipt illustration for token alignment.
- `css/site.css`: route-level workflow, feature-group, guide, and price visual layout; remove superseded proof-row selectors.
- `tests/responsive-sweep.spec.ts`: update structure and responsive assertions to the approved composition.
- `tests/public-dialogs.spec.ts`: move product-proof interaction coverage from `/` to `/fitur`.

### Must remain unchanged

- `components/PublicProofDialog.tsx`.
- `components/invoice/TplModern.tsx`.
- `components/invoice/invoice-data.ts`.
- Protected routes and `components/app-ui/**`.
- Pricing data and outbound purchase URLs in `app/harga/page.tsx`.

---

### Task 1: Lock the shared evidence data contract

**Files:**
- Create: `scripts/test-public-product-evidence-contract.mjs`
- Create: `components/public-ui/product-evidence/product-evidence-data.ts`
- Modify: `components/PublicProductRail.tsx:3-26,155-160`

**Interfaces:**
- Produces: `publicProductInvoiceData: InvoiceData`.
- Produces: `publicSessionEvidence: { date: string; description: string; hours: number; amount: number; status: "Selesai" }`.
- Produces: `publicRecapEvidence: { period: "Juni 2026"; sessionCount: number; hours: number; amount: number }`.
- Consumes: `InvoiceData` and `getInvoiceTotals` from `components/invoice/invoice-data.ts`.

- [ ] **Step 1: Write the failing contract test**

Create `scripts/test-public-product-evidence-contract.mjs` with the data assertions first:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  publicProductInvoiceData,
  publicRecapEvidence,
  publicSessionEvidence,
} from "../components/public-ui/product-evidence/product-evidence-data.ts";

assert.equal(publicProductInvoiceData.no, "INV-2026-06-014");
assert.equal(publicProductInvoiceData.items.length, 3);
assert.deepEqual(publicSessionEvidence, {
  date: "03 Jun",
  description: "Matematika - Trigonometri",
  hours: 1.5,
  amount: 180000,
  status: "Selesai",
});
assert.deepEqual(publicRecapEvidence, {
  period: "Juni 2026",
  sessionCount: 3,
  hours: 5,
  amount: 560000,
});
assert.equal(
  publicProductInvoiceData.items.reduce((sum, item) => sum + item.amount, 0),
  publicRecapEvidence.amount,
);

const home = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const features = await readFile(new URL("../app/fitur/page.tsx", import.meta.url), "utf8");
const guide = await readFile(new URL("../app/panduan/page.tsx", import.meta.url), "utf8");
const pricing = await readFile(new URL("../app/harga/page.tsx", import.meta.url), "utf8");

assert.match(home, /<WorkflowCanvas\s*\/>/);
assert.doesNotMatch(home, /proofStories/);
assert.equal((features.match(/data-evidence-group=/g) ?? []).length, 3);
assert.doesNotMatch(guide, /PublicProductProof/);
assert.match(guide, /<MobileGuideEvidence\s*\/>/);
assert.match(guide, /<WebGuideEvidence\s*\/>/);
assert.doesNotMatch(pricing, /PublicProductProof/);

console.log("public product evidence contract valid");
```

- [ ] **Step 2: Run the contract and confirm the expected failure**

Run only after test execution is approved under the repo policy:

```bash
rtk npx tsx scripts/test-public-product-evidence-contract.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `product-evidence-data.ts`.

- [ ] **Step 3: Add the single source of public evidence data**

Create `components/public-ui/product-evidence/product-evidence-data.ts`:

```ts
import type { InvoiceData } from "@/components/invoice/invoice-data";
import { getInvoiceTotals } from "@/components/invoice/invoice-data";

export const publicProductInvoiceData: InvoiceData = {
  no: "INV-2026-06-014",
  date: "30 Juni 2026",
  period: "1-30 Juni 2026",
  from: {
    name: "Rina Novianti",
    lines: ["Tutor Matematika dan Fisika", "Jakarta Selatan", "rina@tutorlog.id - 0812 3456 7890"],
  },
  to: {
    name: "Bpk. Ahmad Wijaya",
    lines: ["Wali murid Bintang Wijaya", "Kelas 10 SMA Al-Azhar"],
  },
  bank: { bank: "BCA", no: "1234 5678 9012", name: "Rina Novianti" },
  items: [
    { date: "03 Jun", desc: "Matematika - Trigonometri", h: 1.5, rate: 120000, amount: 180000, billingType: "hourly" },
    { date: "10 Jun", desc: "Fisika - Gerak Lurus", h: 2, rate: 130000, amount: 260000, billingType: "hourly" },
    { date: "17 Jun", desc: "Matematika - Latihan Soal", h: 1.5, rate: 120000, amount: 120000, billingType: "flat" },
  ],
  notes: "Terima kasih atas kepercayaannya. Pembayaran dapat ditransfer paling lambat 7 Juli 2026.",
};

const totals = getInvoiceTotals(publicProductInvoiceData.items);
const firstSession = publicProductInvoiceData.items[0];

export const publicSessionEvidence = {
  date: firstSession.date,
  description: firstSession.desc,
  hours: firstSession.h,
  amount: firstSession.amount,
  status: "Selesai" as const,
};

export const publicRecapEvidence = {
  period: "Juni 2026" as const,
  sessionCount: publicProductInvoiceData.items.length,
  hours: totals.hours,
  amount: totals.amount,
};
```

- [ ] **Step 4: Make `PublicProductRail` consume the shared invoice fixture**

In `components/PublicProductRail.tsx`, remove the local `invoiceData` object and its `InvoiceData` type import. Add:

```ts
import { publicProductInvoiceData } from "@/components/public-ui/product-evidence/product-evidence-data";
```

Change the invoice render to:

```tsx
<TplModern data={publicProductInvoiceData} />
```

Do not alter `ProductProofId`, image metadata, `PublicProofDialog`, or annotation behavior.

- [ ] **Step 5: Run the focused contract and typecheck**

Run only after approval under the test policy:

```bash
rtk npx tsx scripts/test-public-product-evidence-contract.mjs
rtk npx tsc --noEmit
```

Expected at this point: the data assertions PASS, then the route assertion FAILS because `WorkflowCanvas` has not been integrated. Typecheck must PASS.

- [ ] **Step 6: Review and request approval for the task commit**

```bash
rtk git diff --check
rtk git diff -- components/PublicProductRail.tsx components/public-ui/product-evidence/product-evidence-data.ts scripts/test-public-product-evidence-contract.mjs
```

After explicit commit approval:

```bash
rtk git add components/PublicProductRail.tsx components/public-ui/product-evidence/product-evidence-data.ts scripts/test-public-product-evidence-contract.mjs
rtk git commit -m "refactor: share public product evidence data"
```

---

### Task 2: Build the public artifact primitives

**Files:**
- Create: `components/public-ui/product-evidence/session-artifact.tsx`
- Create: `components/public-ui/product-evidence/recap-artifact.tsx`
- Create: `components/public-ui/product-evidence/invoice-artifact.tsx`
- Create: `components/public-ui/product-evidence/workflow-canvas.tsx`
- Create: `components/public-ui/product-evidence/product-evidence.module.css`

**Interfaces:**
- Consumes: `publicSessionEvidence`, `publicRecapEvidence`, and `publicProductInvoiceData` from Task 1.
- Produces: `SessionArtifact({ className?: string })`.
- Produces: `RecapArtifact({ className?: string })`.
- Produces: `InvoiceArtifact({ className?: string })`.
- Produces: `WorkflowCanvas()`, `MobileGuideEvidence()`, and `WebGuideEvidence()`.

- [ ] **Step 1: Create the three artifact components**

Implement `SessionArtifact` as a `<figure data-product-artifact="session">` containing a visible caption, `Selesai`, date, description, `1.5 jam`, and formatted amount. Implement `RecapArtifact` as a `<figure data-product-artifact="recap">` with `Juni 2026`, `3 sesi`, `5 jam`, and `Rp 560.000`. Both must use `formatIDR` from `components/invoice/invoice-data.ts`.

Use this exact component shape:

```tsx
import { formatIDR } from "@/components/invoice/invoice-data";
import { publicSessionEvidence } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function SessionArtifact({ className = "" }: { className?: string }) {
  const session = publicSessionEvidence;
  return (
    <figure className={`${styles.artifact} ${styles.session} ${className}`} data-product-artifact="session">
      <figcaption>Catatan sesi</figcaption>
      <span className={styles.status}>{session.status}</span>
      <time>{session.date}</time>
      <strong>{session.description}</strong>
      <div className={styles.sessionMeta}>
        <span>{session.hours} jam</span>
        <span>{formatIDR(session.amount)}</span>
      </div>
    </figure>
  );
}
```

Create `recap-artifact.tsx` with the same public API and semantic label-value pairs:

```tsx
import { formatIDR } from "@/components/invoice/invoice-data";
import { publicRecapEvidence } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function RecapArtifact({ className = "" }: { className?: string }) {
  const recap = publicRecapEvidence;
  return (
    <figure className={`${styles.artifact} ${styles.recap} ${className}`} data-product-artifact="recap">
      <figcaption>Rekap bulanan</figcaption>
      <strong>{recap.period}</strong>
      <dl>
        <div><dt>Sesi selesai</dt><dd>{recap.sessionCount}</dd></div>
        <div><dt>Waktu mengajar</dt><dd>{recap.hours} jam</dd></div>
        <div><dt>Estimasi pendapatan</dt><dd>{formatIDR(recap.amount)}</dd></div>
      </dl>
    </figure>
  );
}
```

Create `InvoiceArtifact` with the real invoice component:

```tsx
import TplModern from "@/components/invoice/TplModern";
import { publicProductInvoiceData } from "./product-evidence-data";
import styles from "./product-evidence.module.css";

export function InvoiceArtifact({ className = "" }: { className?: string }) {
  return (
    <figure className={`${styles.artifact} ${styles.invoice} ${className}`} data-product-artifact="invoice">
      <figcaption>Invoice siap dikirim</figcaption>
      <div className={styles.invoiceViewport} aria-label="Preview invoice TutorLog">
        <TplModern data={publicProductInvoiceData} />
      </div>
    </figure>
  );
}
```

- [ ] **Step 2: Compose workflow and guide evidence**

Create `workflow-canvas.tsx` with one internal `Connector` and these exports:

```tsx
import { InvoiceArtifact } from "./invoice-artifact";
import { RecapArtifact } from "./recap-artifact";
import { SessionArtifact } from "./session-artifact";
import styles from "./product-evidence.module.css";

const workflowCopy = [
  {
    id: "session",
    title: "Catat sesi setelah mengajar.",
    body: "Simpan materi, durasi, murid, tarif, dan lokasi dari HP selagi detailnya masih dekat.",
    artifact: <SessionArtifact />,
  },
  {
    id: "recap",
    title: "Buka rekap saat dibutuhkan.",
    body: "Sesi, jam, pendapatan, dan murid sudah tersusun untuk dibaca atau diekspor dari mobile maupun web.",
    artifact: <RecapArtifact />,
  },
  {
    id: "invoice",
    title: "Buat invoice dari sesi yang sama.",
    body: "Pilih sesi dan periksa invoice di web sebelum disimpan atau dikirim.",
    artifact: <InvoiceArtifact />,
  },
] as const;

function Connector() {
  return <span className={styles.connector} aria-hidden="true" />;
}

export function WorkflowCanvas() {
  return (
    <section className={styles.workflow} aria-label="Alur produk TutorLog" data-workflow-canvas>
      {workflowCopy.map((stage, index) => (
        <div className={styles.stage} data-workflow-stage={stage.id} key={stage.id}>
          <div className={styles.stageCopy}><h2>{stage.title}</h2><p>{stage.body}</p></div>
          {stage.artifact}
          {index < workflowCopy.length - 1 ? <Connector /> : null}
        </div>
      ))}
    </section>
  );
}

export function MobileGuideEvidence() {
  return <div className={styles.guideSingle} data-guide-evidence="mobile"><SessionArtifact /></div>;
}

export function WebGuideEvidence() {
  return (
    <div className={styles.guideSequence} data-guide-evidence="web">
      <RecapArtifact />
      <Connector />
      <InvoiceArtifact />
    </div>
  );
}
```

- [ ] **Step 3: Add artifact-internal CSS**

In `product-evidence.module.css`, define opaque paper surfaces, the established line/radius tokens, asymmetric desktop stage offsets, and a strict mobile stack. The minimum selector contract is:

```css
.artifact { position: relative; margin: 0; overflow: hidden; border: 1px solid var(--tl-line); border-radius: var(--tl-radius-surface); background: #fff; }
.artifact figcaption { color: var(--tl-green); font-family: var(--f-title), monospace; font-weight: 700; }
.session { min-height: 250px; padding: 24px; display: grid; align-content: start; gap: 14px; }
.status { width: fit-content; padding: 6px 10px; border-radius: var(--tl-radius-round); background: var(--tl-mint); }
.sessionMeta { margin-top: auto; padding-top: 16px; display: flex; justify-content: space-between; gap: 16px; border-top: 1px solid var(--tl-line); }
.recap { min-height: 280px; padding: 24px; }
.recap dl { margin: 32px 0 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.recap dl > div + div { border-left: 1px solid var(--tl-line); padding-left: 18px; }
.invoice { min-height: 340px; padding: 20px; }
.invoiceViewport { width: 100%; height: 290px; overflow: hidden; }
.invoiceViewport :global(.tpl-modern) { width: 760px; transform: scale(.48); transform-origin: top left; }
.workflow { display: grid; grid-template-columns: .82fr 1fr 1.18fr; gap: 28px; }
.stage { position: relative; min-width: 0; display: grid; align-content: start; gap: 24px; }
.stage:nth-child(2) { padding-top: 44px; }
.connector { position: absolute; top: 52%; right: -28px; width: 28px; border-top: 1px solid var(--tl-green); }
.guideSingle, .guideSequence { min-width: 0; }
.guideSequence { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 24px; }

@media (max-width: 767px) {
  .workflow, .guideSequence { display: grid; grid-template-columns: 1fr; gap: 0; }
  .stage, .stage:nth-child(2) { padding: 40px 0; }
  .stage + .stage { border-top: 1px solid var(--tl-line); }
  .connector { position: static; width: 1px; height: 28px; margin: 4px auto -28px; border-top: 0; border-left: 1px solid var(--tl-green); }
  .recap dl { grid-template-columns: 1fr; gap: 14px; }
  .recap dl > div + div { padding: 14px 0 0; border-top: 1px solid var(--tl-line); border-left: 0; }
  .invoiceViewport { height: 245px; }
  .invoiceViewport :global(.tpl-modern) { transform: scale(.38); }
}

@media (prefers-reduced-motion: reduce) {
  .artifact, .connector { opacity: 1; transform: none; }
}
```

The exact existing tokens are `--tl-radius-surface` for paper surfaces and `--tl-radius-round` for compact labels. Use opaque `#fff` for artifact paper because the foundation has no semantic paper-surface token; do not add a new global token in this task.

- [ ] **Step 4: Typecheck and inspect the isolated components**

Run only after approval:

```bash
rtk npx tsc --noEmit
rtk git diff --check
```

Expected: both PASS. Do not claim visual verification yet because no route renders the components.

- [ ] **Step 5: Review and request approval for the task commit**

After explicit commit approval:

```bash
rtk git add components/public-ui/product-evidence
rtk git commit -m "feat: add public product evidence artifacts"
```

---

### Task 3: Replace the lower homepage screenshots with one workflow canvas

**Files:**
- Modify: `app/page.tsx:9,14-30,75-85`
- Modify: `css/site.css:5791-5851,6107-6117,6151-6161`
- Modify: `tests/responsive-sweep.spec.ts:101-111,170-256`

**Interfaces:**
- Consumes: `WorkflowCanvas()` from Task 2.
- Preserves: the hero `PublicProductProof id="mobile" interactive={false}` and `LandingTimetableCanvas`.
- Produces: one `[data-workflow-canvas]` with three ordered `[data-workflow-stage]` elements.

- [ ] **Step 1: Update the failing homepage structure assertions**

Replace assertions for `.tl-landing-proof-story` with:

```ts
await expect(page.locator('[data-workflow-canvas]')).toHaveCount(1);
await expect(page.locator('[data-workflow-stage]')).toHaveCount(3);
expect(await page.locator('[data-workflow-stage]').evaluateAll((nodes) =>
  nodes.map((node) => node.getAttribute('data-workflow-stage')),
)).toEqual(['session', 'recap', 'invoice']);
await expect(page.locator('.tl-landing-feature-rows [data-rail-proof]')).toHaveCount(0);
```

Replace the mobile stacking test with:

```ts
for (const width of [320, 390]) {
  test(`stacks workflow stages without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const positions = await page.locator('[data-workflow-stage]').evaluateAll((nodes) =>
      nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      }),
    );
    expect(positions).toHaveLength(3);
    expect(positions[1].top).toBeGreaterThanOrEqual(positions[0].bottom);
    expect(positions[2].top).toBeGreaterThanOrEqual(positions[1].bottom);

    const widthMetrics = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widthMetrics.scroll).toBeLessThanOrEqual(widthMetrics.client);
  });
}
```

Update the opacity test locator from `.tl-landing-feature-rows .tls-rail-surface` to `.tl-landing-feature-rows [data-product-artifact]` and keep the existing `opacity === 1` assertion.

- [ ] **Step 2: Verify the new test fails**

Run only after approval:

```bash
rtk npx playwright test tests/responsive-sweep.spec.ts --grep "Homepage story structure|storyboard proof"
```

Expected: FAIL because the page still renders `.tl-landing-proof-story`.

- [ ] **Step 3: Integrate `WorkflowCanvas`**

In `app/page.tsx`, remove `proofStories` and replace the lower feature section with:

```tsx
import { WorkflowCanvas } from "@/components/public-ui/product-evidence/workflow-canvas";

<section className="tl-landing-feature-rows" aria-label="Alur produk TutorLog">
  <WorkflowCanvas />
</section>
```

Do not change lines 38-73 or 87-119 except import reordering.

- [ ] **Step 4: Replace obsolete lower-home CSS**

Remove the selectors that size lower-home `data-rail-proof` elements and three equal `.tl-landing-proof-story` columns. Keep `.tl-landing-feature-rows` as the route container:

```css
.tl-landing-feature-rows {
  width: min(1280px, calc(100% - 48px));
  margin: 0 auto;
  padding: 72px 0;
  border-bottom: 1px solid var(--tl-line);
}

@media (min-width: 768px) and (max-width: 1199px) {
  .tl-landing-feature-rows { width: calc(100% - 64px); padding: 64px 0; }
}

@media (max-width: 767px) {
  .tl-landing-feature-rows { width: calc(100% - 48px); padding: 16px 0; }
}
```

- [ ] **Step 5: Run focused verification**

Run only after approval:

```bash
rtk npx tsx scripts/test-public-product-evidence-contract.mjs
rtk npx playwright test tests/responsive-sweep.spec.ts --grep "Homepage story structure|storyboard proof"
rtk npx tsc --noEmit
```

Expected: homepage assertions PASS. The overall contract may still fail on `/fitur` or `/panduan` until Tasks 4 and 5.

- [ ] **Step 6: Review and request approval for the task commit**

After explicit commit approval:

```bash
rtk git add app/page.tsx css/site.css tests/responsive-sweep.spec.ts
rtk git commit -m "refactor: focus homepage product workflow"
```

---

### Task 4: Make `/fitur` the full-product proof destination

**Files:**
- Modify: `app/fitur/page.tsx:41-79`
- Modify: `css/site.css:5000-5165,5252-5350`
- Modify: `components/PublicMotion.tsx:56-72`
- Modify: `tests/responsive-sweep.spec.ts:337-567`
- Modify: `tests/public-dialogs.spec.ts:38-57`

**Interfaces:**
- Consumes: existing `PublicProductProof` IDs `mobile`, `history`, `recap`, and `invoice`.
- Produces: three groups identified by `data-evidence-group="mobile-workspace"`, `cross-device-recap`, and `invoice-output`.
- Preserves: five dialog triggers total because recap still contains separate web and mobile triggers.

- [ ] **Step 1: Rewrite feature tests around three evidence groups**

Replace the four-row arrays with:

```ts
const evidenceGroups = ['mobile-workspace', 'cross-device-recap', 'invoice-output'];
const featureTriggerCount = 5;
```

Assert:

```ts
const groups = page.locator('[data-evidence-group]');
await expect(groups).toHaveCount(3);
expect(await groups.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-evidence-group')))).toEqual(evidenceGroups);
await expect(groups.nth(0).locator('[data-rail-proof]')).toHaveCount(2);
await expect(groups.nth(1).locator('[data-rail-proof="recap"]')).toHaveCount(1);
await expect(groups.nth(2).locator('[data-rail-proof="invoice"]')).toHaveCount(1);
await expect(page.locator('[data-evidence-group] [data-proof-trigger]')).toHaveCount(featureTriggerCount);
```

Add the mobile placement and desktop scale assertions:

```ts
for (const width of [390, 516]) {
  test(`places feature proof after copy at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/fitur');
    const items = page.locator('.tls-feature-evidence-item');
    for (const item of await items.all()) {
      const placement = await item.evaluate((node) => {
        const copy = node.querySelector<HTMLElement>('.tls-feature-evidence-copy');
        const proof = node.querySelector<HTMLElement>('.tls-feature-evidence-proof');
        if (!copy || !proof) return null;
        return { copyBottom: copy.getBoundingClientRect().bottom, proofTop: proof.getBoundingClientRect().top };
      });
      expect(placement).not.toBeNull();
      expect(placement?.proofTop).toBeGreaterThanOrEqual(placement?.copyBottom ?? 0);
    }
  });
}

test('gives recap more width than either portrait proof', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/fitur');
  const recapWidth = await page.locator('[data-evidence-group="cross-device-recap"] .tls-feature-evidence-proof').evaluate((node) => node.getBoundingClientRect().width);
  const portraitWidths = await page.locator('[data-evidence-group="mobile-workspace"] [data-rail-proof]').evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
  expect(recapWidth).toBeGreaterThan(Math.max(...portraitWidths));
});
```

- [ ] **Step 2: Move the shared dialog interaction test to `/fitur`**

In `tests/public-dialogs.spec.ts`, change `page.goto('/')` to `page.goto('/fitur')` for the product-proof test. Keep the focus trap, Escape, focus return, and scroll-lock assertions unchanged.

- [ ] **Step 3: Run and confirm feature tests fail against the old rows**

Run only after approval:

```bash
rtk npx playwright test tests/responsive-sweep.spec.ts --grep "Feature paired|Feature proof"
rtk npx playwright test tests/public-dialogs.spec.ts --grep "product proof"
```

Expected: feature structure FAILS because `data-evidence-group` does not exist; the dialog behavior test should still PASS on `/fitur`.

- [ ] **Step 4: Regroup the feature page without changing copy intent**

Use this page structure:

```tsx
<section className="tls-feature-evidence-group tls-feature-mobile-workspace" data-evidence-group="mobile-workspace" aria-labelledby="feature-mobile-workspace">
  <div className="tls-feature-evidence-item">
    <div className="tls-feature-evidence-copy">
      <p className="tls-feature-platform">Mobile</p>
      <h2 id="feature-mobile-workspace">Catat sesi di HP.</h2>
      <p>Simpan materi, durasi, murid, tarif, dan lokasi segera setelah kelas selesai.<span className="tls-feature-detail"> Data itu langsung siap dipakai lagi saat rekap.</span></p>
    </div>
    <div className="tls-feature-evidence-proof"><PublicProductProof id="mobile" annotation /></div>
  </div>
  <div className="tls-feature-evidence-item">
    <div className="tls-feature-evidence-copy">
      <p className="tls-feature-platform">Riwayat sesi</p>
      <h2>Buka riwayat dan revisi catatan.</h2>
      <p>Riwayat menyimpan sesi selesai beserta catatan pengajaran dan detail pembayarannya.<span className="tls-feature-detail"> Buka dari HP untuk meninjau atau memperbarui informasi saat ada revisi.</span></p>
    </div>
    <div className="tls-feature-evidence-proof"><PublicProductProof id="history" annotation /></div>
  </div>
</section>
```

Append the recap and invoice groups with the existing copy:

```tsx
<section className="tls-feature-evidence-group" data-evidence-group="cross-device-recap" aria-labelledby="feature-rekap">
  <div className="tls-feature-evidence-item">
    <div className="tls-feature-evidence-copy">
      <p className="tls-feature-platform">Mobile dan web</p>
      <h2 id="feature-rekap">Rekap dan export dari perangkat yang kamu pakai.</h2>
      <p>Rekap memperlihatkan sesi, jam, pendapatan, dan murid dalam satu tampilan.<span className="tls-feature-detail"> PDF atau CSV dapat diekspor dari mobile maupun web saat perlu dibagikan atau diarsipkan.</span></p>
    </div>
    <div className="tls-feature-evidence-proof"><PublicProductProof id="recap" annotation /></div>
  </div>
</section>

<section className="tls-feature-evidence-group" data-evidence-group="invoice-output" aria-labelledby="feature-invoice">
  <div className="tls-feature-evidence-item">
    <div className="tls-feature-evidence-copy">
      <p className="tls-feature-platform">Web</p>
      <h2 id="feature-invoice">Buat invoice di web.</h2>
      <p>Pilih sesi yang akan ditagihkan, atur template dan warna, lalu cek preview sebelum dikirim.<span className="tls-feature-detail"> Invoice dibuat di web agar detailnya nyaman diperiksa.</span></p>
    </div>
    <div className="tls-feature-evidence-proof"><PublicProductProof id="invoice" annotation /></div>
  </div>
</section>
```

Do not add a new CTA or feature claim.

- [ ] **Step 5: Add varied evidence-group layouts**

Replace `.tls-feature-row` route CSS with:

```css
.tls-feature-evidence-group { padding: 72px 0; border-bottom: 1px solid var(--tl-line); }
.tls-feature-evidence-item { min-width: 0; display: grid; grid-template-columns: minmax(280px, .85fr) minmax(0, 1.15fr); gap: 56px; align-items: start; }
.tls-feature-mobile-workspace { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 48px; }
.tls-feature-mobile-workspace .tls-feature-evidence-item { display: grid; grid-template-columns: 1fr; gap: 30px; }
.tls-feature-mobile-workspace .tls-feature-evidence-proof { min-height: 500px; display: grid; place-items: center; }
[data-evidence-group="cross-device-recap"] .tls-feature-evidence-proof { min-height: 460px; display: grid; place-items: center; }
[data-evidence-group="invoice-output"] .tls-feature-evidence-item { grid-template-columns: minmax(260px, .7fr) minmax(480px, 1.3fr); }
[data-evidence-group="invoice-output"] .tls-invoice-proof { width: 520px; height: 505px; }
[data-evidence-group="invoice-output"] .tls-invoice-proof .tpl-modern { transform: scale(.69); }

@media (max-width: 767px) {
  .tls-feature-evidence-group, .tls-feature-mobile-workspace { display: grid; grid-template-columns: 1fr; gap: 0; padding: 48px 0; }
  .tls-feature-evidence-item, [data-evidence-group="invoice-output"] .tls-feature-evidence-item { grid-template-columns: 1fr; gap: 24px; }
  .tls-feature-evidence-item + .tls-feature-evidence-item { margin-top: 48px; padding-top: 48px; border-top: 1px solid var(--tl-line); }
  .tls-feature-evidence-proof { min-width: 0; overflow: hidden; }
}
```

At 768 pixels, the existing mobile media rule makes every group one column. At 1024 and 1440 pixels, keep the exact 520 by 505 pixel invoice proof and 460 pixel recap-stage minimum shown above; if the responsive sweep reports overflow, reduce only the outer `.tls-invoice-proof` width and its `.tpl-modern` scale by the same ratio so the document aspect remains unchanged.

- [ ] **Step 6: Retarget public motion**

In `PublicMotion.tsx`, replace `.tls-feature-row .tls-rail-surface` with `.tls-feature-evidence-group .tls-rail-surface`. Keep the existing `reduce` early return and transform/opacity-only animation.

- [ ] **Step 7: Run focused feature verification**

Run only after approval:

```bash
rtk npx playwright test tests/responsive-sweep.spec.ts --grep "Feature paired|Feature proof"
rtk npx playwright test tests/public-dialogs.spec.ts --grep "product proof"
rtk npx tsc --noEmit
```

Expected: three group assertions PASS; five proof triggers remain; dialog focus, Escape, focus return, and scroll lock PASS.

- [ ] **Step 8: Review and request approval for the task commit**

After explicit commit approval:

```bash
rtk git add app/fitur/page.tsx components/PublicMotion.tsx css/site.css tests/responsive-sweep.spec.ts tests/public-dialogs.spec.ts
rtk git commit -m "refactor: concentrate product proof on features"
```

---

### Task 5: Replace guide screenshots and align the pricing illustration

**Files:**
- Modify: `app/panduan/page.tsx:4,24-59,71-86`
- Modify: `app/harga/page.tsx:66-73`
- Modify: `css/site.css:5367-5377` and current `.tl-guide-*`, `.tl-price-visual` blocks
- Modify: `tests/responsive-sweep.spec.ts:650-715`

**Interfaces:**
- Consumes: `MobileGuideEvidence()` and `WebGuideEvidence()` from Task 2.
- Produces: exactly two `[data-guide-evidence]` compositions and zero `PublicProductProof` on `/panduan`.
- Preserves: six guide steps, pricing copy, plans, FAQ, and purchase URLs.

- [ ] **Step 1: Add guide evidence assertions before changing the page**

Extend the existing guide tests:

```ts
await expect(page.locator('.tl-guide-phase')).toHaveCount(2);
await expect(page.locator('.tl-guide-step')).toHaveCount(6);
await expect(page.locator('[data-guide-evidence]')).toHaveCount(2);
await expect(page.locator('[data-guide-evidence="mobile"] [data-product-artifact="session"]')).toHaveCount(1);
await expect(page.locator('[data-guide-evidence="web"] [data-product-artifact="recap"]')).toHaveCount(1);
await expect(page.locator('[data-guide-evidence="web"] [data-product-artifact="invoice"]')).toHaveCount(1);
await expect(page.locator('.tl-public-guide [data-rail-proof], .tl-public-guide [data-proof-trigger]')).toHaveCount(0);
```

At 320 and 390 pixels, assert each artifact right edge is less than or equal to the phase right edge and the second phase begins below the first.

- [ ] **Step 2: Run and confirm the guide assertions fail**

Run only after approval:

```bash
rtk npx playwright test tests/responsive-sweep.spec.ts --grep "guide"
```

Expected: FAIL because `/panduan` still renders `PublicProductProof`.

- [ ] **Step 3: Replace `proofId` with an evidence node**

Change `PhaseSection` to accept `evidence: ReactNode`:

```tsx
import type { ReactNode } from "react";
import { MobileGuideEvidence, WebGuideEvidence } from "@/components/public-ui/product-evidence/workflow-canvas";

function PhaseSection({ title, description, steps, stepOffset = 0, evidence }: {
  title: string;
  description: string;
  steps: readonly (readonly [string, string])[];
  stepOffset?: number;
  evidence: ReactNode;
}) {
  return (
    <section className="tl-guide-phase">
      <div className="tl-guide-phase-copy">
        <div className="tl-guide-phase-header"><h2>{title}</h2><p>{description}</p></div>
        <ol className="tl-guide-steps">
          {steps.map(([stepTitle, stepBody], idx) => (
            <li className="tl-guide-step" key={stepTitle}>
              <span className="tl-guide-step-badge" aria-hidden="true">
                {String(idx + stepOffset + 1).padStart(2, "0")}
              </span>
              <div className="tl-guide-step-body">
                <h3>{stepTitle}</h3>
                <p>{stepBody}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="tl-guide-inline-proof">{evidence}</div>
    </section>
  );
}
```

Pass `evidence={<MobileGuideEvidence />}` to `Di HP.` and `evidence={<WebGuideEvidence />}` to `Di web.`. Remove the `PublicProductProof` import.

- [ ] **Step 4: Style guide phases as instructional two-column sections**

Use:

```css
.tl-guide-phase { display: grid; grid-template-columns: minmax(0, .9fr) minmax(420px, 1.1fr); gap: 64px; align-items: start; }
.tl-guide-inline-proof { min-width: 0; }

@media (max-width: 1023px) {
  .tl-guide-phase { grid-template-columns: 1fr; gap: 36px; }
}

@media (max-width: 767px) {
  .tl-guide-phase { gap: 24px; }
  .tl-guide-inline-proof { width: 100%; overflow: hidden; }
}
```

Keep current step badge, type, and divider styling. Remove screenshot-specific guide sizing only after confirming it has no other consumer.

- [ ] **Step 5: Align `/harga` with the artifact material tokens**

Add `data-symbolic-evidence="pricing"` to `PriceVisual`. Update only its material properties:

```css
.tl-price-visual[data-symbolic-evidence="pricing"] {
  border-color: var(--tl-line);
  border-radius: var(--tl-radius-surface);
  background: #fff;
}
.tl-price-visual[data-symbolic-evidence="pricing"] svg { color: var(--tl-green); }
```

Do not alter the illustration content, dimensions, plans, FAQ, or links beyond the one data-attribute hook shown above.

- [ ] **Step 6: Run focused guide and contract verification**

Run only after approval:

```bash
rtk npx tsx scripts/test-public-product-evidence-contract.mjs
rtk npx playwright test tests/responsive-sweep.spec.ts --grep "guide"
rtk npx tsc --noEmit
```

Expected: all PASS. The source contract now confirms route screenshot budgets.

- [ ] **Step 7: Review and request approval for the task commit**

After explicit commit approval:

```bash
rtk git add app/panduan/page.tsx app/harga/page.tsx css/site.css tests/responsive-sweep.spec.ts
rtk git commit -m "refactor: use artifacts in public guide"
```

---

### Task 6: Remove stale selectors and run the approved pre-merge audit

**Files:**
- Modify: `components/PublicMotion.tsx` only if a stale selector remains after Tasks 3-5.
- Modify: `css/site.css` to delete unreachable lower-home, feature-row, and guide screenshot selectors.
- Modify: `tests/responsive-sweep.spec.ts` only for final selector cleanup.
- Test: `scripts/test-public-product-evidence-contract.mjs`
- Test: `tests/responsive-sweep.spec.ts`
- Test: `tests/a11y.spec.ts`
- Test: `tests/public-dialogs.spec.ts`

**Interfaces:**
- Consumes: all route and artifact work from Tasks 1-5.
- Produces: no obsolete selector references and a verification report with explicit pass/skip state.

- [ ] **Step 1: Find stale structural selectors**

```bash
rtk rg -n "tl-landing-proof-story|data-feature-row|tls-feature-row|tl-guide-inline-proof.*tls-rail|tl-landing-feature-rows.*data-rail-proof" app components css tests
```

Expected: no application references to the removed row structures. Test references must use the new data attributes.

- [ ] **Step 2: Remove only unreachable CSS**

Delete selectors proven unused by Step 1. Keep generic `.tls-rail-proof`, `.tls-proof-dialog-*`, `.tls-recap-proof-*`, and `.tls-invoice-proof` because `/fitur` and its dialogs still use them.

- [ ] **Step 3: Run non-test completion checks**

These are the default completion checks:

```bash
rtk git diff --check
rtk git status --short
rtk git diff --stat
```

Expected: no whitespace errors; only intended application, test, and plan-related files are changed. `AGENTS.md` timestamp drift remains excluded from code commits.

- [ ] **Step 4: Ask for the pre-merge check selection**

Stop and ask Fatih whether to run or skip each of:

- Test and typecheck.
- Responsive sweep.
- Accessibility check.
- Visual regression/manual screenshot review.
- PDF export test.

Do not infer approval from earlier implementation approval.

- [ ] **Step 5: Run only the approved checks**

Commands by category:

```bash
# Focused contract and typecheck
rtk npx tsx scripts/test-public-product-evidence-contract.mjs
rtk npx tsc --noEmit

# Public responsive sweep at 320, 390, 768, 1024, 1440
rtk npm run test:responsive

# Public accessibility
rtk npm run test:a11y

# Dialog interaction
rtk npx playwright test tests/public-dialogs.spec.ts

# Visual regression, only if explicitly selected and its design server prerequisite is running
rtk npm run test:visual-diff

# Invoice PDF export, only if explicitly selected
rtk node scripts/test-invoice-export-contract.mjs
```

For manual visual review, inspect `/`, `/fitur`, `/harga`, and `/panduan` at all five required widths. Confirm route differentiation, readable proof scale, no horizontal overflow, reduced-motion fallback, and stable footer placement. Do not leave screenshots in the repo.

- [ ] **Step 6: Review and request approval for the final cleanup commit**

After explicit commit approval:

```bash
rtk git add components/PublicMotion.tsx css/site.css tests/responsive-sweep.spec.ts tests/public-dialogs.spec.ts scripts/test-public-product-evidence-contract.mjs
rtk git commit -m "test: verify public evidence hierarchy"
```

- [ ] **Step 7: Present branch completion options**

Report:

- Branch name and commits.
- Files changed.
- Checks run with exact result.
- Checks skipped.
- Any remaining intentional change such as automatic `AGENTS.md` timestamp drift.

Do not merge, push, or create a PR until Fatih explicitly selects that action.
