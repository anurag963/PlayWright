import { defineConfig, Project } from '@playwright/test';
import { defineBddConfig, cucumberReporter } from 'playwright-bdd';
import os from 'os';
import path from 'path';
import { env } from './utils/env';

/**
 * Gherkin (Cucumber) layer for the API framework, via playwright-bdd.
 * `npx bddgen` turns features/*.feature into Playwright tests in .features-gen/,
 * then Playwright runs them with the API clients and fixtures of this framework.
 * No browser is launched – steps only use the `request` fixture.
 *
 * Run with: npm run test:api-cucumber   (bddgen + playwright test -c tests/ApiCucumberFramework)
 */
// playwright-bdd resolves relative paths against the config that loads this file,
// so they are absolute to work from both this config and the root one.
const testDir = defineBddConfig({
  features: path.resolve(__dirname, 'features/**/*.feature'),
  steps: [path.resolve(__dirname, 'steps/**/*.ts'), path.resolve(__dirname, 'fixtures/apiFixtures.ts')],
  outputDir: path.resolve(__dirname, '.features-gen'),
});

/**
 * Project settings. Exported so the root playwright.config.ts can list the scenarios
 * in the VS Code Test Explorer with identical settings.
 */
export const apiCucumberProject: Project = {
  name: 'api-cucumber',
  testDir,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  retries: process.env.CI ? 2 : 1,
  use: {
    baseURL: env.baseUrl,
    // The trace records every request/response, so keep it for failures.
    trace: 'retain-on-failure',
  },
};

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 4,
  reporter: [
    ['list'],
    ['html', { outputFolder: '../../playwright-report/api-cucumber', open: 'never' }],
    cucumberReporter('html', { outputFile: '../../cucumber-report-api/index.html' }),
    [
      'allure-playwright',
      {
        resultsDir: path.resolve(__dirname, '../../allure-results-api-cucumber'),
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
  outputDir: '../../test-results/api-cucumber',
  projects: [apiCucumberProject],
});
