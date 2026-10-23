import { Given, When, Then, expect, currentUser } from '../fixtures/pomFixtures';
import { HeaderComponent } from '../components/HeaderComponent';
import { loggedInText } from '../utils/flows';

/** Header link text as written in the feature files -> header action. */
const HEADER_LINKS: Record<string, (header: HeaderComponent) => Promise<void>> = {
  'Home': (h) => h.goToHome(),
  'Products': (h) => h.goToProducts(),
  'Cart': (h) => h.goToCart(),
  'Signup / Login': (h) => h.goToSignupLogin(),
  'Logout': (h) => h.logout(),
  'Delete Account': (h) => h.deleteAccount(),
  'Test Cases': (h) => h.goToTestCases(),
  'Contact Us': (h) => h.goToContactUs(),
};

// ---------- Navigation ----------

Given('I am on the home page', async ({ homePage, page }) => {
  await homePage.open();
  await expect(page).toHaveTitle('Automation Exercise');
  await expect(homePage.logo).toBeVisible();
});

Then('the home page is visible', async ({ homePage, page }) => {
  await expect(page).toHaveURL(/automationexercise\.com\/?$/);
  await expect(homePage.activeSliderHeading).toBeVisible();
});

When('I click {string} in the header', async ({ homePage }, link: string) => {
  const action = HEADER_LINKS[link];
  if (!action) throw new Error(`Unknown header link "${link}". Known links: ${Object.keys(HEADER_LINKS).join(', ')}`);
  await action(homePage.header);
});

When('I scroll to the bottom of the page', async ({ homePage }) => {
  await homePage.scrollToBottom();
});

When('I scroll to the top of the page', async ({ homePage }) => {
  await homePage.scrollToTop();
});

// ---------- Users ----------

Given('I use the account from the environment file', async ({ ctx, envUser }) => {
  ctx.user = envUser;
});

Given('a registered user exists', async ({ ctx, apiUser }) => {
  ctx.user = apiUser;
});

Given('I have details for a new user', async ({ ctx, newUser }) => {
  ctx.user = newUser;
  ctx.newUser = newUser;
});

When("I log in with the user's credentials", async ({ ctx, loginPage }) => {
  const user = currentUser(ctx);
  await loginPage.login(user.email, user.password);
});

Then('I am logged in as the user', async ({ ctx, homePage }) => {
  await expect(loggedInText(homePage.header, currentUser(ctx).name)).toBeVisible();
});

// ---------- Account status screens ----------

Then('the account is created', async ({ accountStatusPage }) => {
  await expect(accountStatusPage.accountCreated).toHaveText('Account Created!', { ignoreCase: true });
});

Then('the account is deleted', async ({ accountStatusPage }) => {
  await expect(accountStatusPage.accountDeleted).toHaveText('Account Deleted!', { ignoreCase: true });
});

When('I continue', async ({ accountStatusPage }) => {
  await accountStatusPage.continue();
});
