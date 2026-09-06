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
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Viewport (Pixel 7)',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Viewport (iPhone 14)',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'Mobile Viewport (iPhone 15)',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'Mobile Viewport (iPhone 16)',
      use: { ...devices['iPhone 16'] },
    },
    {
      name: 'Mobile Viewport (iPhone 17)',
      use: { ...devices['iPhone 17'] },
    },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
