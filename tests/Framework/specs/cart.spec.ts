import { test, expect } from '../fixtures/pomFixtures';
import { CartPage } from '../pages/CartPage';
import { loggedInText } from '../utils/flows';

test.describe('Cart', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC12: Add Products in Cart', async ({ homePage, productsPage, cartPage }) => {
    await homePage.header.goToProducts();
    const first = await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();
    const second = await productsPage.addProductToCartAt(1);
    await productsPage.viewCartFromModal();

    const rows = await cartPage.getRows();
    expect(rows.map((r) => r.name)).toEqual([first.name, second.name]);
    for (const [row, expected] of [[rows[0], first], [rows[1], second]] as const) {
      expect(row.price).toBe(expected.price);
      expect(row.quantity).toBe('1');
      expect(CartPage.toAmount(row.total)).toBe(CartPage.toAmount(row.price) * Number(row.quantity));
    }
  });

  test('TC13: Verify Product quantity in Cart', async ({ homePage, productDetailsPage, cartPage, page }) => {
    await homePage.viewProduct(1);
    await expect(page).toHaveURL(/\/product_details\/1$/);
    await expect(productDetailsPage.name).toBeVisible();
    await productDetailsPage.setQuantity(4);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCartFromModal();
    await expect(cartPage.rowByProductId(1).locator('.cart_quantity button')).toHaveText('4');
  });

  test('TC17: Remove Products From Cart', async ({ homePage, productsPage, cartPage, page }) => {
    await homePage.header.goToProducts();
    await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();
    await homePage.header.goToCart();
    await expect(page).toHaveURL(/\/view_cart$/);
    await expect(cartPage.breadcrumb).toBeVisible();

    await expect(cartPage.rowByProductId(1)).toBeVisible();
    await cartPage.removeProduct(1);
    await expect(cartPage.rowByProductId(1)).toHaveCount(0);
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });

  test('TC20: Search Products and Verify Cart After Login', async ({ homePage, productsPage, cartPage, loginPage, apiUser }) => {
    await homePage.header.goToProducts();
    await expect(productsPage.listingTitle).toHaveText('All Products', { ignoreCase: true });
    await productsPage.search('Jeans');
    await expect(productsPage.listingTitle).toHaveText('Searched Products', { ignoreCase: true });
    await expect(productsPage.productCards.first()).toBeVisible();

    const added = await productsPage.addAllListedProductsToCart();
    await productsPage.header.goToCart();
    for (const name of added) await expect(cartPage.rowByName(name)).toBeVisible();

    await cartPage.header.goToSignupLogin();
    await loginPage.login(apiUser.email, apiUser.password);
    await expect(loggedInText(loginPage.header, apiUser.name)).toBeVisible();

    await loginPage.header.goToCart();
    for (const name of added) await expect(cartPage.rowByName(name)).toBeVisible();
  });

  test('TC22: Add to cart from Recommended items', async ({ homePage, cartPage, productsPage }) => {
    await homePage.scrollToBottom();
    await expect(homePage.recommendedHeading).toHaveText('Recommended Items', { ignoreCase: true });
    const name = await homePage.addFirstRecommendedToCart();
    await productsPage.viewCartFromModal();
    await expect(cartPage.rowByName(name)).toBeVisible();
  });
});
