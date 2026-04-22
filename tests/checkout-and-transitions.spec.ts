import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('email-input').fill('qa@nexuslearnr.com');
  await page.getByTestId('password-input').fill('123456');
  await page.getByTestId('login-submit').click();
});

test('advances appointment status', async ({ page }) => {
  await page.getByTestId('advance-1').scrollIntoViewIfNeeded();
  await page.getByTestId('advance-1').click({ force: true });
  await expect(page.getByTestId('row-1')).toContainText('Confirmed');
});

test('checkout shows outage failure then recovers', async ({ page }) => {
  await page.getByTestId('flag-outage').check();
  await page.getByTestId('open-checkout').click();
  await page.getByTestId('checkout-confirm').click();
  await expect(page.getByTestId('checkout-message')).toContainText('timeout');

  await page.getByTestId('checkout-close').click();
  await page.getByTestId('flag-outage').uncheck();
  await page.getByTestId('open-checkout').click();
  await page.getByTestId('coupon-input').fill('SPRING10');
  await page.getByTestId('payment-method').selectOption('pix');
  await page.getByTestId('checkout-confirm').click();
  await expect(page.getByTestId('checkout-message')).toContainText('completed');
});
