import { defineConfig, devices, Project } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import os from 'os';
import path from 'path';
import { env } from './utils/env';

/**
 * Gherkin (Cucumber) layer for the hybrid UI + API framework, via playwright-bdd.
 * `npx bddgen` turns features/*.feature into Playwright tests in .features-gen/,
 * then Playwright runs them with the page objects and API clients of this framework.
 *
 * Run with: npm run test:hybrid-cucumber   (bddgen + playwright test -c tests/HybridCucumberFramework)
 */
// playwright-bdd resolves relative paths against the config that loads this file,
// so they are absolute to work from both this config and the root one.
const testDir = defineBddConfig({
  features: path.resolve(__dirname, 'features/**/*.feature'),
  steps: [path.resolve(__dirname, 'steps/**/*.ts'), path.resolve(__dirname, 'fixtures/hybridFixtures.ts')],
  outputDir: path.resolve(__dirname, '.features-gen'),
});

/**
 * Project settings. Exported so the root playwright.config.ts can list the scenarios
 * in the VS Code Test Explorer with identical settings.
 */
export const hybridCucumberProject: Project = {
  name: 'hybrid-cucumber',
  testDir,
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

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/hybrid-cucumber', open: 'never' }],
    cucumberReporter('html', { outputFile: '../../cucumber-report-hybrid/index.html' }),
    [
      'allure-playwright',
      {
        resultsDir: path.resolve(__dirname, '../../allure-results-hybrid-cucumber'),
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
  outputDir: '../../test-results/hybrid-cucumber',
  projects: [hybridCucumberProject],
});
