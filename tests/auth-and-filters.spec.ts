import { expect, test } from '@playwright/test';

test('shows validation and allows successful login', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('login-submit').click();
  await expect(page.getByTestId('login-error')).toContainText('valid email');

  await page.getByTestId('email-input').fill('qa@nexuslearnr.com');
  await page.getByTestId('password-input').fill('123456');
  await page.getByTestId('remember-me').check();
  await page.getByTestId('login-submit').click();

  await expect(page.getByTestId('app-shell')).toBeVisible();
});

test('applies filters and reaches empty state', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('email-input').fill('qa@nexuslearnr.com');
  await page.getByTestId('password-input').fill('123456');
  await page.getByTestId('login-submit').click();

  await page.getByTestId('status-filter').selectOption('cancelled');
  await expect(page.getByTestId('appointments-table')).toContainText('Liam Brown');

  await page.getByTestId('search-input').fill('NoMatchString');
  await expect(page.getByTestId('empty-state')).toBeVisible();
});
