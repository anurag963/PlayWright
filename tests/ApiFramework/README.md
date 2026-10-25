# Automation Exercise – Playwright API Framework

API-level tests for https://www.automationexercise.com covering the scenarios automated in the
UI framework (`tests/Framework`). No browser is launched – tests use Playwright's `request` fixture.

## Setup
```bash
npm install
cp tests/ApiFramework/.env.example tests/ApiFramework/.env   # then fill in credentials
```

## Run
```bash
npm run test:api                  # run the suite
npm run report:api                # open HTML report
npx playwright test -c tests/ApiFramework -g "TC14"   # single test
```

## Allure report
Every run writes raw results to `allure-results-api/` (project root), kept apart from the UI
framework's `allure-results/`. Tests are labelled with epic `Automation Exercise API`, a feature per
spec group (`Products API`, `Cart API`, ...) and a `TCxx` tag, matching the UI framework's labels.

Each HTTP call is an Allure step named `METHOD path` (e.g. `POST /api/createAccount`) with:
- **Request** – query params and form/multipart body as JSON. `password`, `card_number`, `cvc` and
  `csrfmiddlewaretoken` are shown as `***`.
- **Response <status>** – JSON bodies always; HTML pages only when under 20 KB.

The environment tab shows `BASE_URL`, Node version and OS.
```bash
npm run test:api:allure           # clean results, run tests, generate + open report
npm run allure:api                # generate + open from existing results
npm run allure:api:generate       # only build static report into allure-report-api/ (CI)
npm run allure:api:open           # open an already generated report
```
Passing `--reporter=...` on the command line replaces the configured reporters, so no Allure results
are written; use the npm scripts. Runs started from the VS Code Test Explorer use the root config,
whose Allure reporter writes to `allure-results/` together with the UI tests.

## Two kinds of endpoints
| Layer | Base class | Used for |
|---|---|---|
| REST API (`/api/*`, see `/api_list`) | `core/RestClient` | Products, brands, search, account create/verify/update/delete/details |
| Storefront HTTP endpoints | `core/WebClient` | Login session, cart (`/add_to_cart`, `/delete_cart`, `/view_cart`), checkout, payment, invoice, contact form |

The REST API always returns **HTTP 200** and puts the real status in `body.responseCode`; use the
custom matcher `expect(res).toHaveResponseCode(201, 'User created!')`, which checks both.

Storefront forms need a CSRF token: `WebClient.submitForm()` loads the form page, takes the token and
posts with the right `Referer`. Cookies live in the test's request context, so every test has its own
session and cart.

## Structure
| Folder | Purpose |
|---|---|
| `core/` | `BaseClient` (Allure step + masked request/response attachments), `RestClient`, `WebClient` |
| `clients/api/` | `ProductsApi`, `BrandsApi`, `AccountApi` – one method per endpoint in `/api_list` |
| `clients/web/` | `AuthClient`, `CartClient`, `CheckoutClient`, `SiteClient` |
| `models/` | Response types and `toMatchObject` contract schemas |
| `fixtures/apiFixtures.ts` | Injects clients and test users; `toHaveResponseCode` matcher; Allure labels |
| `utils/` | `.env` loader, test-data factory, HTML extractors for server-rendered pages |
| `specs/` | Tests grouped like the UI specs: auth, products, cart, checkout, general |

## Coverage vs. UI scenarios
| UI test | API test |
|---|---|
| TC1, TC2, TC2b, TC3, TC4, TC5 | `auth.api.spec.ts` (+ update account, get user detail, 400/404/405 cases) |
| TC8, TC9, men's shirt search, TC18, TC19 | `products.api.spec.ts` (+ contract checks, 400/405 cases) |
| TC12, TC13, TC17, TC20 | `cart.api.spec.ts` (+ quantity accumulation, session isolation) |
| TC14, TC15, TC16, TC23, TC24 | `checkout.api.spec.ts` (+ address updated via API shows at checkout) |
| TC6, TC7 | `general.api.spec.ts` (+ CSRF rejection) |

Not covered at API level, because they are purely client-side in the app: TC10/TC11 (subscription),
TC21 (review), TC22 (recommended carousel – same `/add_to_cart` endpoint as TC12), TC25/TC26 (scrolling).
The contact form's "Success!" banner is also client-side, so TC6 checks the POST is accepted.

## Test users
- `envUser` – the account in `.env`. Shared, **never deleted**.
- `apiUser` – throwaway user created via API before the test and deleted after.
- `newUser` – fresh data, not registered; deleted after the test as a safety net.
