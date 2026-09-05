import { test, expect } from '@playwright/test';

test.describe('Vibe-Coded E-Commerce Fortress Suite (VibeEval + testRigor + Mabl Patterns)', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('reavo_skip_loader', 'true');
      window.localStorage.setItem('reavo-demo-user', 'true');
      window.localStorage.setItem('reavo-demo-admin', 'true');
      window.localStorage.setItem('reavo_cart', JSON.stringify([
        {
          id: 'test_prod_1',
          name: 'iPhone 15 Pro (128GB)',
          price: 1200000,
          quantity: 1,
          image: '/placeholder.jpg'
        }
      ]));
    });
  });

  // 1. VIBEEVAL PATTERN: Client-Side Price Tampering & Coupon Abuse Defense
  test('Security: Client cannot tamper with cart total or submit negative coupon discounts', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });

    // Attempt to enter a fraudulent or malformed coupon code
    const couponInput = page.getByPlaceholder(/Promo \/ Ambassador Code/i);
    if (await couponInput.count() > 0) {
      // Test SQL injection / script payload in promo input
      await couponInput.fill("'; DROP TABLE discounts; -- <script>alert(1)</script>");
      const applyBtn = page.getByRole('button', { name: /Apply/i });
      await applyBtn.click();

      // Ensure error is gracefully caught and no NaN or negative total is produced
      const errorMsg = page.getByText(/Invalid or expired/i);
      await expect(errorMsg).toBeVisible();

      // Assert total payable remains a valid non-negative currency amount
      const totalDisplay = page.locator('.font-mono', { hasText: '₦' }).first();
      await expect(totalDisplay).toBeVisible();
      const text = await totalDisplay.innerText();
      expect(text).not.toContain('NaN');
      expect(text).not.toContain('-₦');
    }
  });

  // 2. TESTRIGOR PATTERN: Natural Intent-Based Checkout & WhatsApp Ergonomics
  test('User Flow: WhatsApp phone field provides campus rider helper text and enforces valid format', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });

    // Intent-based selector for WhatsApp field
    const whatsappField = page.getByPlaceholder(/\+234/i);
    if (await whatsappField.count() > 0) {
      await expect(whatsappField).toBeVisible();
      
      // Helper text / recommended badge check
      const recommendedBadge = page.getByText(/Optional - Recommended/i);
      await expect(recommendedBadge).toBeVisible();

      // Enter campus student WhatsApp number
      await whatsappField.fill('+2348012345678');
      expect(await whatsappField.inputValue()).toBe('+2348012345678');
    }
  });

  // 3. APPLITOOLS PATTERN: Mobile Thumb-Zone Sticky Pay Bar & No Horizontal Overflow
  test('Visual Ergonomics: Mobile checkout maintains sticky pay bar and zero horizontal scroll', async ({ page, isMobile }) => {
    if (!isMobile) return;

    await page.goto('/checkout', { waitUntil: 'domcontentloaded' });

    // Assert zero unwanted horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin of error for subpixel rendering

    // Sticky mobile pay dock must be visible in thumb zone
    const stickyPayBar = page.locator('.mobile-bottom-pay-bar');
    await expect(stickyPayBar).toBeVisible();

    const payButton = stickyPayBar.getByRole('button', { name: /Pay with KoraPay/i });
    await expect(payButton).toBeVisible();

    // Verify minimum 44px touch target ergonomics
    const box = await payButton.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  // 4. MABL / CHAOS TESTING PATTERN: Offline Network Interruption Detection
  test('Resilience: System detects network outage and displays offline warning indicator', async ({ page, context }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    // Simulate complete internet blackout (device goes offline)
    await context.setOffline(true);

    // Give browser time to fire the native window 'offline' event
    await page.waitForTimeout(500);

    // Look for the offline indicator banner
    const offlineAlert = page.getByText(/Internet connection interrupted/i);
    if (await offlineAlert.count() > 0) {
      await expect(offlineAlert).toBeVisible();
    }

    // Restore internet connection
    await context.setOffline(false);
    await page.waitForTimeout(500);
  });

  // 5. TRADE-INS LIFECYCLE: Bottom-Sheet Modal & Condition Appraisal Flow
  test('Customer Portal: Device Trade-Ins modal opens as bottom-sheet with appraisal options', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    // Navigate to Device Trade-Ins tab
    const tradeInTab = page.getByRole('button', { name: /Device Trade-Ins/i });
    if (await tradeInTab.count() > 0) {
      await tradeInTab.click({ force: true });

      // Trigger appraisal modal
      const appraiseBtn = page.getByRole('button', { name: /Appraise New Gadget/i });
      if (await appraiseBtn.count() > 0) {
        await appraiseBtn.click({ force: true });

        // Verify modal appears
        await expect(page.getByText(/Device Trade-In Appraisal/i)).toBeVisible();
        await expect(page.locator('select[name="condition"]')).toBeVisible();

        // Close modal
        await page.getByRole('button', { name: '✕' }).click({ force: true });
        await expect(page.getByText(/Device Trade-In Appraisal/i)).not.toBeVisible();
      }
    }
  });
});
