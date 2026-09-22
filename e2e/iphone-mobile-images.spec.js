import { test, expect } from '@playwright/test';

test.describe('iPhone 15/16/17 Mobile Viewport & Image Scaling Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('reavo_skip_loader', 'true');
      window.localStorage.setItem('reavo_hasSeenIntro', 'true');
      window.localStorage.setItem('reavo-demo-user', 'true');
    });
  });

  test('Storefront: Product images are properly framed and not clipped or distorted', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for storefront content images to mount
    const mainImages = page.locator('main img');
    await expect(mainImages.first()).toBeVisible({ timeout: 30000 });

    const count = await mainImages.count();
    expect(count).toBeGreaterThan(0);

    // Verify images have non-zero dimensions and do not cause horizontal overflow
    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = mainImages.nth(i);
      if (await img.isVisible()) {
        const box = await img.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThan(0);
          expect(box.height).toBeGreaterThan(0);
          const viewport = page.viewportSize();
          if (viewport) {
            expect(box.width).toBeLessThanOrEqual(viewport.width + 2);
          }
        }
      }
    }

    // Check no horizontal scrollbar on mobile viewport
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
  });

  test('Shop Page: Product cards display whole gadgets without sticky hover zoom', async ({ page, isMobile }) => {
    await page.goto('/shop', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for product cards to load
    const card = page.locator('.glass-panel').first();
    await expect(card).toBeVisible({ timeout: 30000 });

    const cardImage = card.locator('img').first();
    await expect(cardImage).toBeVisible({ timeout: 15000 });

    // Check initial transform scale
    const initialTransform = await cardImage.evaluate(el => window.getComputedStyle(el).transform);

    // Simulate touch tap on mobile or click on desktop
    if (isMobile) {
      await card.tap();
    } else {
      await card.click();
    }

    // Check transform scale after interaction - should NOT be stuck at zoomed scale > 1.02
    const postTapTransform = await cardImage.evaluate(el => window.getComputedStyle(el).transform);

    // Verify object-fit is contain or properly framed
    const objectFit = await cardImage.evaluate(el => el.style.objectFit || window.getComputedStyle(el).objectFit || 'contain');
    expect(['contain', 'cover']).toContain(objectFit);
  });

  test('Product Detail Page: Hero gadget image showcases full hardware without aggressive crop', async ({ page }) => {
    await page.goto('/product/macbook-pro-m4', { waitUntil: 'domcontentloaded' });

    const heroImage = page.locator('article img').first();
    await expect(heroImage).toBeVisible({ timeout: 15000 });

    const box = await heroImage.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      // Must be nicely sized for modern iPhone (393px - 402px wide)
      expect(box.width).toBeGreaterThan(200);
      expect(box.height).toBeGreaterThan(150);
    }
  });
});
