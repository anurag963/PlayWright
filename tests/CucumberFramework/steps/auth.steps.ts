import { When, Then, expect, currentUser, currentNewUser } from '../fixtures/pomFixtures';
import { registerUserViaUi } from '../utils/flows';

Then('the login form is visible', async ({ loginPage }) => {
  await expect(loginPage.loginHeading).toBeVisible();
});

Then('the signup form is visible', async ({ loginPage }) => {
  await expect(loginPage.signupHeading).toBeVisible();
});

When('I log in with email {string} and password {string}', async ({ loginPage }, email: string, password: string) => {
  await loginPage.login(email, password);
});

Then('I see the login error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.loginMessage(message)).toBeVisible();
});

Then('I am on the login page', async ({ loginPage, page }) => {
  await expect(page).toHaveURL(/\/login$/);
  await expect(loginPage.loginHeading).toBeVisible();
});

When("I start signing up with the user's name and email", async ({ ctx, loginPage }) => {
  const user = currentUser(ctx);
  await loginPage.startSignup(user.name, user.email);
});

Then('I see the signup error {string}', async ({ loginPage }, message: string) => {
  await expect(loginPage.signupMessage(message)).toBeVisible();
});

Then('the account information form is visible', async ({ signupPage }) => {
  await expect(signupPage.accountInfoHeading).toBeVisible();
});

When('I fill in the account information', async ({ ctx, signupPage }) => {
  await signupPage.fillAccountInformation(currentNewUser(ctx));
});

When('I fill in the address information', async ({ ctx, signupPage }) => {
  await signupPage.fillAddressInformation(currentNewUser(ctx));
});

When('I submit the account form', async ({ signupPage }) => {
  await signupPage.createAccountButton.click();
});

/** Whole signup journey in one step, for scenarios where registration is a precondition. */
When('I register the user through the signup form', async ({ ctx, loginPage, signupPage, accountStatusPage }) => {
  await registerUserViaUi(loginPage, signupPage, accountStatusPage, currentNewUser(ctx));
});
