import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 90 * 1000,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // --- 1. macOS & Safari Desktop Viewports (MacBooks) ---
    {
      name: 'MacBook Air 13-inch (Safari WebKit)',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1440, height: 900 },
        screen: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'MacBook Pro 14-inch (Safari WebKit)',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1512, height: 982 },
        screen: { width: 1512, height: 982 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'MacBook Pro 16-inch (Safari WebKit)',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1728, height: 1117 },
        screen: { width: 1728, height: 1117 },
        deviceScaleFactor: 2,
      },
    },

    // --- 2. iPadOS Safari Viewports (iPads) ---
    {
      name: 'iPad Mini (Safari WebKit)',
      use: { ...devices['iPad Mini'] },
    },
    {
      name: 'iPad Pro 11-inch (Safari WebKit)',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'iPad Pro 12.9-inch (Safari WebKit)',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1024, height: 1366 },
        screen: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    // --- 3. iOS Safari Viewports (iPhones) ---
    {
      name: 'iPhone SE (Safari WebKit)',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'iPhone 14 (Safari WebKit)',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'iPhone 15 / 16 (Safari WebKit)',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'iPhone 16 / 17 Pro Max (Safari WebKit)',
      use: {
        ...devices['iPhone 15 Pro Max'],
        viewport: { width: 440, height: 956 },
        screen: { width: 440, height: 956 },
      },
    },

    // --- 4. Cross-Platform Benchmarks ---
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Viewport (Pixel 7)',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
