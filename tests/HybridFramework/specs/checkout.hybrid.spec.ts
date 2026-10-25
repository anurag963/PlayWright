import fs from 'fs';
import { test, expect } from '../fixtures/hybridFixtures';
import { CartPage } from '../pages/CartPage';
import { createCard } from '../utils/dataFactory';
import { loginViaApi } from '../utils/flows';

test.describe('Checkout: API and UI', () => {
  test('HY18: Order placed in the UI from a cart built via API', async ({
    productsApi, apiAuth, apiCart, cartPage, checkoutPage, paymentPage, apiUser,
  }) => {
    // Arrange via API: logged-in session with a known cart, no UI clicks needed.
    const [first, second] = (await productsApi.getAllProducts()).body.products;
    await loginViaApi(apiAuth, apiUser);
    await apiCart.add(first.id, 2);
    await apiCart.add(second.id);
    const expectedTotal = CartPage.toAmount(first.price) * 2 + CartPage.toAmount(second.price);

    // Act in the UI: the part under test.
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(2);
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.reviewOrderHeading).toBeVisible();
    await expect(checkoutPage.orderRows).toHaveCount(2);
    await checkoutPage.placeOrder('Hybrid order: cart from API, checkout in UI.');
    await paymentPage.payAndConfirm(createCard({ nameOnCard: `${apiUser.firstName} ${apiUser.lastName}` }));
    await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });

    // Assert in both: the invoice from the UI has the API-calculated total, and the API cart is empty.
    const download = await paymentPage.downloadInvoice();
    expect(fs.readFileSync(await download.path(), 'utf8')).toBe(
      `Hi ${apiUser.firstName} ${apiUser.lastName}, Your total purchase amount is ${expectedTotal}. Thank you`,
    );
    expect((await apiCart.view()).isEmpty).toBe(true);
  });

  test('HY19: Order paid via API shows the UI cart as empty', async ({ apiAuth, apiCart, apiCheckout, cartPage, apiUser }) => {
    await loginViaApi(apiAuth, apiUser);
    await apiCart.add(1);

    await cartPage.open();
    await expect(cartPage.rowByProductId(1)).toBeVisible();

    const order = await apiCheckout.pay(createCard());
    expect(order.text).toContain('Order Placed!');

    await cartPage.open();
    await expect(cartPage.emptyCartMessage).toBeVisible();
    await expect(cartPage.rows).toHaveCount(0);
  });

  test('HY20: UI checkout review matches the API cart', async ({ productsApi, apiAuth, apiCart, cartPage, checkoutPage, apiUser }) => {
    const products = (await productsApi.searchProduct('Saree')).body.products;
    await loginViaApi(apiAuth, apiUser);
    for (const product of products) await apiCart.add(product.id);

    await cartPage.open();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.reviewOrderHeading).toBeVisible();

    await expect(checkoutPage.orderRows).toHaveCount(products.length);
    for (const product of products) {
      await expect(checkoutPage.orderRows.filter({ hasText: product.name })).toContainText(product.price);
    }
  });
});
