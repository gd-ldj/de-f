import { expect, test } from '@playwright/test';

test.describe('Sentry test panel', () => {
  test('shows the local manual Sentry controls on /test', async ({ page }) => {
    await page.goto('/test');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('sentry-test-panel')).toBeVisible();
    await expect(page.getByTestId('sentry-site-environment')).toHaveText(/beta/i);
    await expect(page.getByTestId('sentry-environment')).toHaveText(/dev/i);
    await expect(
      page.getByRole('button', { name: /capture test message/i })
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /capture test exception/i })
    ).toBeVisible();
  });
});
