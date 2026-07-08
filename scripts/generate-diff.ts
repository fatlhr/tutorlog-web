import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

interface DiffResult {
  route: string;
  viewport: string;
  mismatchPercent: number;
  pass: boolean;
}

function loadPNG(filePath: string): PNG {
  return PNG.sync.read(fs.readFileSync(filePath));
}

function resizePNG(png: PNG, targetWidth: number, targetHeight: number): PNG {
  const resized = new PNG({ width: targetWidth, height: targetHeight });
  for (let i = 0; i < resized.data.length; i += 4) {
    resized.data[i] = 255;
    resized.data[i + 1] = 255;
    resized.data[i + 2] = 255;
    resized.data[i + 3] = 255;
  }
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

function compareImages(designPath: string, livePath: string, diffPath: string): number {
  const design = loadPNG(designPath);
  const live = loadPNG(livePath);

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
  return (mismatch / (width * height)) * 100;
}

function generateReport(results: DiffResult[]): string {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;
  const routes = [...new Set(results.map(r => r.route))];

  return `<!DOCTYPE html>
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
    .mismatch { font-size: 11px; color: #ef4444; font-weight: 600; margin-top: 4px; }
    .diff-container { display: flex; gap: 8px; margin-top: 8px; justify-content: center; }
    .diff-container img { max-width: 120px; max-height: 150px; border-radius: 4px; cursor: pointer; border: 1px solid #ddd; object-fit: contain; }
    .diff-container img:hover { transform: scale(1.05); }
    .label { font-size: 10px; color: #666; margin-bottom: 2px; }
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
      <tr><th>Route</th><th>Mobile (390px)</th></tr>
    </thead>
    <tbody>
      ${routes.map(route => {
        const r = results.find(x => x.route === route);
        if (!r) return `<tr><td>${route}</td><td>-</td></tr>`;
        const badgeClass = r.pass ? 'badge-pass' : 'badge-fail';
        return `<tr>
          <td>${route}</td>
          <td>
            <span class="badge ${badgeClass}">${r.pass ? 'PASS' : 'FAIL'}</span>
            ${!r.pass ? `<div class="mismatch">${r.mismatchPercent.toFixed(2)}% mismatch</div>` : ''}
            <div class="diff-container">
              <div><div class="label">Design</div><img src="../design-screenshots/${r.route}-390.png" onclick="window.open(this.src)"></div>
              <div><div class="label">Live</div><img src="../live-screenshots/${r.route}-390.png" onclick="window.open(this.src)"></div>
              <div><div class="label">Diff</div><img src="diff/images/${r.route}-390-diff.png" onclick="window.open(this.src)"></div>
            </div>
          </td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

// Main
const designDir = path.join(__dirname, '../design-screenshots');
const liveDir = path.join(__dirname, '../live-screenshots');
const diffDir = path.join(__dirname, '../test-results/diff/images');
const reportDir = path.join(__dirname, '../test-results');

if (!fs.existsSync(designDir)) {
  console.log('No design screenshots found. Run: npm run test:visual-diff');
  process.exit(1);
}

fs.mkdirSync(diffDir, { recursive: true });

const routes = ['landing', 'login', 'login-sent', 'fitur', 'harga', 'panduan', 'privacy', 'terms', 'account', 'kontak', 'app-rekap', 'app-invoice'];
const results: DiffResult[] = [];

for (const route of routes) {
  const designPath = path.join(designDir, `${route}-390.png`);
  const livePath = path.join(liveDir, `${route}-390.png`);
  const diffPath = path.join(diffDir, `${route}-390-diff.png`);

  if (!fs.existsSync(designPath) || !fs.existsSync(livePath)) {
    console.log(`Skipping ${route}: missing file (design: ${fs.existsSync(designPath)}, live: ${fs.existsSync(livePath)})`);
    continue;
  }

  const mismatchPercent = compareImages(designPath, livePath, diffPath);
  const pass = mismatchPercent < 1;

  results.push({ route, viewport: '390', mismatchPercent, pass });
  console.log(`${pass ? '✓' : '✗'} ${route}: ${mismatchPercent.toFixed(2)}% mismatch`);
}

const report = generateReport(results);
fs.writeFileSync(path.join(reportDir, 'visual-diff-report.html'), report);
console.log(`\nReport: test-results/visual-diff-report.html`);
console.log(`${results.filter(r => r.pass).length}/${results.length} passed`);
