import fs from 'fs';
import path from 'path';

interface TestResult {
  route: string;
  viewport: number;
  pass: boolean;
  scrollWidth: number;
  clientWidth: number;
  screenshot: string;
}

function generateReport(results: TestResult[]): string {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  const failed = total - passed;

  const routes = [...new Set(results.map(r => r.route))];
  const viewports = [...new Set(results.map(r => r.viewport))].sort((a, b) => a - b);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Sweep Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .summary span { margin-right: 20px; }
    .pass { color: #22c55e; }
    .fail { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    th, td { padding: 12px; text-align: center; border-bottom: 1px solid #eee; }
    th { background: #f8f9fa; font-weight: 600; }
    td:first-child { text-align: left; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-pass { background: #dcfce7; color: #166534; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    img { max-width: 200px; border-radius: 4px; cursor: pointer; }
    img:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <h1>Responsive Sweep Report</h1>
  <div class="summary">
    <span>Total: <strong>${total}</strong></span>
    <span class="pass">Passed: <strong>${passed}</strong></span>
    <span class="fail">Failed: <strong>${failed}</strong></span>
  </div>
  <table>
    <thead>
      <tr>
        <th>Route</th>
        ${viewports.map(v => `<th>${v}px</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${routes.map(route => `
        <tr>
          <td>${route}</td>
          ${viewports.map(viewport => {
            const result = results.find(r => r.route === route && r.viewport === viewport);
            if (!result) return '<td>-</td>';
            const badgeClass = result.pass ? 'badge-pass' : 'badge-fail';
            const badgeText = result.pass ? 'PASS' : 'FAIL';
            return `
              <td>
                <span class="badge ${badgeClass}">${badgeText}</span>
                <br>
                <img src="screenshots/${result.screenshot}" alt="${route} ${viewport}px" onclick="window.open(this.src)">
              </td>
            `;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
  `;
}

const resultsPath = path.join(__dirname, '../test-results/results.json');
if (fs.existsSync(resultsPath)) {
  const raw = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

  const results: TestResult[] = raw.suites.flatMap((suite: { specs: Array<{ title: string; ok?: boolean; attachments?: Array<{ name: string; path?: string }> }> }) =>
    suite.specs.map((spec) => {
      const titleParts = spec.title.match(/^(.+) at (\d+)px$/);
      const route = titleParts?.[1] ?? spec.title;
      const viewport = parseInt(titleParts?.[2] ?? '0', 10);
      const ok = spec.ok ?? false;
      const screenshot = spec.attachments?.find((a: { name: string; path?: string }) => a.name === 'screenshot')?.path ?? '';
      return { route, viewport, pass: ok, scrollWidth: 0, clientWidth: 0, screenshot: path.basename(screenshot) };
    })
  );

  const report = generateReport(results);
  fs.writeFileSync(path.join(__dirname, '../test-results/responsive-report.html'), report);
  console.log('Report generated: test-results/responsive-report.html');
} else {
  console.log('No results.json found. Run tests first.');
}
