import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Automation Framework - Playwright Configuration
 * See https://playwright.dev/docs/test-configuration
 *
 * Framework Features:
 * - Built-in retries and trace recording
 * - Flaky test tracking
 * - Visual regression comparison
 * - API testing layer
 * - Multi-browser support
 *
 * Customization Instructions:
 * 1. Replace {{DEFAULT_BASE_URL}} with your application's base URL
 * 2. Add custom reporters if needed
 * 3. Configure additional browsers if needed
 * 4. Set up webServer if you need to start a local server
 */
const baseURL = process.env.QA_BASE_URL || '{{DEFAULT_BASE_URL}}';

export default defineConfig({
  // Directory containing test files
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail build on CI if you accidentally left test.only in source code */
  forbidOnly: !!process.env.CI,

  /* Built-in retries for flaky tests - no custom code needed! */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for stability */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter configuration */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['list'],
    // Add custom reporters here
    // ['@company/custom-reporter', { option: 'value' }],
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL for navigation - configure in .env file or replace placeholder */
    baseURL: baseURL,

    /* Collect trace when retrying the test for the first time */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'retain-on-failure',

    /* Default timeout for actions in milliseconds */
    actionTimeout: 15000,

    /* Default navigation timeout in milliseconds */
    navigationTimeout: 30000,

    /* Browser locale */
    locale: 'en-US',

    /* Timezone */
    timezoneId: 'America/New_York',
  },

  /* Global timeout for each test in milliseconds */
  timeout: 60000,

  /* Expect timeout in milliseconds */
  expect: {
    timeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Uncomment to enable additional browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // Uncomment and configure if you need to start a server
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  // },
});
