import { test, expect } from '../fixtures/hybridFixtures';
import { deleteAccountViaUi, expectAddressMatches, loggedInText, loginViaApi, registerUserViaUi } from '../utils/flows';

test.describe('Account: API and UI', () => {
  test('HY12: User created via API can log in on the UI', async ({ homePage, loginPage, apiUser }) => {
    await homePage.open();
    await homePage.header.goToSignupLogin();
    await loginPage.login(apiUser.email, apiUser.password);
    await expect(loggedInText(homePage.header, apiUser.name)).toBeVisible();
  });

  test('HY13: User registered in the UI exists in the API with the entered details', async ({
    homePage, loginPage, signupPage, accountStatusPage, accountApi, newUser,
  }) => {
    await homePage.open();
    await homePage.header.goToSignupLogin();
    await registerUserViaUi(loginPage, signupPage, accountStatusPage, newUser);

    expect(await accountApi.verifyLogin(newUser)).toHaveResponseCode(200, 'User exists!');
    const { body } = await accountApi.getUserDetailByEmail(newUser.email);
    expect(body.user).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      title: newUser.title,
      birth_day: newUser.birthDay,
      birth_month: '3', // "March" picked in the UI dropdown
      birth_year: newUser.birthYear,
      first_name: newUser.firstName,
      last_name: newUser.lastName,
      company: newUser.company,
      address1: newUser.address1,
      address2: newUser.address2,
      country: newUser.country,
      state: newUser.state,
      city: newUser.city,
      zipcode: newUser.zipcode,
    });
  });

  test('HY14: Account deleted in the UI is gone from the API', async ({
    homePage, loginPage, accountStatusPage, accountApi, apiUser,
  }) => {
    await homePage.open();
    await homePage.header.goToSignupLogin();
    await loginPage.login(apiUser.email, apiUser.password);
    await expect(loggedInText(homePage.header, apiUser.name)).toBeVisible();

    await deleteAccountViaUi(homePage.header, accountStatusPage);

    expect(await accountApi.verifyLogin(apiUser)).toHaveResponseCode(404, 'User not found!');
    expect(await accountApi.getUserDetailByEmail(apiUser.email)).toHaveResponseCode(404);
  });

  test('HY15: Logging in via API logs the browser in', async ({ apiAuth, homePage, apiUser }) => {
    // No login form: the session cookie from the HTTP login is already in the browser.
    await loginViaApi(apiAuth, apiUser);

    await homePage.open();
    await expect(loggedInText(homePage.header, apiUser.name)).toBeVisible();
  });

  test('HY16: Logging out in the UI ends the API session', async ({ apiAuth, homePage, apiUser }) => {
    await loginViaApi(apiAuth, apiUser);
    await homePage.open();
    await expect(loggedInText(homePage.header, apiUser.name)).toBeVisible();

    await homePage.header.logout();

    expect(await apiAuth.currentUser()).toBeNull();
  });

  test('HY17: Address updated via API shows on the UI checkout page', async ({
    accountApi, apiAuth, apiCart, cartPage, checkoutPage, apiUser,
  }) => {
    const updated = { ...apiUser, company: 'Hybrid Labs', address1: '742 Evergreen Terrace', city: 'Springfield' };
    expect(await accountApi.updateAccount(updated)).toHaveResponseCode(200, 'User updated!');

    await loginViaApi(apiAuth, apiUser);
    await apiCart.add(1);

    await cartPage.open();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.addressDetailsHeading).toBeVisible();
    await expectAddressMatches(checkoutPage, 'delivery', updated);
    await expectAddressMatches(checkoutPage, 'billing', updated);
  });
});
