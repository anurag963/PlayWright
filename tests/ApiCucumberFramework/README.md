# Automation Exercise – API Cucumber (Gherkin) Framework

The API framework from `tests/ApiFramework`, with a Gherkin layer on top.
Scenarios are written as `.feature` files; step definitions call the same API and storefront clients.
No browser is launched.

Built with [playwright-bdd](https://vitalets.github.io/playwright-bdd), like `tests/CucumberFramework`:
feature files are converted into Playwright tests, so fixtures, parallel runs, retries, traces, the
VS Code extension and Allure all keep working.

## How it fits together
```
features/*.feature        Gherkin scenarios (what to test, in business language)
        │  npx bddgen
        ▼
.features-gen/*.spec.js   generated Playwright tests (gitignored, never edit)
        │  playwright test
        ▼
steps/*.steps.ts          step definitions: map each sentence to client calls + assertions
        │
fixtures/apiFixtures.ts   clients, test users, per-scenario `ctx`, Given/When/Then, toHaveResponseCode
        │
clients/ core/            REST + storefront clients (same as the API framework)
models/ utils/            response types and schemas, env, test data, HTML extractors
```

## Setup
```bash
npm install
cp tests/ApiCucumberFramework/.env.example tests/ApiCucumberFramework/.env   # fill in credentials
```

## Run
```bash
npm run test:api-cucumber                 # generate + run all scenarios
npm run bddgen:api                        # only generate (after editing features)
npm run test:api-cucumber -- --grep @smoke          # by tag
npm run test:api-cucumber -- --grep "@TC14"         # one case
npm run test:api-cucumber -- -g "Saree"             # one Examples row
npm run test:api-cucumber -- --grep-invert @checkout
```
Anything after `--` goes to `playwright test`.

## Reports
| Report | Where | Command |
|---|---|---|
| Cucumber HTML | `cucumber-report-api/index.html` | written on every run |
| Playwright HTML | `playwright-report/api-cucumber` | `npm run report:api-cucumber` |
| Allure | `allure-results-api-cucumber/` → `allure-report-api-cucumber/` | `npm run allure:api-cucumber` (or `test:api-cucumber:allure` to clean, run, build and open) |

In Allure each Gherkin step contains the HTTP calls it made (`POST /api/createAccount` …) with the
masked request and the response attached.

## Features
| File | Tag | Scenarios |
|---|---|---|
| `products.feature` | `@products` | TC8, TC9 (outline: Jeans, Saree), men's shirt search, TC18 (outline), TC19 |
| `authentication.feature` | `@auth` | TC1, TC2, TC2b, TC3 ×3, TC4, TC5, update account, user details 404/400 |
| `cart.feature` | `@cart` | TC12, TC13 ×2, TC17, TC20, session isolation |
| `checkout.feature` | `@checkout` | TC14, TC15, TC16, TC23 (outline: delivery, billing + updated address), TC24 |
| `general.feature` | `@general` | TC6 + CSRF rejection, TC7 (outline), unsupported methods (outline: 405) |

Other tags: `@smoke` (one key scenario per area), `@TCxx` (site test case), `@account`, `@search`,
`@session`, `@methods`.

## Scenario context (`ctx`)
Steps are separate functions, so they pass data through a fresh `ctx` object per scenario:
`user` / `userData` (who the scenario acts as), `response` (last REST reply, checked by
`Then the response code is ...`), `products`, `brands`, `added` (what went into the cart),
`cartRows`, `login`, `page`, `checkout`, `order`, `invoice`.

A step that needs data an earlier step should have set fails with a message naming the missing step,
e.g. *No API response yet. Add a "When I ..." step that calls the API first.*

## Test users
| Step | Fixture | Lifecycle |
|---|---|---|
| `Given I use the account from the environment file` | `envUser` | `.env` account, shared, **never deleted** |
| `Given a registered user exists` | `apiUser` | created via API before the scenario, deleted after |
| `Given I have details for a new user` | `newUser` | fresh data, not registered; deleted after as a safety net |

## Adding scenarios
1. Write the scenario in the matching `.feature` file, reusing existing sentences where you can.
2. Run `npm run bddgen:api`. For any sentence without a definition it fails and prints a snippet.
3. Paste the snippet into the matching `steps/*.steps.ts` file and implement it with client calls.
   Store results in `ctx`; put HTTP details in the client, not the step.
4. Tag the scenario and run it with `--grep`.

## VS Code Test Explorer
The suite is the `api-cucumber` project in the root `playwright.config.ts`, next to `framework` and `api`.
1. Run `npm run bddgen:api` (the generated tests are gitignored, so do this after cloning too).
2. In the Testing sidebar click **Refresh Tests**, then tick `api-cucumber` under **Projects** in the
   Playwright panel. Scenarios appear under `tests/ApiCucumberFramework/.features-gen/`.
3. After editing a feature, run `npm run bddgen:api` again and refresh. Plain `npx bddgen` from the
   repo root does not generate these tests.

Don't also enable `tests/ApiCucumberFramework/playwright.config.ts` in the config selector, or every
scenario is listed twice. Runs from Test Explorer use the root config's reporters, so the Cucumber
HTML report and `allure-results-api-cucumber/` are only written by the npm scripts.
