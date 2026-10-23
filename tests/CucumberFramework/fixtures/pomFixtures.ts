import { Download, expect } from '@playwright/test';
import { test as base, createBdd } from 'playwright-bdd';
import * as allure from 'allure-js-commons';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { AccountStatusPage } from '../pages/AccountStatusPage';
import { ContactUsPage } from '../pages/ContactUsPage';
import { TestCasesPage } from '../pages/TestCasesPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { PaymentPage } from '../pages/PaymentPage';
import { ApiHelper } from '../utils/apiHelper';
import { createUser, UserData } from '../utils/dataFactory';
import { env } from '../utils/env';

// Google ads/vignettes on the site cover elements and hijack clicks; block them.
const AD_HOSTS = /googlesyndication|doubleclick|googleadservices|adservice\.google|fundingchoicesmessages|googletagmanager|google-analytics/;

/** Anything that can log in: the .env user, an API-created user or a UI-registered one. */
export type Account = { name: string; email: string; password: string };

/**
 * Per-scenario state shared between steps (Cucumber's "World").
 * A fresh object is created for every scenario.
 */
export interface ScenarioContext {
  /** The account the scenario is acting as. */
  user?: Account;
  /** Full registration data when the scenario registers through the UI. */
  newUser?: UserData;
  /** Names of products added to the cart, in order. */
  addedProducts: { name: string; price: string }[];
  /** Invoice downloaded after an order. */
  download?: Download;
}

type PomFixtures = {
  /** Auto fixture: tags every scenario with Allure epic/feature labels. */
  allureLabels: void;
  ctx: ScenarioContext;
  homePage: HomePage;
  loginPage: LoginPage;
  signupPage: SignupPage;
  accountStatusPage: AccountStatusPage;
  contactUsPage: ContactUsPage;
  testCasesPage: TestCasesPage;
  productsPage: ProductsPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  paymentPage: PaymentPage;
  api: ApiHelper;
  /** Persistent user from .env – never delete this one. */
  envUser: typeof env.user;
  /** Throwaway user pre-created via API and deleted after the scenario. */
  apiUser: UserData;
  /** Fresh user data (not registered) for UI signup flows; cleaned up after the scenario. */
  newUser: UserData;
};

export const test = base.extend<PomFixtures>({
  allureLabels: [
    async ({}, use, testInfo) => {
      // titlePath = [file, feature, scenario]; the feature maps to an Allure feature.
      await allure.epic('Automation Exercise');
      await allure.feature(testInfo.titlePath[1] ?? 'General');
      await allure.link(`${env.baseUrl}/test_cases`, 'Test cases');
      await use();
    },
    { auto: true },
  ],

  ctx: async ({}, use) => use({ addedProducts: [] }),

  page: async ({ page }, use) => {
    await page.context().route(AD_HOSTS, (route) => route.abort());
    await use(page);
  },

  homePage: async ({ page }, use) => use(new HomePage(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  signupPage: async ({ page }, use) => use(new SignupPage(page)),
  accountStatusPage: async ({ page }, use) => use(new AccountStatusPage(page)),
  contactUsPage: async ({ page }, use) => use(new ContactUsPage(page)),
  testCasesPage: async ({ page }, use) => use(new TestCasesPage(page)),
  productsPage: async ({ page }, use) => use(new ProductsPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new PaymentPage(page)),

  api: async ({ request }, use) => use(new ApiHelper(request)),

  envUser: async ({}, use) => use(env.user),

  apiUser: async ({ api }, use) => {
    const user = createUser();
    await api.createAccount(user);
    await use(user);
    await api.deleteAccount(user.email, user.password);
  },

  newUser: async ({ api }, use) => {
    const user = createUser();
    await use(user);
    // Safety net in case the scenario failed before deleting the account via UI.
    await api.deleteAccount(user.email, user.password);
  },
});

export { expect };

/** Step definition functions bound to the fixtures above. */
export const { Given, When, Then } = createBdd(test);

/** Returns the scenario's account, failing with a clear message if no "Given ... user" step ran. */
export function currentUser(ctx: ScenarioContext): Account {
  if (!ctx.user) throw new Error('No user in this scenario. Add a "Given ... user" step first.');
  return ctx.user;
}

export function currentNewUser(ctx: ScenarioContext): UserData {
  if (!ctx.newUser) throw new Error('No new user in this scenario. Add "Given I have details for a new user" first.');
  return ctx.newUser;
}
