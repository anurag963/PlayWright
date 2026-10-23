import { When, Then, expect } from '../fixtures/pomFixtures';
import { CartPage } from '../pages/CartPage';

When('I add the product at position {int} to the cart', async ({ ctx, productsPage }, position: number) => {
  ctx.addedProducts.push(await productsPage.addProductToCartAt(position - 1));
});

/** Precondition step: goes to Products, adds the first product and closes the pop-up. */
When('I add a product to the cart', async ({ ctx, productsPage }) => {
  await productsPage.header.goToProducts();
  ctx.addedProducts.push(await productsPage.addProductToCartAt(0));
  await productsPage.continueShopping();
});

When('I add every listed product to the cart', async ({ ctx, productsPage }) => {
  const names = await productsPage.addAllListedProductsToCart();
  ctx.addedProducts.push(...names.map((name) => ({ name, price: '' })));
});

When('I continue shopping', async ({ productsPage }) => {
  await productsPage.continueShopping();
});

When('I view the cart from the pop-up', async ({ productsPage }) => {
  await productsPage.viewCartFromModal();
});

When('I open product {int} from the home page', async ({ homePage }, productId: number) => {
  await homePage.viewProduct(productId);
});

Then('the product details page is shown', async ({ productDetailsPage, page }) => {
  await expect(page).toHaveURL(/\/product_details\/\d+$/);
  await expect(productDetailsPage.name).toBeVisible();
});

When('I set the quantity to {int}', async ({ productDetailsPage }, qty: number) => {
  await productDetailsPage.setQuantity(qty);
});

When('I add the product to the cart from its details page', async ({ productDetailsPage }) => {
  await productDetailsPage.addToCart();
});

When('I add the first recommended product to the cart', async ({ ctx, homePage }) => {
  const name = await homePage.addFirstRecommendedToCart();
  ctx.addedProducts.push({ name, price: '' });
});

Then('the recommended items are visible', async ({ homePage }) => {
  await expect(homePage.recommendedHeading).toHaveText('Recommended Items', { ignoreCase: true });
});

Then('the cart page is shown', async ({ cartPage, page }) => {
  await expect(page).toHaveURL(/\/view_cart$/);
  await expect(cartPage.breadcrumb).toBeVisible();
});

Then('the cart contains the added products', async ({ ctx, cartPage }) => {
  expect(ctx.addedProducts.length, 'no products were added in this scenario').toBeGreaterThan(0);
  for (const { name } of ctx.addedProducts) {
    await expect(cartPage.rowByName(name)).toBeVisible();
  }
});

Then('the cart contains exactly the added products', async ({ ctx, cartPage }) => {
  await expect(cartPage.rows).toHaveCount(ctx.addedProducts.length);
  const rows = await cartPage.getRows();
  expect(rows.map((r) => r.name)).toEqual(ctx.addedProducts.map((p) => p.name));
});

Then('each cart row has the listed price, quantity 1 and a matching total', async ({ ctx, cartPage }) => {
  const rows = await cartPage.getRows();
  rows.forEach((row, i) => {
    expect(row.price).toBe(ctx.addedProducts[i].price);
    expect(row.quantity).toBe('1');
    expect(CartPage.toAmount(row.total)).toBe(CartPage.toAmount(row.price) * Number(row.quantity));
  });
});

Then('product {int} is in the cart with quantity {int}', async ({ cartPage }, productId: number, qty: number) => {
  await expect(cartPage.rowByProductId(productId).locator('.cart_quantity button')).toHaveText(String(qty));
});

When('I remove the added products from the cart', async ({ ctx, cartPage }) => {
  for (const { name } of ctx.addedProducts) {
    await cartPage.removeProductByName(name);
    await expect(cartPage.rowByName(name)).toHaveCount(0);
  }
});

Then('the cart is empty', async ({ cartPage }) => {
  await expect(cartPage.emptyCartMessage).toBeVisible();
});
