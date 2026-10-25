import { test as base, expect as baseExpect } from '@playwright/test';
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
import { createUser, UserData } from '../utils/dataFactory';
import { env } from '../utils/env';

// Google ads/vignettes on the site cover elements and hijack clicks; block them.
const AD_HOSTS = /googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages|googletagmanager|google-analytics/;

type HybridFixtures = {
  /** Auto fixture: tags every test with Allure epic/feature labels. */
  allureLabels: void;

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
  /** Throwaway user pre-created via API and deleted after the test. */
  apiUser: UserData;
  /** Fresh user data (not registered); deleted after the test as a safety net. */
  newUser: UserData;
};

export const test = base.extend<HybridFixtures>({
  allureLabels: [
    async ({}, use, testInfo) => {
      // titlePath = [file, describe, test]; the describe block maps to an Allure feature.
      await allure.epic('Automation Exercise Hybrid');
      await allure.feature(testInfo.titlePath[1] ?? 'General');
      const tc = testInfo.title.match(/^(HY\d+\w?)/)?.[1];
      if (tc) await allure.tag(tc);
      await use();
    },
    { auto: true },
  ],

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
    // Best-effort cleanup; "Account not found!" is fine if the test already deleted it.
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
