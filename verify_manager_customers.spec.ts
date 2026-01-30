import { test, expect } from '@playwright/test';

test('manager customers page renders', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'manager@example.com');
  await page.fill('input[type="password"]', 'any');
  await page.click('button:has-text("Sign In")');

  await expect(page).toHaveURL('http://localhost:3000/manager');

  // Click on Customers in sidebar
  await page.click('a:has-text("Customers")');
  await expect(page).toHaveURL('http://localhost:3000/manager/customers');

  await expect(page.locator('h2')).toContainText('Customers');
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('text=John Customer')).toBeVisible();

  await page.screenshot({ path: 'verification/manager_customers.png' });
});
