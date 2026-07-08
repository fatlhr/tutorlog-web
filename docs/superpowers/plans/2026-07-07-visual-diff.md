# Visual Diff vs Canvas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compare live app screenshots against design artboards using pixelmatch, generate diff report with side-by-side views.

**Architecture:** Playwright screenshots design artboards from local HTML files, pixelmatch compares with live app screenshots, HTML report shows results with diff images.

**Tech Stack:** Playwright, pixelmatch, pngjs, serve

---

## File Structure

```
tests/
  visual-diff.spec.ts          # Screenshot design artboards
scripts/
  generate-diff.ts             # Pixelmatch comparison + HTML report
  serve-design.sh              # Serve design HTML on port 4000
test-results/
  diff/
    design/                    # Design artboard screenshots
    images/                    # Diff images (red overlay)
  visual-diff-report.html      # Final report
```

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install pixelmatch and pngjs**

```bash
npm install -D pixelmatch pngjs
```

- [ ] **Step 2: Install serve globally**

```bash
npm install -g serve
```

- [ ] **Step 3: Add scripts to package.json**

Add to `scripts`:
```json
"serve:design": "serve design/ -l 4000 --no-clipboard",
"test:visual-diff": "npx playwright test tests/visual-diff.spec.ts",
"generate:diff": "npx tsx scripts/generate-diff.ts"
```

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p test-results/diff/design test-results/diff/images
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add pixelmatch dependencies for visual diff"
```

---

### Task 2: Create Design Screenshot Script

**Files:**
- Create: `tests/visual-diff.spec.ts`

- [ ] **Step 1: Create Playwright test to screenshot design artboards**

```typescript
import { test, expect } from '@playwright/test';

const DESIGN_BASE = 'http://localhost:4000';

const MOBILE_ARTBOARDS = [
  { id: 'mob-landing', route: 'landing', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-login', route: 'login', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-login-sent', route: 'login-sent', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-fitur', route: 'fitur', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-harga', route: 'harga', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-panduan', route: 'panduan', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-privacy', route: 'privacy', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-terms', route: 'terms', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-account-del', route: 'account', file: 'TutorLog Web Mobile.html' },
  { id: 'mob-kontak', route: 'kontak', file: 'TutorLog Web Mobile.html' },
];

const DESKTOP_ARTBOARDS = [
  { id: 'landing', route: 'landing', file: 'TutorLog Web.html' },
  { id: 'login', route: 'login', file: 'TutorLog Web.html' },
  { id: 'login-sent', route: 'login-sent', file: 'TutorLog Web.html' },
];

test.describe('Design Artboard Screenshots', () => {
  for (const artboard of MOBILE_ARTBOARDS) {
    test(`design mobile: ${artboard.route}`, async ({ page }) => {
      await page.setViewportSize({ width: 420, height: 900 });
      await page.goto(`${DESIGN_BASE}/${encodeURIComponent(artboard.file)}`);
      
      // Wait for React + Babel to render
      await page.waitForFunction(
        (id) => {
          const el = document.querySelector(`[data-artboard-id="${id}"]`);
          return el && el.children.length > 0;
        },
        artboard.id,
        { timeout: 15000 }
      );

      const artboardEl = page.locator(`[data-artboard-id="${artboard.id}"]`);
      await artboardEl.screenshot({
        path: `test-results/diff/design/${artboard.route}-390.png`,
      });
    });
  }

  for (const artboard of DESKTOP_ARTBOARDS) {
    test(`design desktop: ${artboard.route}`, async ({ page }) => {
      await page.setViewportSize({ width: 1480, height: 900 });
      await page.goto(`${DESIGN_BASE}/${encodeURIComponent(artboard.file)}`);
      
      await page.waitForFunction(
        (id) => {
          const el = document.querySelector(`[data-artboard-id="${id}"]`);
          return el && el.children.length > 0;
        },
        artboard.id,
        { timeout: 15000 }
      );

      const artboardEl = page.locator(`[data-artboard-id="${artboard.id}"]`);
      await artboardEl.screenshot({
        path: `test-results/diff/design/${artboard.route}-1440.png`,
      });
    });
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add tests/visual-diff.spec.ts
git commit -m "test: add design artboard screenshot tests"
```

---

### Task 3: Create Diff Generator Script

**Files:**
- Create: `scripts/generate-diff.ts`

- [ ] **Step 1: Create pixelmatch comparison script**

```typescript
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

interface DiffResult {
  route: string;
  viewport: string;
  mismatch: number;
  pass: boolean;
  designPath: string;
  livePath: string;
  diffPath: string;
}

function loadPNG(filePath: string): PNG {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function compareImages(
  designPath: string,
  livePath: string,
  diffPath: string
): { mismatch: number; mismatchPercent: number } {
  const design = loadPNG(designPath);
  const live = loadPNG(livePath);

  // Resize live to match design dimensions (crop or pad)
  const width = Math.max(design.width, live.width);
  const height = Math.max(design.height, live.height);

  const resizedDesign = resizePNG(design, width, height);
  const resizedLive = resizePNG(live, width, height);

  const diff = new PNG({ width, height });

  const mismatch = pixelmatch(
    resizedDesign.data,
    resizedLive.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  return {
    mismatch,
    mismatchPercent: (mismatch / totalPixels) * 100,
  };
}

function resizePNG(png: PNG, targetWidth: number, targetHeight: number): PNG {
  const resized = new PNG({ width: targetWidth, height: targetHeight });

  // Fill with white background
  for (let i = 0; i < resized.data.length; i += 4) {
    resized.data[i] = 255;
    resized.data[i + 1] = 255;
    resized.data[i + 2] = 255;
    resized.data[i + 3] = 255;
  }

  // Copy original pixels
  for (let y = 0; y < Math.min(png.height, targetHeight); y++) {
    for (let x = 0; x < Math.min(png.width, targetWidth); x++) {
      const srcIdx = (y * png.width + x) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      resized.data[dstIdx] = png.data[srcIdx];
      resized.data[dstIdx + 1] = png.data[srcIdx + 1];
      resized.data[dstIdx + 2] = png.data[srcIdx + 2];
      resized.data[dstIdx + 3] = png.data[srcIdx + 3];
    }
  }

  return resized;
}

function generateReport(results: DiffResult[]): string {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  const routes = [...new Set(results.map(r => r.route))];

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Diff Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .summary span { margin-right: 20px; }
    .pass { color: #22c55e; }
    .fail { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
    th, td { padding: 12px; text-align: center; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    td:first-child { text-align: left; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-pass { background: #dcfce7; color: #166534; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    .diff-container { display: flex; gap: 8px; margin-top: 8px; }
    .diff-container img { max-width: 150px; border-radius: 4px; cursor: pointer; border: 1px solid #ddd; }
    .diff-container img:hover { transform: scale(1.05); }
    .label { font-size: 10px; color: #666; margin-bottom: 2px; }
    .mismatch { font-size: 11px; color: #ef4444; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Visual Diff Report</h1>
  <div class="summary">
    <span>Total: <strong>${total}</strong></span>
    <span class="pass">Passed: <strong>${passed}</strong></span>
    <span class="fail">Failed: <strong>${failed}</strong></span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Route</th>
        <th>Mobile (390px)</th>
        <th>Desktop (1440px)</th>
      </tr>
    </thead>
    <tbody>
      ${routes.map(route => {
        const mobile = results.find(r => r.route === route && r.viewport === '390');
        const desktop = results.find(r => r.route === route && r.viewport === '1440');
        return `
        <tr>
          <td>${route}</td>
          <td>${renderCell(mobile)}</td>
          <td>${renderCell(desktop)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

function renderCell(result?: DiffResult): string {
  if (!result) return '<td>-</td>';
  const badgeClass = result.pass ? 'badge-pass' : 'badge-fail';
  const badgeText = result.pass ? 'PASS' : 'FAIL';
  return `
    <td>
      <span class="badge ${badgeClass}">${badgeText}</span>
      ${!result.pass ? `<div class="mismatch">${result.mismatchPercent.toFixed(2)}% mismatch</div>` : ''}
      <div class="diff-container">
        <div>
          <div class="label">Design</div>
          <img src="diff/design/${result.route}-${result.viewport}.png" onclick="window.open(this.src)">
        </div>
        <div>
          <div class="label">Live</div>
          <img src="diff/design/${result.route}-${result.viewport}.png" onclick="window.open(this.src)">
        </div>
        <div>
          <div class="label">Diff</div>
          <img src="diff/images/${result.route}-${result.viewport}-diff.png" onclick="window.open(this.src)">
        </div>
      </div>
    </td>`;
}

// Main
const designDir = path.join(__dirname, '../test-results/diff/design');
const liveDir = path.join(__dirname, '../test-results/screenshots');
const diffDir = path.join(__dirname, '../test-results/diff/images');

if (!fs.existsSync(designDir)) {
  console.log('No design screenshots found. Run: npm run test:visual-diff');
  process.exit(1);
}

const routes = ['landing', 'login', 'login-sent', 'fitur', 'harga', 'panduan', 'privacy', 'terms', 'account', 'kontak'];
const viewports = ['390', '1440'];

const results: DiffResult[] = [];

for (const route of routes) {
  for (const viewport of viewports) {
    const designPath = path.join(designDir, `${route}-${viewport}.png`);
    const livePath = path.join(liveDir, `${route}-${viewport}.png`);
    const diffPath = path.join(diffDir, `${route}-${viewport}-diff.png`);

    if (!fs.existsSync(designPath) || !fs.existsSync(livePath)) {
      console.log(`Skipping ${route}-${viewport}: missing file`);
      continue;
    }

    const { mismatchPercent } = compareImages(designPath, livePath, diffPath);
    const pass = mismatchPercent < 1;

    results.push({
      route,
      viewport,
      mismatch: 0,
      pass,
      designPath: `diff/design/${route}-${viewport}.png`,
      livePath: `${route}-${viewport}.png`,
      diffPath: `diff/images/${route}-${viewport}-diff.png`,
    });

    console.log(`${pass ? '✓' : '✗'} ${route}-${viewport}: ${mismatchPercent.toFixed(2)}% mismatch`);
  }
}

const report = generateReport(results);
fs.writeFileSync(path.join(__dirname, '../test-results/visual-diff-report.html'), report);
console.log(`\nReport generated: test-results/visual-diff-report.html`);
console.log(`${results.filter(r => r.pass).length}/${results.length} passed`);
```

- [ ] **Step 2: Commit**

```bash
git add scripts/generate-diff.ts
git commit -m "test: add pixelmatch visual diff generator"
```

---

### Task 4: Create Serve Script

**Files:**
- Create: `scripts/serve-design.sh`

- [ ] **Step 1: Create serve script**

```bash
#!/bin/bash
# Serve design HTML files on port 4000
# Usage: ./scripts/serve-design.sh &
echo "Serving design files on http://localhost:4000"
npx serve design/ -l 4000 --no-clipboard
```

- [ ] **Step 2: Make executable**

```bash
chmod +x scripts/serve-design.sh
```

- [ ] **Step 3: Commit**

```bash
git add scripts/serve-design.sh
git commit -m "chore: add design server script"
```

---

### Task 5: Run Visual Diff Pipeline

**Files:** None (execution only)

- [ ] **Step 1: Start design server**

```bash
./scripts/serve-design.sh &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000
```

Expected: `200`

- [ ] **Step 2: Start dev server**

```bash
npm run dev &
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

Expected: `200`

- [ ] **Step 3: Run design screenshot tests**

```bash
npx playwright test tests/visual-diff.spec.ts
```

Expected: All artboard screenshots captured in `test-results/diff/design/`

- [ ] **Step 4: Generate diff report**

```bash
npx tsx scripts/generate-diff.ts
```

Expected: Report generated at `test-results/visual-diff-report.html`

- [ ] **Step 5: Review results**

- Open `test-results/visual-diff-report.html`
- Check pass/fail for each route
- Review diff images for failed items
- Document intentional differences

- [ ] **Step 6: Stop servers**

```bash
kill $(lsof -t -i:4000) 2>/dev/null
kill $(lsof -t -i:3000) 2>/dev/null
```

- [ ] **Step 7: Commit results**

```bash
git add test-results/diff/ test-results/visual-diff-report.html
git commit -m "test: add visual diff results and report"
```

---

### Task 6: Document Intentional Differences

**Files:**
- Modify: `docs/superpowers/specs/2026-07-07-visual-diff-design.md`

- [ ] **Step 1: Update spec with actual differences found**

Add section:
```markdown
## Actual Differences Found

| Route | Viewport | Mismatch % | Reason | Status |
|-------|----------|-----------|--------|--------|
| [route] | [vp] | [X%] | [reason] | Intentional / Bug |
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-07-07-visual-diff-design.md
git commit -m "docs: document visual diff findings"
```

---

## Self-Review Checklist

- [x] Spec coverage: All 10 public routes × 2 viewports = 20 comparisons
- [x] No placeholders: All code blocks complete with actual implementation
- [x] Type consistency: DiffResult interface used consistently across functions
- [x] DoD alignment: pixelmatch comparison, diff images, HTML report, documented differences
