import { Given, When, Then, expect, currentUser } from '../fixtures/hybridFixtures';
import { HeaderComponent } from '../components/HeaderComponent';
import { loggedInText, loginViaApi } from '../utils/flows';

/** Header link text as written in the feature files -> header action. */
const HEADER_LINKS: Record<string, (header: HeaderComponent) => Promise<void>> = {
  'Home': (h) => h.goToHome(),
  'Products': (h) => h.goToProducts(),
  'Cart': (h) => h.goToCart(),
  'Signup / Login': (h) => h.goToSignupLogin(),
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

// ---------- UI navigation ----------

Given('I am on the home page', async ({ homePage, page }) => {
  await homePage.open();
  await expect(page).toHaveTitle('Automation Exercise');
});

When('I open the home page in the UI', async ({ homePage }) => {
  await homePage.open();
});

When('I click {string} in the header', async ({ homePage }, link: string) => {
  const action = HEADER_LINKS[link];
  if (!action) throw new Error(`Unknown header link "${link}". Known links: ${Object.keys(HEADER_LINKS).join(', ')}`);
  await action(homePage.header);
});

// ---------- Login: either layer, one session ----------

When('I log in through the UI', async ({ ctx, homePage, loginPage }) => {
  const user = currentUser(ctx);
  await homePage.open();
  await homePage.header.goToSignupLogin();
  await loginPage.login(user.email, user.password);
});

When('I log in via the API', async ({ ctx, apiAuth }) => {
  // The browser tab shares the session cookie and is logged in on its next navigation.
  await loginViaApi(apiAuth, currentUser(ctx));
});

Then('I am logged in as the user', async ({ ctx, homePage }) => {
  await expect(loggedInText(homePage.header, currentUser(ctx).name)).toBeVisible();
});

When('I log out in the UI', async ({ homePage }) => {
  await homePage.header.logout();
});

Then('the API session is logged out', async ({ apiAuth }) => {
  expect(await apiAuth.currentUser()).toBeNull();
});
