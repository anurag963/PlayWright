import { test, expect } from '../fixtures/pomFixtures';
import { deleteAccountViaUi, loggedInText, registerUserViaUi } from '../utils/flows';
import { uniqueEmail } from '../utils/dataFactory';

test.describe('Authentication', () => {
  test.beforeEach(async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveTitle('Automation Exercise');
    await expect(homePage.logo).toBeVisible();
  });

  test('TC1: Register User', async ({ homePage, loginPage, signupPage, accountStatusPage, newUser }) => {
    await homePage.header.goToSignupLogin();
    await registerUserViaUi(loginPage, signupPage, accountStatusPage, newUser);
    await deleteAccountViaUi(homePage.header, accountStatusPage);
  });

  test('TC2: Login User with correct email and password', async ({ homePage, loginPage, envUser }) => {
    await homePage.header.goToSignupLogin();
    await expect(loginPage.loginHeading).toBeVisible();
    await loginPage.login(envUser.email, envUser.password);
    await expect(loggedInText(homePage.header, envUser.name)).toBeVisible();
    // The .env user is shared by other tests, so it is logged out rather than deleted.
    // Account deletion is covered by TC1 and the checkout tests with throwaway users.
    await homePage.header.logout();
  });

  test('TC2b: Login and delete a throwaway user', async ({ homePage, loginPage, accountStatusPage, apiUser }) => {
    await homePage.header.goToSignupLogin();
    await expect(loginPage.loginHeading).toBeVisible();
    await loginPage.login(apiUser.email, apiUser.password);
    await expect(loggedInText(homePage.header, apiUser.name)).toBeVisible();
    await deleteAccountViaUi(homePage.header, accountStatusPage);
  });

  test('TC3: Login User with incorrect email and password', async ({ homePage, loginPage }) => {
    await homePage.header.goToSignupLogin();
    await expect(loginPage.loginHeading).toBeVisible();
    await loginPage.login(uniqueEmail('wrong'), 'WrongPassword!1');
    await expect(loginPage.loginError).toBeVisible();
  });

  test('TC4: Logout User', async ({ homePage, loginPage, envUser, page }) => {
    await homePage.header.goToSignupLogin();
    await expect(loginPage.loginHeading).toBeVisible();
    await loginPage.login(envUser.email, envUser.password);
    await expect(loggedInText(homePage.header, envUser.name)).toBeVisible();
    await homePage.header.logout();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.loginHeading).toBeVisible();
  });

  test('TC5: Register User with existing email', async ({ homePage, loginPage, envUser }) => {
    await homePage.header.goToSignupLogin();
    await expect(loginPage.signupHeading).toBeVisible();
    await loginPage.startSignup(envUser.name, envUser.email);
    await expect(loginPage.signupError).toBeVisible();
  });
});
