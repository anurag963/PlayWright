import { test, expect } from '../fixtures/hybridFixtures';
import { CartPage } from '../pages/CartPage';
import { loggedInText } from '../utils/flows';

test.describe('Cart: API and UI', () => {
  test('HY1: Products added via API appear in the UI cart', async ({ productsApi, apiCart, cartPage, page }) => {
    // Arrange via API: pick real products and put them in this browser session's cart.
    const [first, second] = (await productsApi.getAllProducts()).body.products;
    expect(await apiCart.add(first.id, 3)).toBe('Added To Cart');
    expect(await apiCart.add(second.id)).toBe('Added To Cart');

    // Assert in the UI: the cart page shows exactly those products with API prices.
    await cartPage.open();
    await expect(page).toHaveURL(/\/view_cart$/);
    await expect(cartPage.rowByProductId(first.id)).toBeVisible();
    await expect(cartPage.rowByProductId(second.id)).toBeVisible();

    const rows = await cartPage.getRows();
    expect(rows).toEqual([
      { name: first.name, price: first.price, quantity: '3', total: `Rs. ${CartPage.toAmount(first.price) * 3}` },
      { name: second.name, price: second.price, quantity: '1', total: second.price },
    ]);
  });

  test('HY2: Product added in the UI is in the API cart', async ({ homePage, productsPage, apiCart }) => {
    await homePage.open();
    await homePage.header.goToProducts();
    const added = await productsPage.addProductToCartAt(0);
    await productsPage.continueShopping();

    // The UI's AJAX call and the API client share one session, so the API sees the same cart.
    await expect.poll(async () => (await apiCart.view()).rows.map((r) => r.name)).toEqual([added.name]);
    const [row] = (await apiCart.view()).rows;
    expect(row).toMatchObject({ price: added.price, quantity: 1 });
  });

  test('HY3: Product removed in the UI is gone from the API cart', async ({ apiCart, cartPage }) => {
    await apiCart.add(1);
    await apiCart.add(2);

    await cartPage.open();
    await cartPage.removeProduct(1);
    await expect(cartPage.rowByProductId(1)).toHaveCount(0);

    expect((await apiCart.view()).rows.map((r) => r.productId)).toEqual([2]);
  });

  test('HY4: Quantity set on the UI details page matches the API cart', async ({ productDetailsPage, apiCart }) => {
    await productDetailsPage.openProduct(1);
    await productDetailsPage.setQuantity(4);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCartFromModal();

    const [row] = (await apiCart.view()).rows;
    expect(row).toMatchObject({ productId: 1, quantity: 4 });
    expect(CartPage.toAmount(row.total)).toBe(CartPage.toAmount(row.price) * 4);
  });

  test('HY5: Guest cart built via API is kept after logging in on the UI', async ({
    productsApi, apiCart, homePage, loginPage, cartPage, apiUser,
  }) => {
    const jeans = (await productsApi.searchProduct('Jeans')).body.products;
    expect(jeans.length).toBeGreaterThan(0);
    for (const product of jeans) await apiCart.add(product.id);

    await homePage.open();
    await homePage.header.goToSignupLogin();
    await loginPage.login(apiUser.email, apiUser.password);
    await expect(loggedInText(loginPage.header, apiUser.name)).toBeVisible();

    await loginPage.header.goToCart();
    for (const product of jeans) await expect(cartPage.rowByProductId(product.id)).toBeVisible();
    expect((await cartPage.getRows()).map((r) => r.name).sort()).toEqual(jeans.map((p) => p.name).sort());
  });
});
