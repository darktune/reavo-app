import { test, expect } from '@playwright/test';

test.describe('Google Auth, Guest Checkout & Catalog Visual Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('reavo_skip_loader', 'true');
      localStorage.setItem('reavo_hasSeenIntro', 'true');
    });
  });

  test('Navbar displays guest flickering beacon and opens AuthModal with Google Sign-In', async ({ page }) => {
    await page.goto('/');

    // 1. Verify guest beacon on profile button
    const guestBeacon = page.locator('.auth-guest-beacon');
    await expect(guestBeacon).toBeVisible({ timeout: 10000 });

    // 2. Click user profile button to open AuthModal
    const userBtn = page.locator('button[aria-label="User Profile"]');
    await expect(userBtn).toBeVisible({ timeout: 10000 });
    await userBtn.click();

    // 3. Verify AuthModal is open
    const modal = page.locator('.google-signin-btn');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Continue with Google');

    // 4. Verify OR divider and Email inputs
    await expect(page.locator('text=OR WITH EMAIL')).toBeVisible();
    await expect(page.locator('input[placeholder="Email Address"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Password"]')).toBeVisible();

    // 5. Verify Forgot Password link
    const forgotBtn = page.locator('button:has-text("Forgot password?")').first();
    await expect(forgotBtn).toBeVisible();
    await forgotBtn.click();

    // Verify recovery view
    await expect(page.locator('text=Reset Password')).toBeVisible();
    await expect(page.locator('button:has-text("Send Recovery Email")')).toBeVisible();
    await expect(page.locator('button:has-text("Back to Sign In")')).toBeVisible();
  });

  test('Admin OS displays Continue with Google button and Forgot Password', async ({ page }) => {
    await page.goto('/admin');

    // 1. Verify Admin OS login header
    await expect(page.getByRole('heading', { name: 'REAVO Admin OS' })).toBeVisible({ timeout: 15000 });

    // 2. Verify Google Admin sign-in button
    const googleBtn = page.locator('.admin-google-btn');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Continue with Google');

    // 3. Verify 1-Click Instant Demo Access button
    await expect(page.locator('text=1-Click Instant Demo Access')).toBeVisible();

    // 4. Verify Admin Forgot Password toggle
    const forgotLink = page.locator('button:has-text("Forgot password?")');
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();

    // Verify recovery view
    await expect(page.locator('text=Password Recovery')).toBeVisible();
    await expect(page.locator('input[placeholder="Staff Email Address"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send Recovery Link")')).toBeVisible();
  });

  test('Cart allows Guest Checkout skip without mandatory login', async ({ page }) => {
    await page.goto('/shop');

    // Add first available product to cart (automatically opens CartDrawer)
    const addToCartBtn = page.locator('button:has-text("Add to Cart"), button:has-text("Add to Bag")').first();
    await expect(addToCartBtn).toBeVisible({ timeout: 10000 });
    await addToCartBtn.click();

    // Verify checkout button in cart drawer
    const checkoutBtn = page.locator('button:has-text("Checkout")');
    await expect(checkoutBtn).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(600);
    await checkoutBtn.click();

    // Verify AuthModal opened with guest skip option
    const guestSkipBtn = page.locator('.guest-skip-btn');
    await expect(guestSkipBtn).toBeVisible({ timeout: 10000 });
    await expect(guestSkipBtn).toContainText('Continue as Guest');

    // Click guest skip to proceed directly to checkout
    await guestSkipBtn.click({ force: true });

    // Verify navigated to /checkout and guest checkout notice is visible
    await expect(page).toHaveURL(/.*checkout/);
    await expect(page.locator('text=Guest Checkout')).toBeVisible();
  });

  test('Catalog images load properly without broken fallback icons', async ({ page }) => {
    await page.goto('/shop');

    // Wait for first product card image
    const firstImg = page.locator('.glass-panel img').first();
    await expect(firstImg).toBeVisible({ timeout: 15000 });

    const productImages = page.locator('.glass-panel img');
    const count = await productImages.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 4); i++) {
      const img = productImages.nth(i);
      await img.scrollIntoViewIfNeeded();
      const info = await img.evaluate(el => ({ src: el.src, complete: el.complete, naturalWidth: el.naturalWidth }));
      console.log(`Product Image ${i} [${await img.getAttribute('alt')}]:`, info);
      await expect.poll(async () => {
        return await img.evaluate(el => el.complete && el.naturalWidth > 0);
      }, { timeout: 15000 }).toBe(true);
    }
  });

});
