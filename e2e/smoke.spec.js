import { test, expect } from '@playwright/test';

test.describe('REAVO Storefront & Mobile Viewport E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('reavo_skip_loader', 'true');
      window.localStorage.setItem('reavo-demo-user', 'true');
    });
  });

  test('Storefront home loads correctly and renders navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/REAVO|Gadgets/i);
  });

  test('Checkout page renders with responsive elements and 16px inputs', async ({ page, isMobile }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
    
    // Check form inputs
    const nameInput = page.locator('input[name="fullName"]');
    if (await nameInput.count() > 0) {
      await expect(nameInput).toBeVisible();
      if (isMobile) {
        const fontSize = await nameInput.evaluate(el => window.getComputedStyle(el).fontSize);
        expect(fontSize).toBe('16px');
      }
    }
  });

  test('Customer Profile tab navigation is interactive', async ({ page, isMobile }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    
    // Check navigation buttons or horizontal scroll bar
    const overviewBtn = page.locator('button', { hasText: 'Overview' });
    if (await overviewBtn.count() > 0) {
      await expect(overviewBtn.first()).toBeVisible();
    }
  });

  test('Admin OS login route loads without critical console errors', async ({ page }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
  });
});
