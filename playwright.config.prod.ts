import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration - PRODUCTION MODE
 *
 * This configuration runs E2E tests against production builds for faster execution.
 * Use this for CI/CD or when you need faster test runs.
 *
 * Prerequisites:
 * 1. Build both apps: npm run build
 * 2. MongoDB must be running: make dev-db
 * 3. Run tests: npm run test:e2e:prod
 *
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
    baseURL: 'http://localhost:3333',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    // Chromium tests with authentication
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: [
    // Start CMS in dev mode (CMS has build issues with 404 page)
    {
      command: 'npm run dev:cms',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    // Start web app in production mode (faster)
    {
      command: 'PORT=3333 npm run start --workspace=apps/mindmap-web',
      url: 'http://localhost:3333',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000, // Production starts faster
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
})

