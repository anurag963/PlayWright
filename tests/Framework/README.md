# Automation Exercise – Playwright POM Framework

Tests for https://www.automationexercise.com covering all 26 cases from `/test_cases`.

## Setup
```bash
npm install
npx playwright install chromium
cp tests/Framework/.env.example tests/Framework/.env   # then fill in credentials
```

## Run
```bash
npm run test:framework            # headless
npm run test:framework:headed     # watch it run
npm run report:framework          # open HTML report
npx playwright test -c tests/Framework -g "TC14"   # single test
```

## Allure report
Every run writes raw results to `allure-results/` (project root). Tests are labelled with
epic `Automation Exercise`, a feature per spec group, and a `TCxx` tag; failures attach screenshot, video and trace.
```bash
npm run test:framework:allure     # clean results, run tests, generate + open report
npm run allure:report             # generate + open from existing results
npm run allure:generate           # only build static report into allure-report/
```
Uses Allure 3 CLI (`allure` npm package) – no Java needed.

## Structure
| Folder | Purpose |
|---|---|
| `pages/` | Page objects (one per page), all extend `BasePage` |
| `components/` | Header / footer shared by every page |
| `fixtures/pomFixtures.ts` | Injects page objects, API helper, test users; blocks ads |
| `utils/` | `.env` loader, test-data factory, API helper, reusable flows |
| `specs/` | Tests grouped by feature: auth, products, cart, checkout, general |
| `testData/` | Files used by tests (contact-us upload) |

## Test users
- `envUser` – the account in `.env`. Shared, **never deleted** (TC2, TC4, TC5).
- `apiUser` – throwaway user created via API before the test and deleted after.
- `newUser` – fresh data for UI registration; deleted after the test as a safety net.
