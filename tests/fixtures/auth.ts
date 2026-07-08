import { Page } from '@playwright/test';

export async function login(page: Page): Promise<void> {
  const email = process.env.TEST_EMAIL!;

  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');

  await page.waitForURL('/app', { timeout: 10000 });
}
