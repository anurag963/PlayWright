# Automation Exercise – Cucumber (Gherkin) Framework

The POM framework from `tests/Framework`, with a Gherkin layer on top.
Test cases are written as `.feature` files; step definitions call the same page objects.

Built with [playwright-bdd](https://vitalets.github.io/playwright-bdd): feature files are
converted into Playwright tests, so fixtures, parallel runs, retries, traces, the
VS Code extension and Allure all keep working.

## How it fits together
```
features/*.feature        Gherkin scenarios (what to test, in business language)
        │  npx bddgen
        ▼
.features-gen/*.spec.js   generated Playwright tests (gitignored, never edit)
        │  playwright test
        ▼
steps/*.steps.ts          step definitions: map each sentence to page-object calls
        │
fixtures/pomFixtures.ts   page objects, test users, per-scenario `ctx`, Given/When/Then
        │
pages/ components/        page objects (unchanged from the POM framework)
utils/                    env, test data, API helper, reusable flows
```

## Setup
```bash
npm install
npx playwright install chromium
cp tests/CucumberFramework/.env.example tests/CucumberFramework/.env   # fill in credentials
```

## Run
```bash
npm run test:cucumber                 # generate + run all scenarios
npm run test:cucumber:headed          # watch the browser
npm run bddgen && npx playwright test -c tests/CucumberFramework --grep @smoke   # by tag
npm run bddgen && npx playwright test -c tests/CucumberFramework --grep "@TC14"  # one case
npm run bddgen && npx playwright test -c tests/CucumberFramework --grep-invert @checkout
```
Always run `bddgen` after changing a `.feature` file (the npm scripts do this for you).

## Reports
| Report | Command / location |
|---|---|
| Cucumber HTML | `cucumber-report/index.html` (written on every run) |
| Playwright HTML | `npm run report:cucumber` |
| Allure | `npm run allure:cucumber` (results in `allure-results-cucumber/`) |

## Tags
| Tag | Meaning |
|---|---|
| `@auth` `@products` `@cart` `@checkout` `@general` | Feature area (on the Feature, inherited by scenarios) |
| `@smoke` | One key scenario per area |
| `@TC1` … `@TC26` | Test case number from the site's Test Cases page |

## Sharing data between steps
Each scenario gets a fresh `ctx` object (Cucumber's "World"):
- `ctx.user` – the account the scenario acts as, set by one of:
  - `Given I use the account from the environment file` → `.env` user (never deleted)
  - `Given a registered user exists` → created via API, deleted after the scenario
  - `Given I have details for a new user` → registered through the UI by the scenario
- `ctx.addedProducts` – products added to the cart, checked by later cart steps
- `ctx.download` – the downloaded invoice

## Writing a new scenario
1. Write the scenario in a `.feature` file, reusing existing sentences where possible.
   `npx bddgen export -c tests/CucumberFramework` lists every available step.
2. Run `npm run bddgen`. It fails and prints a code snippet for any step that has no definition.
3. Paste the snippet into the matching `steps/*.steps.ts` and implement it with page-object
   calls and `expect`. Keep selectors in page objects, not in steps.

```ts
import { When, Then, expect } from '../fixtures/pomFixtures';

When('I search for {string}', async ({ productsPage }, term: string) => {
  await productsPage.search(term);
});
```
Parameter types: `{string}` (quoted text), `{int}`, `{float}`, `{word}`. Tables arrive as `DataTable`.

## VS Code
In the Testing sidebar → Playwright → config selector, enable
`tests/CucumberFramework/playwright.config.ts`. Run `npm run bddgen` first so the generated
tests exist; re-run it after editing features. Installing the "Cucumber" extension
(CucumberOpen) adds Gherkin highlighting and go-to-step-definition.
