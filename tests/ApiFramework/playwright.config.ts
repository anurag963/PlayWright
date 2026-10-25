import { defineConfig, Project } from '@playwright/test';
import os from 'os';
import path from 'path';
import { env } from './utils/env';

/**
 * API project settings. Exported so the root playwright.config.ts can run the
 * API suite too (e.g. from the VS Code Playwright sidebar) with identical settings.
 * No browser is launched – tests only use the `request` fixture.
 */
export const apiProject: Project = {
  name: 'api',
  testDir: path.resolve(__dirname, 'specs'),
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL: env.baseUrl,
    // The trace records every request/response, so keep it for failures.
    trace: 'retain-on-failure',
  },
};

/**
 * Playwright config for the Automation Exercise API framework.
 * Run with: npx playwright test -c tests/ApiFramework
 */
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/api', open: 'never' }],
    [
      'allure-playwright',
      {
        resultsDir: path.resolve(__dirname, '../../allure-results-api'),
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
  outputDir: '../../test-results/api',
  projects: [apiProject],
});
