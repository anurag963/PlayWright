import { defineConfig, devices, Project } from '@playwright/test';
import os from 'os';
import path from 'path';
import { env } from './utils/env';

/**
 * Framework project settings. Exported so the root playwright.config.ts can run the
 * framework too (e.g. from the VS Code Playwright sidebar) with identical settings.
 */
export const frameworkProject: Project = {
  name: 'framework',
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

export const allureReporter: [string, object] = [
  'allure-playwright',
  {
    resultsDir: path.resolve(__dirname, '../../allure-results'),
    detail: true,
    suiteTitle: true,
    environmentInfo: {
      BASE_URL: env.baseUrl,
      NODE_VERSION: process.version,
      OS: `${os.platform()} ${os.release()}`,
    },
  },
];

/**
 * Playwright config for the Automation Exercise POM framework.
 * Run with: npx playwright test -c tests/Framework
 */
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/framework', open: 'never' }],
    allureReporter,
  ],
  outputDir: '../../test-results/framework',
  projects: [frameworkProject],
});
