import { test as base, expect as baseExpect } from '@playwright/test';
import * as allure from 'allure-js-commons';
import { ProductsApi } from '../clients/api/ProductsApi';
import { BrandsApi } from '../clients/api/BrandsApi';
import { AccountApi } from '../clients/api/AccountApi';
import { AuthClient } from '../clients/web/AuthClient';
import { CartClient } from '../clients/web/CartClient';
import { CheckoutClient } from '../clients/web/CheckoutClient';
import { SiteClient } from '../clients/web/SiteClient';
import { ApiResult } from '../core/RestClient';
import { createUser, UserData } from '../utils/dataFactory';
import { env } from '../utils/env';

type ApiFixtures = {
  /** Auto fixture: tags every test with Allure epic/feature labels. */
  allureLabels: void;
  productsApi: ProductsApi;
  brandsApi: BrandsApi;
  accountApi: AccountApi;
  auth: AuthClient;
  cart: CartClient;
  checkout: CheckoutClient;
  site: SiteClient;
  /** Persistent user from .env – never delete this one. */
  envUser: typeof env.user;
  /** Throwaway user pre-created via API and deleted after the test. */
  apiUser: UserData;
  /** Fresh user data (not registered); deleted after the test as a safety net. */
  newUser: UserData;
};

export const test = base.extend<ApiFixtures>({
  allureLabels: [
    async ({}, use, testInfo) => {
      // titlePath = [file, describe, test]; the describe block maps to an Allure feature.
      await allure.epic('Automation Exercise API');
      await allure.feature(testInfo.titlePath[1] ?? 'General');
      const tc = testInfo.title.match(/^(TC\d+\w?)/)?.[1];
      if (tc) await allure.tag(tc);
      await allure.link(`${env.baseUrl}/api_list`, 'API list');
      await use();
    },
    { auto: true },
  ],

  // All clients share the test's request context, so web clients share one session (cookies).
  productsApi: async ({ request }, use) => use(new ProductsApi(request)),
  brandsApi: async ({ request }, use) => use(new BrandsApi(request)),
  accountApi: async ({ request }, use) => use(new AccountApi(request)),
  auth: async ({ request }, use) => use(new AuthClient(request)),
  cart: async ({ request }, use) => use(new CartClient(request)),
  checkout: async ({ request }, use) => use(new CheckoutClient(request)),
  site: async ({ request }, use) => use(new SiteClient(request)),

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
