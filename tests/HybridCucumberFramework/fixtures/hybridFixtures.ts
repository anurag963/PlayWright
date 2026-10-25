import { Download, expect as baseExpect } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import * as allure from 'allure-js-commons';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AccountStatusPage } from '../pages/AccountStatusPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage } from '../pages/PaymentPage';
import { ProductsApi } from '../clients/api/ProductsApi';
import { BrandsApi } from '../clients/api/BrandsApi';
import { AccountApi } from '../clients/api/AccountApi';
import { AuthClient } from '../clients/web/AuthClient';
import { CartClient } from '../clients/web/CartClient';
import { CheckoutClient } from '../clients/web/CheckoutClient';
import { ApiResult } from '../core/RestClient';
import { Product } from '../models/types';
import { createUser, UserData } from '../utils/dataFactory';
import { env } from '../utils/env';

// Google ads/vignettes on the site cover elements and hijack clicks; block them.
const AD_HOSTS = /googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages|googletagmanager|google-analytics/;

/** Anything that can log in: the .env user or a throwaway user. */
export type Account = { name: string; email: string; password: string };

/**
 * Per-scenario state shared between steps (Cucumber's "World").
 * A fresh object is created for every scenario.
 */
export interface ScenarioContext {
  /** The account the scenario is acting as. */
  user?: Account;
  /** Full registration data, when the scenario knows it (API-created or new users). */
  userData?: UserData;
  /** Last REST API reply. */
  response?: ApiResult<any>;
  /** Last product list or search result from the API. */
  products: Product[];
  /** API brand names. */
  brands: string[];
  /** Products added to the cart (through either layer), in order. */
  added: { id: number; quantity: number; product?: Product }[];
  /** Order paid via API. */
  apiOrder?: { amount: string | null; text: string };
  /** Invoice downloaded in the UI. */
  download?: Download;
}

type HybridFixtures = {
  /** Auto fixture: tags every scenario with Allure epic/feature labels. */
  allureLabels: void;
  ctx: ScenarioContext;

  // ---------- UI layer: page objects on the test's browser tab ----------
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountStatusPage: AccountStatusPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;

  // ---------- API layer: clients on page.request, so they share the tab's cookies ----------
  productsApi: ProductsApi;
  brandsApi: BrandsApi;
  accountApi: AccountApi;
  /** Storefront login/logout over HTTP; the browser tab is logged in too. */
  apiAuth: AuthClient;
  /** Cart over HTTP; changes show in the browser's cart and vice versa. */
  apiCart: CartClient;
  apiCheckout: CheckoutClient;

  // ---------- Test users ----------
  /** Persistent user from .env – never delete this one. */
  envUser: typeof env.user;
  /** Throwaway user pre-created via API and deleted after the scenario. */
  apiUser: UserData;
  /** Fresh user data (not registered); deleted after the scenario as a safety net. */
  newUser: UserData;
};

export const test = base.extend<HybridFixtures>({
  allureLabels: [
    async ({}, use, testInfo) => {
      // titlePath = [file, feature, scenario]; the feature maps to an Allure feature.
      await allure.epic('Automation Exercise Hybrid');
      await allure.feature(testInfo.titlePath[1] ?? 'General');
      await use();
    },
    { auto: true },
  ],

  ctx: async ({}, use) => use({ products: [], brands: [], added: [] }),

  page: async ({ page }, use) => {
    await page.context().route(AD_HOSTS, (route) => route.abort());
    await use(page);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountStatusPage: async ({ page }, use) => use(new AccountStatusPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),

  // page.request is the browser context's own request context: same cookie jar as the tab.
  productsApi: async ({ page }, use) => use(new ProductsApi(page.request)),
  brandsApi: async ({ page }, use) => use(new BrandsApi(page.request)),
  accountApi: async ({ page }, use) => use(new AccountApi(page.request)),
  apiAuth: async ({ page }, use) => use(new AuthClient(page.request)),
  apiCart: async ({ page }, use) => use(new CartClient(page.request)),
  apiCheckout: async ({ page }, use) => use(new CheckoutClient(page.request)),

  envUser: async ({}, use) => use(env.user),

  apiUser: async ({ accountApi }, use) => {
    const user = createUser();
    const res = await accountApi.createAccount(user);
    if (res.body.responseCode !== 201) throw new Error(`createAccount failed for ${user.email}: ${JSON.stringify(res.body)}`);
    await use(user);
    await accountApi.deleteAccount(user.email, user.password);
  },

  newUser: async ({ accountApi }, use) => {
    const user = createUser();
    await use(user);
    // Best-effort cleanup; "Account not found!" is fine if the scenario already deleted it.
    await accountApi.deleteAccount(user.email, user.password);
  },
});

export const expect = baseExpect.extend({
  /**
   * The API always answers HTTP 200 and carries the real status in body.responseCode.
   * Asserts both, plus the message when given.
   */
  toHaveResponseCode(received: ApiResult, responseCode: number, message?: string) {
    const pass =
      received.httpStatus === 200 &&
      received.body.responseCode === responseCode &&
      (message === undefined || received.body.message === message);
    const expected = `HTTP 200, responseCode ${responseCode}${message === undefined ? '' : `, message "${message}"`}`;
    const actual = `HTTP ${received.httpStatus}, responseCode ${received.body.responseCode}, message "${received.body.message ?? ''}"`;
    return {
      pass,
      name: 'toHaveResponseCode',
      message: () => `${this.utils.matcherHint('toHaveResponseCode', undefined, undefined, { isNot: this.isNot })}\n\n` +
        `Expected: ${this.isNot ? 'not ' : ''}${expected}\nReceived: ${actual}`,
    };
  },
});

/** Step definition functions bound to the fixtures above. */
export const { Given, When, Then } = createBdd(test);

/** Returns the scenario's account, failing with a clear message if no "Given ... user" step ran. */
export function currentUser(ctx: ScenarioContext): Account {
  if (!ctx.user) throw new Error('No user in this scenario. Add a "Given ... user" step first.');
  return ctx.user;
}

/** Full user data; only available for API-created or new users, not the .env account. */
export function currentUserData(ctx: ScenarioContext): UserData {
  if (!ctx.userData) {
    throw new Error('This step needs full user data. Use "Given a registered user exists" or "Given I have details for a new user".');
  }
  return ctx.userData;
}

/** 1-based position in the last API product list, as written in the feature files. */
export function productAt(ctx: ScenarioContext, position: number): Product {
  const product = ctx.products[position - 1];
  if (!product) {
    throw new Error(`No product at position ${position} (list has ${ctx.products.length}). Get products from the API first.`);
  }
  return product;
}

/** Expected cart: one entry per product id, quantities summed, in first-added order. */
export function expectedCart(ctx: ScenarioContext) {
  const byId = new Map<number, number>();
  for (const { id, quantity } of ctx.added) byId.set(id, (byId.get(id) ?? 0) + quantity);
  return [...byId].map(([id, quantity]) => ({ id, quantity }));
}
