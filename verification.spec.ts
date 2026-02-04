import { test, expect } from '@playwright/test';

test.describe('Premium UI/UX Verification', () => {
  test('Capture Landing Page - Desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000); // Wait for animations
    await page.screenshot({ path: 'verification/landing_desktop.png', fullPage: true });
  });

  test('Capture Landing Page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/landing_mobile.png' });
  });

  test('Capture Login Page - Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'verification/login_mobile.png' });
  });
});
