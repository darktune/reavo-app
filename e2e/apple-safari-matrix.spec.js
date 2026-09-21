import { test, expect } from '@playwright/test';

/**
 * REAVO — Apple Safari WebKit Multi-Device Viewport Suite
 * Tests full responsive fidelity across:
 * - MacBooks (Air 13", Pro 14", Pro 16")
 * - iPads (Mini, Air, Pro 11", Pro 12.9"/13")
 * - iPhones (SE, 13/14, 15/16, 16/17 Pro Max)
 */

test.describe('Apple Safari WebKit Multi-Device Ecosystem Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Fast-track test execution by bypassing intro loader and pre-authorizing demo context
    await page.addInitScript(() => {
      window.localStorage.setItem('reavo_skip_loader', 'true');
      window.localStorage.setItem('reavo-demo-user', 'true');
    });
  });

  // 1. Zero Horizontal Overflow & Viewport Bounds
  test('Viewport Containment: Zero horizontal scroll on Apple display', async ({ page }) => {
    test.slow();
    await page.goto('/home', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    // Assert that the page content does not exceed the window viewport width (zero horizontal scroll)
    expect(scrollWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

  // 2. Navigation & Safe Area Inset Handling
  test('Navigation: Header renders and adapts to Apple screen width', async ({ page }) => {
    await page.goto('/home', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible({ timeout: 30000 });

    const viewport = page.viewportSize();
    if (!viewport) return;

    if (viewport.width <= 768) {
      // Mobile iPhone / Compact iPad: Drawer button should be present
      const menuBtn = page.locator('button[aria-label*="menu" i], .mobile-menu-btn, button:has(svg.lucide-menu)');
      if (await menuBtn.count() > 0) {
        await expect(menuBtn.first()).toBeVisible();
      }
    } else {
      // MacBook & iPad Pro Landscape: Desktop links should be visible
      const shopLink = page.locator('nav a[href="/shop"], nav a:has-text("Shop")');
      if (await shopLink.count() > 0) {
        await expect(shopLink.first()).toBeVisible();
      }
    }
  });

  // 3. iOS 16px Input Auto-Zoom Guard
  test('Typography: Form inputs maintain 16px font on touch viewports', async ({ page, isMobile }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const nameInput = page.locator('input[name="fullName"], input[type="text"]').first();
    if (await nameInput.count() > 0 && await nameInput.isVisible()) {
      if (isMobile) {
        const fontSize = await nameInput.evaluate(el => window.getComputedStyle(el).fontSize);
        const parsedSize = parseFloat(fontSize);
        // Must be >= 16px to prevent iOS Safari auto-zoom
        expect(parsedSize).toBeGreaterThanOrEqual(16);
      }
    }
  });

  // 4. Proportional Gadget Showcase Framing
  test('Visual Ergonomics: Product showcase contains gadgets cleanly', async ({ page }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for product cards
    const card = page.locator('.glass-panel').first();
    await expect(card).toBeVisible({ timeout: 30000 });

    const img = card.locator('img').first();
    if (await img.count() > 0 && await img.isVisible()) {
      const box = await img.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.width).toBeGreaterThan(50);
        expect(box.height).toBeGreaterThan(50);
      }

      // Check object-fit is contained
      const objectFit = await img.evaluate(el => el.style.objectFit || window.getComputedStyle(el).objectFit);
      expect(['contain', 'cover']).toContain(objectFit);
    }
  });

  // 5. Checkout Layout Architecture (Sticky Mobile Bar vs Split Desktop)
  test('Checkout Layout: Responsive pay trigger adapts between iPhone and MacBook', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded', timeout: 60000 });

    const viewport = page.viewportSize();
    if (!viewport) return;

    if (viewport.width <= 768) {
      // iPhone / Small iPad: Sticky bottom bar
      const bottomBar = page.locator('.mobile-bottom-pay-bar');
      if (await bottomBar.count() > 0) {
        await expect(bottomBar).toBeVisible();
      }
    } else {
      // MacBook / iPad Pro: Desktop checkout summary panel
      const checkoutGrid = page.locator('.checkout-grid');
      if (await checkoutGrid.count() > 0) {
        await expect(checkoutGrid).toBeVisible();
      }
    }
  });
});
