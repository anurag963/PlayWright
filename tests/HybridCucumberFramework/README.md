# Automation Exercise – Hybrid Cucumber (Gherkin) Framework

The hybrid UI + API framework from `tests/HybridFramework`, with a Gherkin layer on top.
Scenarios mix both layers in plain language; step definitions call the same page objects and API clients.

Built with [playwright-bdd](https://vitalets.github.io/playwright-bdd), like `tests/CucumberFramework`
and `tests/ApiCucumberFramework`.

## How it fits together
```
features/*.feature          Gherkin scenarios; every step says its layer ("via the API" / "in the UI")
        │  npx bddgen
        ▼
.features-gen/*.spec.js     generated Playwright tests (gitignored, never edit)
        │  playwright test
        ▼
steps/*.steps.ts            step definitions: sentence -> page-object or API-client calls
        │
fixtures/hybridFixtures.ts  page objects + API clients on ONE session, users, ctx, Given/When/Then
        │
pages/ components/          UI layer (page objects)
clients/ core/ models/      API layer (REST + storefront clients)
utils/                      env, test data, flows, loginViaApi, HTML extractors
```

## The key idea: one session for both layers
API clients are built on `page.request`, which shares the browser tab's cookies. A cart filled
"via the API" is the cart the browser shows; "I log in via the API" leaves the browser logged in;
a click "in the UI" is visible to the next API call.

> The site's API cannot create products, so "add a product via the API" means adding it
> **to the cart** over HTTP.

## Setup
```bash
npm install
npx playwright install chromium
cp tests/HybridCucumberFramework/.env.example tests/HybridCucumberFramework/.env   # fill in credentials
```

## Run
```bash
npm run test:hybrid-cucumber                    # generate + run all scenarios
npm run test:hybrid-cucumber:headed             # watch the browser
npm run bddgen:hybrid                           # only generate (after editing features)
npm run test:hybrid-cucumber -- --grep @smoke   # by tag
npm run test:hybrid-cucumber -- --grep @HY18    # one scenario
npm run test:hybrid-cucumber -- -g "H&M"        # one Examples row
```

## Reports
| Report | Where | Command |
|---|---|---|
| Cucumber HTML | `cucumber-report-hybrid/index.html` | written on every run |
| Playwright HTML | `playwright-report/hybrid-cucumber` | `npm run report:hybrid-cucumber` |
| Allure | `allure-results-hybrid-cucumber/` → `allure-report-hybrid-cucumber/` | `npm run allure:hybrid-cucumber` (or `test:hybrid-cucumber:allure`) |

In Allure each Gherkin step holds its UI actions and its HTTP calls (masked request + response).

## Features
| File | Scenarios |
|---|---|
| `cart.feature` | HY1 API → UI cart, HY2 UI add → API, HY3 UI remove → API, HY4 UI quantity → API, HY5 API guest cart kept after UI login |
| `products.feature` | HY6 products page = API list, HY7 UI search = API search (outline: Jeans, Saree, Top), HY8 details pages = API data, HY9 brands sidebar = API brands, HY10 brand pages (outline: Polo, H&M), HY11 category pages (outline) |
| `account.feature` | HY12 API user logs in on UI, HY13 UI registration checked via API, HY14 UI delete → API 404, HY15 API login → browser logged in, HY16 UI logout → API session ended, HY17 API address update → UI checkout |
| `checkout.feature` | HY18 API cart + login → UI order → invoice total from API prices, HY19 API payment → UI cart empty, HY20 UI review = API cart |

Tags: `@cart @products @account @checkout`, `@smoke` (one per feature), `@HYxx` (same IDs as the
spec-based hybrid framework).

## Writing hybrid steps
- **Name the layer in the sentence**: `When I add product 1 to the cart via the API`,
  `When I remove product 1 from the cart in the UI`, `Then the API cart contains exactly the added products`.
  The feature then reads as the hybrid flow it is.
- **Record changes in `ctx.added`**, whichever layer made them. The "cart contains" checks in both
  layers compare against it, so one scenario can add via one layer and check in the other.
- **UI writes are asynchronous**: API checks after UI clicks poll (`expect.poll`) until the server has them.
- Prefer API steps for setup the scenario doesn't verify (user, login, cart).

## Scenario context (`ctx`)
`user` / `userData` (who the scenario acts as), `products` (last API list or search), `brands`,
`added` (cart changes from either layer), `apiOrder`, `download` (UI invoice).

## Test users
| Step | Fixture | Lifecycle |
|---|---|---|
| `Given a registered user exists` | `apiUser` | created via API before the scenario, deleted after |
| `Given I have details for a new user` | `newUser` | fresh data; registered by the scenario; deleted after as a safety net |
| `Given I use the account from the environment file` | `envUser` | `.env` account, shared, **never deleted** |

## VS Code Test Explorer
The suite is the `hybrid-cucumber` project in the root `playwright.config.ts`. Run
`npm run bddgen:hybrid` (also after cloning and after editing a feature), click **Refresh Tests**,
and tick `hybrid-cucumber` under **Projects** in the Playwright panel. Don't also enable this
folder's own config in the config selector, or scenarios are listed twice.
