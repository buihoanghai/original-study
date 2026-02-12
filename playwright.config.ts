import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 *
 * Runs E2E tests for the mindmap learning application.
 * Tests are located in:
 * - ./e2e (root level tests)
 * - ./apps/mindmap-web/e2e (web app specific tests)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://127.0.0.1:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'PORT=3333 npm run dev:web',
    url: 'http://127.0.0.1:3333',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for server to start
    stdout: 'pipe',
    stderr: 'pipe',
  },
})

