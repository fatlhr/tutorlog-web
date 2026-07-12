import { expect, test } from '@playwright/test';

test.describe('Public dialogs', () => {
  test('demo discloses placeholder content and contains keyboard focus', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Lihat demo' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Preview sementara TutorLog' });
    const close = dialog.getByRole('button', { name: 'Tutup demo', exact: true });
    const frame = dialog.locator('iframe');
    const startGuard = dialog.getByRole('button', { name: 'Kembali ke video demo' });
    const endGuard = dialog.getByRole('button', { name: 'Kembali ke tombol tutup demo' });

    await expect(dialog).toContainText('Video contoh sementara');
    await expect(dialog).toContainText(
      'Video ini hanya contoh sementara, bukan rekaman TutorLog. Rekaman TutorLog sedang disiapkan.',
    );
    await expect(frame).toHaveAttribute('title', 'Video contoh sementara');
    await expect(startGuard).not.toHaveAttribute('aria-hidden');
    await expect(endGuard).not.toHaveAttribute('aria-hidden');
    await expect(close).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    await page.keyboard.press('Shift+Tab');
    await expect(frame).toBeFocused();
    await expect(dialog).toContainText('Rekaman TutorLog sedang disiapkan');

    await endGuard.focus();
    await expect(close).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('product proof traps focus and restores the trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: 'Perbesar Mobile' }).first();
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Perbesar tampilan TutorLog' });
    const close = dialog.getByRole('button', { name: 'Tutup tampilan' });
    await expect(close).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');

    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  });
});
