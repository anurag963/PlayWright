import { expect as baseExpect } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import * as allure from 'allure-js-commons';
import { ProductsApi } from '../clients/api/ProductsApi';
import { BrandsApi } from '../clients/api/BrandsApi';
import { AccountApi } from '../clients/api/AccountApi';
import { AuthClient, LoginResult } from '../clients/web/AuthClient';
import { CartClient } from '../clients/web/CartClient';
import { CheckoutClient } from '../clients/web/CheckoutClient';
import { ContactForm, SiteClient } from '../clients/web/SiteClient';
import { ApiResult } from '../core/RestClient';
import { ApiBody, Brand, CartRow, Product } from '../models/types';
import { createUser, UserData } from '../utils/dataFactory';
import { env } from '../utils/env';

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
  /** Last REST API reply, checked by the "response code" steps. */
  response?: ApiResult<ApiBody & Record<string, any>>;
  /** Last product list or search result. */
  products: Product[];
  /** Product whose details page was opened. */
  viewedProduct?: Product;
  brands: Brand[];
  /** Products added to the cart, in order. `product` is known when added from a list. */
  added: { id: number; quantity: number; product?: Product }[];
  /** Text the cart endpoints answered with ("Added To Cart", "Cart removed"). */
  cartReply?: string;
  cartRows?: CartRow[];
  login?: LoginResult;
  /** Last page opened or form submitted on the storefront. */
  page?: { status: number; url?: string; text?: string };
  checkout?: Awaited<ReturnType<CheckoutClient['view']>>;
  order?: Awaited<ReturnType<CheckoutClient['pay']>>;
  invoice?: Awaited<ReturnType<CheckoutClient['downloadInvoice']>>;
  contactForm?: ContactForm;
}

type ApiFixtures = {
  /** Auto fixture: tags every scenario with Allure epic/feature labels. */
  allureLabels: void;
  ctx: ScenarioContext;
  productsApi: ProductsApi;
  brandsApi: BrandsApi;
  accountApi: AccountApi;
  auth: AuthClient;
  cart: CartClient;
  checkout: CheckoutClient;
  site: SiteClient;
  /** Persistent user from .env – never delete this one. */
  envUser: typeof env.user;
  /** Throwaway user pre-created via API and deleted after the scenario. */
  apiUser: UserData;
  /** Fresh user data (not registered); deleted after the scenario as a safety net. */
  newUser: UserData;
};

export const test = base.extend<ApiFixtures>({
  allureLabels: [
    async ({}, use, testInfo) => {
      // titlePath = [file, feature, scenario]; the feature maps to an Allure feature.
      await allure.epic('Automation Exercise API');
      await allure.feature(testInfo.titlePath[1] ?? 'General');
      await allure.link(`${env.baseUrl}/api_list`, 'API list');
      await use();
    },
    { auto: true },
  ],

  ctx: async ({}, use) => use({ products: [], brands: [], added: [] }),

  // All clients share the scenario's request context, so web clients share one session (cookies).
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

export function lastResponse(ctx: ScenarioContext) {
  if (!ctx.response) throw new Error('No API response yet. Add a "When I ..." step that calls the API first.');
  return ctx.response;
}

/** 1-based position in the last product list, as written in the feature files. */
export function productAt(ctx: ScenarioContext, position: number): Product {
  const product = ctx.products[position - 1];
  if (!product) {
    throw new Error(`No product at position ${position} (list has ${ctx.products.length}). Fetch or search products first.`);
  }
  return product;
}
