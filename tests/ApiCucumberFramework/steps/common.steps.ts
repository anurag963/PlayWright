import { Given, When, Then, expect, currentUser, lastResponse, ScenarioContext } from '../fixtures/apiFixtures';
import { ProductsApi } from '../clients/api/ProductsApi';
import { BrandsApi } from '../clients/api/BrandsApi';
import { AccountApi } from '../clients/api/AccountApi';
import { ApiResult } from '../core/RestClient';

type Apis = { productsApi: ProductsApi; brandsApi: BrandsApi; accountApi: AccountApi };

/** "METHOD endpoint" as written in the feature files -> client call that sends it. */
const UNSUPPORTED_CALLS: Record<string, (apis: Apis) => Promise<ApiResult>> = {
  'POST /api/productsList': (a) => a.productsApi.postToProductsList(),
  'PUT /api/brandsList': (a) => a.brandsApi.putToBrandsList(),
  'DELETE /api/verifyLogin': (a) => a.accountApi.deleteToVerifyLogin(),
};

// ---------- Users ----------

Given('I use the account from the environment file', async ({ ctx, envUser }) => {
  ctx.user = envUser;
});

Given('a registered user exists', async ({ ctx, apiUser }) => {
  ctx.user = apiUser;
  ctx.userData = apiUser;
});

Given('I have details for a new user', async ({ ctx, newUser }) => {
  ctx.user = newUser;
  ctx.userData = newUser;
});

// ---------- REST responses ----------

Then('the response code is {int}', async ({ ctx }, code: number) => {
  expect(lastResponse(ctx)).toHaveResponseCode(code);
});

Then('the response code is {int} with message {string}', async ({ ctx }, code: number, message: string) => {
  expect(lastResponse(ctx)).toHaveResponseCode(code, message);
});

When('I send an unsupported {word} request to {string}', async ({ ctx, productsApi, brandsApi, accountApi }, method: string, endpoint: string) => {
  const call = UNSUPPORTED_CALLS[`${method} ${endpoint}`];
  if (!call) throw new Error(`No client call for "${method} ${endpoint}". Known: ${Object.keys(UNSUPPORTED_CALLS).join(', ')}`);
  ctx.response = await call({ productsApi, brandsApi, accountApi });
});

// ---------- Storefront session ----------

When("I log in to the site with the user's credentials", async ({ ctx, auth }) => {
  const user = currentUser(ctx);
  ctx.login = await auth.login(user.email, user.password);
});

Then('I am logged in as the user', async ({ ctx, auth }) => {
  expectLoggedIn(ctx);
  expect(await auth.currentUser()).toBe(currentUser(ctx).name);
});

When('I log out', async ({ ctx, auth }) => {
  ctx.page = await auth.logout();
});

Then('no user is logged in', async ({ auth }) => {
  expect(await auth.currentUser()).toBeNull();
});

// ---------- Pages ----------

Then('the page responds with status {int}', async ({ ctx }, status: number) => {
  expect(ctx.page?.status, 'No page response yet. Open a page or submit a form first.').toBe(status);
});

Then('the page shows {string}', async ({ ctx }, text: string) => {
  expect(ctx.page?.text).toContain(text);
});

function expectLoggedIn(ctx: ScenarioContext) {
  if (!ctx.login) throw new Error('No login yet. Add "When I log in to the site with the user\'s credentials" first.');
  expect(ctx.login.loggedInAs, `Login failed: ${ctx.login.text.slice(0, 200)}`).not.toBeNull();
}
