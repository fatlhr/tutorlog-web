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
          path: test.info().outputPath(`${route.name}-${viewport}.png`),
          fullPage: true,
        });
      });
    }
  }
});

test.describe('Homepage hero guardrails', () => {
  for (const viewport of [1024, 1440]) {
    test(`story hero remains compact at ${viewport}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport, height: 900 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const heading = page.locator('.tls-story-page .tls-story-hero h1');
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

      const primaryCta = page.locator('.tls-story-page .tls-story-hero .tl-button-primary');
      await expect(primaryCta).toBeVisible();
      const ctaBox = await primaryCta.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, viewport: window.innerHeight };
      });

      expect(ctaBox.bottom).toBeLessThanOrEqual(ctaBox.viewport);

      await expect(page.locator('.tls-story-rail')).toBeVisible();
    });
  }
});

test.describe('Homepage story structure', () => {
  test('uses one responsive tree and moves proof into the narrative on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.vp-desktop, .vp-mobile')).toHaveCount(0);
    await expect(page.locator('.tls-story-rail')).toBeHidden();
    await expect(page.locator('.tls-mobile-proof')).toHaveCount(3);
  });
});

test.describe('Public navigation guardrails', () => {
  test('marks the current public route in the desktop navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/fitur');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.tl-public-nav a[href="/fitur"]')).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('.tl-public-nav a[href="/harga"]')).not.toHaveAttribute('aria-current', 'page');
  });

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

test.describe('Feature story rail', () => {
  test('uses three narrative chapters and a desktop-only rail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/fitur');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.tls-feature-chapter')).toHaveCount(3);
    await expect(page.locator('.tls-story-rail')).toBeVisible();
  });

  test('keeps product proof inside the feature narrative on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/fitur');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.tls-story-rail')).toBeHidden();
    await expect(page.locator('.tls-feature-chapter .tls-mobile-proof')).toHaveCount(3);
  });
});

test.describe('Public story rail contract', () => {
  for (const route of ['/', '/fitur', '/panduan']) {
    test(`${route} removes the legacy step and placeholder surfaces`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('.tl-rail-path, .tl-strip-route, .tl-guide-step-route')).toHaveCount(0);
      await expect(page.locator('.tl-mini-invoice, .tl-export-placeholder, .tl-strip-slot, .tl-flow-slot, .tl-guide-web-slot')).toHaveCount(0);
    });
  }
});

test.describe('Public story rail motion guardrails', () => {
  test('keeps product proof fully visible when reduced motion is requested', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const surfaces = page.locator('.tls-story-rail .tls-rail-surface');
    await expect(surfaces).toHaveCount(3);

    const opacities = await surfaces.evaluateAll((elements) =>
      elements.map((element) => window.getComputedStyle(element).opacity),
    );

    expect(opacities).toEqual(['1', '1', '1']);
  });
});

test.describe('Guide story hierarchy', () => {
  test('groups the guide into two phases with a desktop rail', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/panduan');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.tls-guide-phase')).toHaveCount(2);
    await expect(page.locator('.tls-guide-step')).toHaveCount(6);
    await expect(page.locator('.tls-story-rail')).toBeVisible();
  });

  test('keeps guide steps and proof readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/panduan');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.tls-story-rail')).toBeHidden();
    await expect(page.locator('.tls-guide-phase')).toHaveCount(2);
    await expect(page.locator('.tls-guide-phase .tls-mobile-proof')).toHaveCount(3);
  });
});

test.describe('Landing mobile story guardrails', () => {
  test('hero action and first product proof remain in a linear mobile story', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metrics = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>('.tls-story-hero');
      const action = document.querySelector<HTMLElement>('.tls-story-actions .tl-button-primary');
      const proof = document.querySelector<HTMLElement>('.tls-mobile-proof');
      if (!hero || !action || !proof) return null;

      const heroRect = hero.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      const proofRect = proof.getBoundingClientRect();

      return {
        actionWidth: actionRect.width,
        proofTop: proofRect.top,
        heroBottom: heroRect.bottom,
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics?.actionWidth).toBeLessThanOrEqual(342);
    expect(metrics?.proofTop).toBeGreaterThanOrEqual(metrics?.heroBottom ?? 0);
  });
});
