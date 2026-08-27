import { expect, test } from '@playwright/test';

test.describe('Public dialogs', () => {
  test('product proof traps focus and restores the trigger', async ({ page }) => {
    await page.goto('/fitur');
    const trigger = page.getByRole('button', { name: 'Perbesar Aplikasi HP' }).first();
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Perbesar tampilan TutorLog' });
    const close = dialog.getByRole('button', { name: 'Tutup tampilan' });
    await expect(close).toBeFocused();
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe('hidden');

    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe('hidden');
  });
});
