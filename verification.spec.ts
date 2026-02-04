import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

test('capture mobile landing and login', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({ path: 'verification/landing_mobile_new.png', fullPage: false });

  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'verification/login_mobile_new.png', fullPage: false });
});

test.describe('Desktop', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('capture desktop landing and login', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/landing_desktop_new.png', fullPage: false });

    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'verification/login_desktop_new.png', fullPage: false });
  });
});
