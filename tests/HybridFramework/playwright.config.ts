import { defineConfig, devices, Project } from '@playwright/test';
import os from 'os';
import path from 'path';
import { env } from './utils/env';

/**
 * Hybrid project settings: a browser for the UI layer, and API clients that share its cookies.
 * Exported so the root playwright.config.ts can run the suite too (e.g. from the VS Code
 * Playwright sidebar) with identical settings.
 */
export const hybridProject: Project = {
  name: 'hybrid',
  testDir: path.resolve(__dirname, 'specs'),
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 1,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
};

/**
 * Playwright config for the hybrid UI + API framework.
 * Run with: npx playwright test -c tests/HybridFramework
 */
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/hybrid', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: path.resolve(__dirname, '../../allure-results-hybrid'),
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          BASE_URL: env.baseUrl,
          NODE_VERSION: process.version,
          OS: `${os.platform()} ${os.release()}`,
        },
      },
    ],
  ],
  outputDir: '../../test-results/hybrid',
  projects: [hybridProject],
});
