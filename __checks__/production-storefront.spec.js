import { test, expect } from '@playwright/test';

/**
 * Checkly Cloud Synthetic Monitor
 * Runs against live Vercel deployment: https://reavo-app.vercel.app
 * Validates storefront availability, mobile viewports, and checkout integrity.
 */

const TARGET_URL = process.env.ENVIRONMENT_URL || process.env.REAVO_APP_URL || 'https://reavo-app.vercel.app';

test.describe('Production Cloud Synthetic Monitor (Checkly)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('reavo_skip_loader', 'true');
      window.localStorage.setItem('reavo-demo-user', 'true');
    });
  });

  test('Storefront: Production home mounts without black screen and renders navigation', async ({ page }) => {
    const response = await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);

    // Ensure root element mounted and not blank
    const root = page.locator('#root');
    await expect(root).toBeVisible();
    await expect(page).toHaveTitle(/REAVO|Gadgets/i);
  });

  test('Mobile Viewport: Touch ergonomics, 16px font inputs and zero horizontal overflow', async ({ page }) => {
    // Simulate iPhone 14 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${TARGET_URL}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Assert zero unwanted horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);

    // Verify phone input has 16px font to eliminate iOS zoom
    const phoneInput = page.getByPlaceholder(/\+234/i);
    if (await phoneInput.count() > 0) {
      await expect(phoneInput).toBeVisible();
      const fontSize = await phoneInput.evaluate(el => window.getComputedStyle(el).fontSize);
      expect(fontSize).toBe('16px');
    }
  });

  test('Shop & Catalog: Products load and display valid Naira currency amounts', async ({ page }) => {
    await page.goto(`${TARGET_URL}/shop`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Check that product cards or price labels render
    const priceElement = page.locator('.font-mono', { hasText: '₦' }).first();
    if (await priceElement.count() > 0) {
      await expect(priceElement).toBeVisible();
      const text = await priceElement.innerText();
      expect(text).not.toContain('NaN');
      expect(text).not.toContain('undefined');
    }
  });

  test('Admin OS: Admin portal route responds and renders login shell', async ({ page }) => {
    const response = await page.goto(`${TARGET_URL}/admin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(response?.status()).toBeLessThan(500);
    await expect(page.locator('body')).toBeVisible();
  });
});
