import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import os from 'os';
import path from 'path';
import { env } from './utils/env';

/**
 * Gherkin (Cucumber) layer via playwright-bdd.
 * `npx bddgen` turns features/*.feature into Playwright tests in .features-gen/,
 * then Playwright runs them with the fixtures and page objects of this framework.
 *
 * Run with: npm run test:cucumber   (bddgen + playwright test -c tests/CucumberFramework)
 */
const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'fixtures/pomFixtures.ts'],
  outputDir: '.features-gen',
});

export default defineConfig({
  testDir,
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/cucumber', open: 'never' }],
    cucumberReporter('html', { outputFile: '../../cucumber-report/index.html' }),
    [
      'allure-playwright',
      {
        resultsDir: path.resolve(__dirname, '../../allure-results-cucumber'),
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
  outputDir: '../../test-results/cucumber',
  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'cucumber',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
