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

      const heading = page.locator('.tl-landing-standard .tl-landing-hero h1');
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
      const fontSize = Number.parseFloat(await heading.evaluate((element) => window.getComputedStyle(element).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(viewport === 1440 ? 60 : 52);

      const primaryCta = page.locator('.tl-landing-standard .tl-landing-hero .tl-button-primary');
      await expect(primaryCta).toBeVisible();
      const ctaBox = await primaryCta.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { bottom: rect.bottom, viewport: window.innerHeight };
      });

      expect(ctaBox.bottom).toBeLessThanOrEqual(ctaBox.viewport);

      await expect(page.locator('.tl-landing-hero')).toBeVisible();
      await expect(page.locator('.tl-landing-hero-side-shot')).toBeVisible();
      await expect(page.locator('.tl-hero-schedule')).toBeVisible();
      await expect(page.locator('.tl-hero-schedule-day')).toHaveCount(6);
      await expect(page.locator('.tl-hero-schedule-hour')).toHaveCount(7);
      await expect(page.locator('[data-schedule-session]')).toHaveCount(3);
    });
  }

  test('mobile hero keeps its title within three lines', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metrics = await page.locator('.tl-landing-standard .tl-landing-hero h1').evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        height: element.getBoundingClientRect().height,
        lineHeight: Number.parseFloat(style.lineHeight),
      };
    });

    expect(Math.ceil(metrics.height / metrics.lineHeight)).toBeLessThanOrEqual(3);
    await expect(page.locator('.tl-hero-schedule')).toBeVisible();
    const hidden = await page.locator('.tl-hero-schedule-day, .tl-hero-schedule-hour, [data-schedule-session]').evaluateAll((elements) =>
      elements.every((element) => element.getClientRects().length === 0),
    );
    expect(hidden).toBe(true);
  });

  test('keeps storyboard proof media readable during its entrance', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const proof = page.locator('.tl-landing-feature-rows .tls-rail-surface').first();
    await proof.scrollIntoViewIfNeeded();
    const opacity = Number.parseFloat(await proof.evaluate((element) => window.getComputedStyle(element).opacity));

    expect(opacity).toBe(1);
  });

  test('keeps the timetable canvas inside the hero at every landing breakpoint', async ({ page }) => {
    for (const [width, height] of [[1440, 900], [1024, 768], [390, 844]]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const metrics = await page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>('.tl-landing-hero');
        const canvas = document.querySelector<HTMLElement>('.tl-hero-schedule');
        const proof = document.querySelector<HTMLElement>('.tl-landing-mobile-proof .tls-rail-proof');
        if (!hero || !canvas || !proof) return null;

        const heroRect = hero.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const proofRect = proof.getBoundingClientRect();
        return { heroRect, canvasRect, proofRect };
      });

      expect(metrics).not.toBeNull();
      expect(metrics?.canvasRect.left).toBeGreaterThanOrEqual(metrics?.heroRect.left ?? 0);
      expect(metrics?.canvasRect.right).toBeLessThanOrEqual(metrics?.heroRect.right ?? 0);

      if (width === 1024) {
        const labelsVisible = await page.locator('.tl-hero-schedule-day, .tl-hero-schedule-hour').evaluateAll((elements) =>
          elements.some((element) => element.getClientRects().length > 0),
        );
        expect(labelsVisible).toBe(false);
      }

      if (width === 390) {
        expect(metrics?.canvasRect.height).toBeLessThanOrEqual(metrics?.proofRect.height ?? 0);
      }
    }
  });

  test('opens and closes the temporary demo video dialog', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const demoTrigger = page.getByRole('button', { name: 'Lihat demo' });
    await expect(demoTrigger).toBeVisible();
    await demoTrigger.click();

    const dialog = page.getByRole('dialog', { name: 'Demo TutorLog' });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('iframe[title="Video demo TutorLog"]')).toHaveAttribute('src', /youtube-nocookie/);
    await expect(dialog.getByRole('button', { name: 'Tutup demo' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });
});

test.describe('Homepage story structure', () => {
  test('uses a dedicated landing composition without a story rail', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.vp-desktop, .vp-mobile')).toHaveCount(0);
    await expect(page.locator('.tls-story-rail, .tls-story-grid')).toHaveCount(0);
    await expect(page.locator('.tl-landing-mobile-proof')).toHaveCount(1);
    await expect(page.locator('.tl-landing-proof-story')).toHaveCount(3);
    await expect(page.locator('.tl-landing-hero-mascot')).toHaveCount(0);
  });

  test('keeps the timetable canvas exclusive to the landing hero', async ({ page }) => {
    for (const path of ['/fitur', '/panduan']) {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('.tl-hero-schedule')).toHaveCount(0);
    }
  });

  test('states how one recorded session feeds the product storyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Satu sesi yang tersimpan langsung jadi rekap dan invoice.' })).toBeVisible();
  });

  test('keeps the hero and landing closing sections outside the product proof rows', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.tl-landing-hero')).toHaveCount(1);
    await expect(page.locator('.tl-landing-closing .tls-hover-quote')).toHaveCount(1);
    await expect(page.locator('.tl-landing-closing .tls-final-action')).toHaveCount(1);

    const metrics = await page.evaluate(() => {
      const hero = document.querySelector<HTMLElement>('.tl-landing-hero');
      const featureRows = document.querySelector<HTMLElement>('.tl-landing-feature-rows');
      if (!hero || !featureRows) return null;

      const heroRect = hero.getBoundingClientRect();
      const rowsRect = featureRows.getBoundingClientRect();
      return { heroWidth: heroRect.width, heroBottom: heroRect.bottom, rowsTop: rowsRect.top };
    });

    expect(metrics).not.toBeNull();
    expect(metrics?.heroWidth).toBeGreaterThan(1000);
    expect(metrics?.rowsTop).toBeGreaterThanOrEqual(metrics?.heroBottom ?? 0);
  });

  test('offers softer links to features, pricing, and the guide', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const explore = page.locator('.tl-landing-explore');
    await expect(explore).toBeVisible();
    await expect(explore.locator('a[href="/fitur"]')).toBeVisible();
    await expect(explore.locator('a[href="/harga"]')).toBeVisible();
    await expect(explore.locator('a[href="/panduan"]')).toBeVisible();
  });

  test('stacks the three proof stories on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const positions = await page.locator('.tl-landing-proof-story').evaluateAll((elements) =>
      elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
      }),
    );

    expect(positions).toHaveLength(3);
    expect(positions[1].top).toBeGreaterThanOrEqual(positions[0].bottom);
    expect(positions[2].top).toBeGreaterThanOrEqual(positions[1].bottom);
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

  test('mobile menu trigger sits at the right edge of the navigation', async ({ page }) => {
    await page.setViewportSize({ width: 516, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metrics = await page.evaluate(() => {
      const nav = document.querySelector<HTMLElement>('.tl-public-nav');
      const trigger = document.querySelector<HTMLElement>('.tl-public-menu .hamburger');
      if (!nav || !trigger) return null;

      const navRect = nav.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      return { navRight: navRect.right, triggerRight: triggerRect.right, triggerLeft: triggerRect.left, navCenter: navRect.left + navRect.width / 2 };
    });

    expect(metrics).not.toBeNull();
    expect(metrics?.triggerRight).toBeGreaterThanOrEqual((metrics?.navRight ?? 0) - 1);
    expect(metrics?.triggerLeft).toBeGreaterThan(metrics?.navCenter ?? 0);
  });

  test('active desktop route has a visible border indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/fitur');
    await page.waitForLoadState('networkidle');

    const border = await page.locator('.tl-public-nav a[href="/fitur"]').evaluate((element) => window.getComputedStyle(element).borderBottomWidth);
    expect(border).toBe('2px');
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
    await page.goto('/fitur');
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
      const hero = document.querySelector<HTMLElement>('.tl-landing-hero');
      const action = document.querySelector<HTMLElement>('.tl-landing-hero .tl-button-primary');
      const proof = document.querySelector<HTMLElement>('.tl-landing-mobile-proof .tls-rail-proof');
      if (!hero || !action || !proof) return null;

      const heroRect = hero.getBoundingClientRect();
      const actionRect = action.getBoundingClientRect();
      const proofRect = proof.getBoundingClientRect();

      return {
        actionWidth: actionRect.width,
        proofTop: proofRect.top,
        actionBottom: actionRect.bottom,
        heroBottom: heroRect.bottom,
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics?.actionWidth).toBeLessThanOrEqual(342);
    expect(metrics?.proofTop).toBeGreaterThanOrEqual(metrics?.actionBottom ?? 0);
    expect(metrics?.proofTop).toBeLessThanOrEqual(metrics?.heroBottom ?? 0);
  });

  test('keeps hero actions and mobile proof compact at 516px', async ({ page }) => {
    await page.setViewportSize({ width: 516, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const metrics = await page.evaluate(() => {
      const cta = document.querySelector<HTMLElement>('.tl-landing-hero .tl-button-primary');
      const proof = document.querySelector<HTMLElement>('.tl-landing-mobile-proof .tls-rail-proof');
      if (!cta || !proof) return null;

      return {
        ctaWidth: cta.getBoundingClientRect().width,
        proofWidth: proof.getBoundingClientRect().width,
      };
    });

    expect(metrics).not.toBeNull();
    expect(metrics?.ctaWidth).toBeLessThan(260);
    expect(metrics?.proofWidth).toBeLessThanOrEqual(200);
  });

  test('uses a distinct full-width band for the final mobile action', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const background = await page.locator('.tls-final-action').evaluate((element) => window.getComputedStyle(element).backgroundColor);
    expect(background).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('keeps product navigation out of the mobile footer', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.tl-footer a[href="/fitur"]')).toBeHidden();
    await expect(page.locator('.tl-footer a[href="/privacy"]')).toBeVisible();
  });

  test('keeps duplicated product navigation out of the desktop footer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const footer = page.locator('.tl-footer');
    await expect(footer.locator('a[href="/fitur"]')).toHaveCount(0);
    await expect(footer.locator('a[href="/harga"]')).toHaveCount(0);
    await expect(footer.locator('a[href="/panduan"]')).toHaveCount(0);
    await expect(footer.locator('a[href="/kontak"]')).toBeVisible();
  });
});
