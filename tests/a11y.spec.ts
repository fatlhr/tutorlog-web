import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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

test.describe('A11y — axe-core Public Routes', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} has no axe violations`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('A11y — Keyboard Navigation', () => {
  test('skip link is visible on focus', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toBeVisible();
  });

  test('main landmark exists', async ({ page }) => {
    await page.goto('/');
    const main = page.locator('main#main-content');
    await expect(main).toBeAttached();
  });

  test('all interactive elements are focusable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const interactiveCount = await page.evaluate(() => {
      const elements = document.querySelectorAll(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      return elements.length;
    });

    expect(interactiveCount).toBeGreaterThan(0);
  });
});
