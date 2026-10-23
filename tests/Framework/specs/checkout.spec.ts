import fs from 'fs';
import { test, expect } from '../fixtures/pomFixtures';
import { createCard } from '../utils/dataFactory';
import { deleteAccountViaUi, expectAddressMatches, loggedInText, registerUserViaUi } from '../utils/flows';

test.describe('Checkout', () => {
  test.beforeEach(async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveTitle('Automation Exercise');
  });

  test('TC14: Place Order: Register while Checkout', async ({
    homePage, productsPage, cartPage, loginPage, signupPage, accountStatusPage, checkoutPage, paymentPage, newUser,
  }) => {
    await homePage.header.goToProducts();
    await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();
    await homePage.header.goToCart();
    await expect(cartPage.breadcrumb).toBeVisible();

    await cartPage.proceedToCheckout();
    await cartPage.goToRegisterLogin();
    await registerUserViaUi(loginPage, signupPage, accountStatusPage, newUser);

    await homePage.header.goToCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.addressDetailsHeading).toBeVisible();
    await expect(checkoutPage.reviewOrderHeading).toBeVisible();
    await expect(checkoutPage.orderRows).toHaveCount(1);

    await checkoutPage.placeOrder('Please deliver between 9am and 5pm.');
    await paymentPage.payAndConfirm(createCard({ nameOnCard: `${newUser.firstName} ${newUser.lastName}` }));
    await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });
    await expect(paymentPage.orderConfirmedMessage).toBeVisible();

    await deleteAccountViaUi(homePage.header, accountStatusPage);
  });

  test('TC15: Place Order: Register before Checkout', async ({
    homePage, productsPage, cartPage, loginPage, signupPage, accountStatusPage, checkoutPage, paymentPage, newUser,
  }) => {
    await homePage.header.goToSignupLogin();
    await registerUserViaUi(loginPage, signupPage, accountStatusPage, newUser);

    await homePage.header.goToProducts();
    await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();
    await homePage.header.goToCart();
    await expect(cartPage.breadcrumb).toBeVisible();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.addressDetailsHeading).toBeVisible();
    await expect(checkoutPage.reviewOrderHeading).toBeVisible();
    await checkoutPage.placeOrder('Order placed by automated test.');
    await paymentPage.payAndConfirm(createCard());
    await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });

    await deleteAccountViaUi(homePage.header, accountStatusPage);
  });

  test('TC16: Place Order: Login before Checkout', async ({
    homePage, productsPage, cartPage, loginPage, accountStatusPage, checkoutPage, paymentPage, apiUser,
  }) => {
    await homePage.header.goToSignupLogin();
    await loginPage.login(apiUser.email, apiUser.password);
    await expect(loggedInText(homePage.header, apiUser.name)).toBeVisible();

    await homePage.header.goToProducts();
    await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();
    await homePage.header.goToCart();
    await expect(cartPage.breadcrumb).toBeVisible();
    await cartPage.proceedToCheckout();

    await expect(checkoutPage.addressDetailsHeading).toBeVisible();
    await expect(checkoutPage.reviewOrderHeading).toBeVisible();
    await checkoutPage.placeOrder('Order placed by automated test.');
    await paymentPage.payAndConfirm(createCard());
    await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });

    await deleteAccountViaUi(homePage.header, accountStatusPage);
  });

  test('TC23: Verify address details in checkout page', async ({
    homePage, productsPage, cartPage, loginPage, signupPage, accountStatusPage, checkoutPage, newUser,
  }) => {
    await homePage.header.goToSignupLogin();
    await registerUserViaUi(loginPage, signupPage, accountStatusPage, newUser);

    await homePage.header.goToProducts();
    await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();
    await homePage.header.goToCart();
    await expect(cartPage.breadcrumb).toBeVisible();
    await cartPage.proceedToCheckout();

    await expectAddressMatches(checkoutPage, 'delivery', newUser);
    await expectAddressMatches(checkoutPage, 'billing', newUser);

    await deleteAccountViaUi(homePage.header, accountStatusPage);
  });

  test('TC24: Download Invoice after purchase order', async ({
    homePage, productsPage, cartPage, loginPage, signupPage, accountStatusPage, checkoutPage, paymentPage, newUser,
  }) => {
    await homePage.header.goToProducts();
    await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();
    await homePage.header.goToCart();
    await expect(cartPage.breadcrumb).toBeVisible();
    await cartPage.proceedToCheckout();
    await cartPage.goToRegisterLogin();
    await registerUserViaUi(loginPage, signupPage, accountStatusPage, newUser);

    await homePage.header.goToCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.addressDetailsHeading).toBeVisible();
    await checkoutPage.placeOrder('Invoice test order.');
    await paymentPage.payAndConfirm(createCard());
    await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });

    const download = await paymentPage.downloadInvoice();
    expect(download.suggestedFilename()).toMatch(/invoice/i);
    const filePath = await download.path();
    expect(fs.statSync(filePath).size).toBeGreaterThan(0);

    await paymentPage.continueButton.click();
    await deleteAccountViaUi(homePage.header, accountStatusPage);
  });
});
