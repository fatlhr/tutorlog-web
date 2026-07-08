import { test } from '@playwright/test';

const DESIGN_BASE = 'http://localhost:4000';

const MOBILE_ARTBOARDS = [
  { id: 'mob-landing', route: 'landing' },
  { id: 'mob-login', route: 'login' },
  { id: 'mob-login-sent', route: 'login-sent' },
  { id: 'mob-fitur', route: 'fitur' },
  { id: 'mob-harga', route: 'harga' },
  { id: 'mob-panduan', route: 'panduan' },
  { id: 'mob-privacy', route: 'privacy' },
  { id: 'mob-terms', route: 'terms' },
  { id: 'mob-account-del', route: 'account' },
  { id: 'mob-kontak', route: 'kontak' },
];

test.describe('Design Artboard Screenshots — Mobile', () => {
  for (const artboard of MOBILE_ARTBOARDS) {
    test(`design mobile: ${artboard.route}`, async ({ page }) => {
      await page.setViewportSize({ width: 420, height: 900 });
      await page.goto(`${DESIGN_BASE}/renderer-mobile.html`);

      // Wait for React + Babel to render the artboard
      await page.waitForFunction(
        (id) => {
          const el = document.querySelector(`[data-artboard-id="${id}"]`);
          return el && el.children.length > 0;
        },
        artboard.id,
        { timeout: 20000 }
      );

      const artboardEl = page.locator(`[data-artboard-id="${artboard.id}"]`);
      await artboardEl.waitFor({ state: 'visible' });

      await artboardEl.screenshot({
        path: `design-screenshots/${artboard.route}-390.png`,
      });
    });
  }
});
