# Automation Exercise – Hybrid UI + API Framework

One framework with both layers: the page objects from `tests/Framework` and the API clients from
`tests/ApiFramework`. Tests set up or check state through the API and drive or verify the browser
in the same test.

## The key idea: one session for both layers
Every API client is built on `page.request`, the browser context's own request context. It shares
the browser tab's cookie jar, so:

- a cart filled with `apiCart.add(1)` is the cart the browser shows on `/view_cart`;
- a login made with `loginViaApi(apiAuth, user)` leaves the browser logged in;
- a product added or removed by clicking in the UI is visible to `apiCart.view()`.

The public REST endpoints (`/api/*`) are stateless, so they behave the same on this context.

> The site's API cannot create products (the catalogue is fixed), so "add a product via API"
> means adding it **to the cart** via HTTP, then checking it in the UI.

## Setup
```bash
npm install
npx playwright install chromium
cp tests/HybridFramework/.env.example tests/HybridFramework/.env   # then fill in credentials
```

## Run
```bash
npm run test:hybrid               # headless
npm run test:hybrid:headed        # watch the browser
npm run report:hybrid             # Playwright HTML report
npm run test:hybrid:allure        # clean, run, build and open Allure
npx playwright test -c tests/HybridFramework -g "HY18"   # single test
```
The suite is also the `hybrid` project in the root config, so it shows in the VS Code Test
Explorer (tick `hybrid` under Projects in the Playwright panel).

In Allure (`allure-results-hybrid/`), the HTTP calls appear as steps (`GET /add_to_cart/1` …)
with masked request and response attachments, next to the UI steps, screenshot, video and trace.

## Structure
| Folder | Layer | Purpose |
|---|---|---|
| `pages/`, `components/` | UI | Page objects, from the POM framework. `ProductsPage` adds `getListedProducts()` and `getSidebarBrands()` for comparing with API data |
| `clients/api/` | API | `ProductsApi`, `BrandsApi`, `AccountApi` for `/api/*` |
| `clients/web/` | API | `AuthClient`, `CartClient`, `CheckoutClient`, `SiteClient` for the storefront's HTTP endpoints |
| `core/` | API | `BaseClient` (Allure steps, masking), `RestClient`, `WebClient` (CSRF forms) |
| `models/` | API | Response types and contract schemas |
| `fixtures/hybridFixtures.ts` | both | Page objects + API clients on the same session, test users, `toHaveResponseCode`, ad blocking |
| `utils/` | both | `.env` loader, test data, UI flows, `loginViaApi`, HTML extractors |
| `specs/` | both | Hybrid tests by area: cart, products, account, checkout |

## Fixtures
| UI | API (same session as the tab) | Users |
|---|---|---|
| `homePage`, `loginPage`, `signupPage`, `accountStatusPage`, `productsPage`, `productDetailsPage`, `cartPage`, `checkoutPage`, `paymentPage` | `productsApi`, `brandsApi`, `accountApi`, `apiAuth`, `apiCart`, `apiCheckout` | `envUser` (never deleted), `apiUser` (created/deleted via API), `newUser` (data only, deleted after) |

Test data keeps the birth month as the UI dropdown shows it (`"March"`); `AccountApi` converts it
to the number the API expects.

## Hybrid tests
| ID | Direction | What it proves |
|---|---|---|
| HY1 | API → UI | Products added to the cart via API appear in the UI cart with API names, prices, quantities and totals |
| HY2 | UI → API | A product added by clicking in the UI is in the API cart |
| HY3 | UI → API | A product removed in the UI is gone from the API cart |
| HY4 | UI → API | Quantity set on the details page is the quantity the API cart reports |
| HY5 | API → UI | A guest cart built via API is kept after logging in through the UI |
| HY6 | API = UI | The products page lists exactly the API products (id, name, price, order) |
| HY7 | API = UI | UI search returns the API search results (Jeans, Saree, Top) |
| HY8 | API = UI | Product details pages show the API's name, price, category and brand |
| HY9 | API = UI | Brands sidebar lists exactly the API brands |
| HY10, HY11 | API = UI | Brand and category pages list the API products of that brand / category |
| HY12 | API → UI | A user created via API can log in on the UI |
| HY13 | UI → API | A user registered in the UI exists in the API with every entered detail |
| HY14 | UI → API | An account deleted in the UI is gone from the API |
| HY15 | API → UI | Logging in via API logs the browser in (no login form) |
| HY16 | UI → API | Logging out in the UI ends the API session |
| HY17 | API → UI | An address updated via API shows on the UI checkout page |
| HY18 | API → UI → API | Cart and login set up via API, order placed in the UI; the invoice has the API-calculated total and the API cart is empty |
| HY19 | API → UI | An order paid via API leaves the UI cart empty |
| HY20 | API → UI | The UI checkout review lists the products put in the cart via API |

## When to use which layer
- **Setup** that the test doesn't verify (users, cart contents, login): API. Fast and reliable.
- **The behaviour under test**: whichever layer the user touches, usually the UI.
- **Verification**: the layer that holds the truth. Use the API to check what the UI saved
  (HY13, HY14) and the UI to check what the API changed (HY1, HY17).
