import { test, expect } from '@playwright/test';

const VIEWPORTS = [320, 390, 768, 1024, 1440];

const PUBLIC_ROUTES = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'login-sent', path: '/login/sent' },
  { name: 'fitur', path: '/fitur' },
  { name: 'harga', path: '/harga' },
  { name: 'panduan', path: '/panduan' },
  { name: 'privacy', path: '/privacy' },
  { name: 'terms', path: '/terms' },
  { name: 'account', path: '/account' },
  { name: 'kontak', path: '/kontak' },
];

test.describe('Responsive Sweep - Public Routes', () => {
  for (const route of PUBLIC_ROUTES) {
    for (const viewport of VIEWPORTS) {
      test(`${route.name} at ${viewport}px`, async ({ page }) => {
        await page.setViewportSize({ width: viewport, height: 800 });
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

        expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

        await page.screenshot({
          path: `live-screenshots/${route.name}-${viewport}.png`,
          fullPage: true,
        });
      });
    }
  }
});

test.describe('Homepage hero guardrails', () => {
  for (const viewport of [1024, 1440]) {
    test(`desktop hero remains compact at ${viewport}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const heading = page.locator('.vp-desktop .tl-hero h1');
      await expect(heading).toBeVisible();
      const metrics = await heading.evaluate((element) => {
        const style = window.getComputedStyle(element);
        const lineHeight = Number.parseFloat(style.lineHeight);
        return {
          height: element.getBoundingClientRect().height,
          lineHeight,
        };
      });

      expect(Math.ceil(metrics.height / metrics.lineHeight)).toBeLessThanOrEqual(2);

      const primaryCta = page.locator('.vp-desktop .tl-hero .tl-button-primary');
      await expect(primaryCta).toBeVisible();
      const ctaBox = await primaryCta.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, viewport: window.innerHeight };
      });

      expect(ctaBox.bottom).toBeLessThanOrEqual(ctaBox.viewport);
    });
  }
});

test.describe('Public navigation guardrails', () => {
  test('mobile menu keeps keyboard focus inside the open dialog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/fitur');
    await page.waitForLoadState('networkidle');

    const trigger = page.getByRole('button', { name: 'Buka menu' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Menu navigasi' });
    await expect(dialog).toBeVisible();

    const closeButton = dialog.getByRole('button', { name: 'Tutup menu' });
    await expect(closeButton).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: 'TutorLog' })).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: 'Masuk dengan Magic Link' })).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('link', { name: 'TutorLog' })).toBeFocused();
  });

  test('desktop public navigation stays on one row', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/fitur');
    await page.waitForLoadState('networkidle');

    const nav = page.locator('.tl-public-nav');
    await expect(nav).toBeVisible();
    const metrics = await nav.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { height: rect.height };
    });

    expect(metrics.height).toBeLessThanOrEqual(84);
  });
});

test.describe('Feature rail guardrails', () => {
  for (const viewport of [390, 1052]) {
    test(`feature rail labels do not overlap at ${viewport}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport, height: 844 });
      await page.goto('/fitur');
      await page.waitForLoadState('networkidle');

      const railItems = await page.locator('.tl-product-rail .tl-rail-path li').evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        }),
      );
      const notes = await page.locator('.tl-product-rail .tl-rail-note').evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
        }),
      );

      for (const item of railItems) {
        for (const note of notes) {
          const overlaps = item.left < note.right && item.right > note.left && item.top < note.bottom && item.bottom > note.top;
          expect(overlaps).toBe(false);
        }
      }
    });
  }
});
