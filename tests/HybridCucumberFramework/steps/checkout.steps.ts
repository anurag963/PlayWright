import fs from 'fs';
import { When, Then, expect, currentUserData, expectedCart, ScenarioContext } from '../fixtures/hybridFixtures';
import { CartPage } from '../pages/CartPage';
import { createCard } from '../utils/dataFactory';

/** Sum of API price x quantity for everything added. */
function cartTotalFromApiPrices(ctx: ScenarioContext): number {
  return expectedCart(ctx).reduce((sum, { id, quantity }) => {
    const product = ctx.added.find((a) => a.id === id)?.product;
    if (!product) throw new Error(`Price of product ${id} is unknown. Add products from an API product list to check totals.`);
    return sum + CartPage.toAmount(product.price) * quantity;
  }, 0);
}

function cardFor(ctx: ScenarioContext) {
  return ctx.userData ? createCard({ nameOnCard: `${ctx.userData.firstName} ${ctx.userData.lastName}` }) : createCard();
}

// ---------- UI ----------

When('I proceed to checkout in the UI', async ({ cartPage, checkoutPage }) => {
  await cartPage.open();
  await expect(cartPage.rows.first()).toBeVisible();
  await cartPage.proceedToCheckout();
  await expect(checkoutPage.addressDetailsHeading).toBeVisible();
  await expect(checkoutPage.reviewOrderHeading).toBeVisible();
});

Then('the UI order review lists the added products with their API prices', async ({ ctx, checkoutPage }) => {
  const expected = expectedCart(ctx);
  await expect(checkoutPage.orderRows).toHaveCount(expected.length);
  for (const { id } of expected) {
    const product = ctx.added.find((a) => a.id === id)?.product;
    if (!product) throw new Error(`Product ${id} was not added from an API product list, so its API data is unknown.`);
    await expect(checkoutPage.orderRows.filter({ hasText: product.name })).toContainText(product.price);
  }
});

When('I place the order in the UI with the comment {string}', async ({ checkoutPage }, comment: string) => {
  await checkoutPage.placeOrder(comment);
});

When('I pay with a valid card in the UI', async ({ ctx, paymentPage }) => {
  await paymentPage.payAndConfirm(cardFor(ctx));
});

Then('the UI confirms the order', async ({ paymentPage }) => {
  await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });
  await expect(paymentPage.orderConfirmedMessage).toBeVisible();
});

When('I download the invoice in the UI', async ({ ctx, paymentPage }) => {
  ctx.download = await paymentPage.downloadInvoice();
});

Then('the invoice total is the cart total calculated from API prices', async ({ ctx }) => {
  if (!ctx.download) throw new Error('No invoice yet. Add "When I download the invoice in the UI" first.');
  const user = currentUserData(ctx);
  expect(fs.readFileSync(await ctx.download.path(), 'utf8')).toBe(
    `Hi ${user.firstName} ${user.lastName}, Your total purchase amount is ${cartTotalFromApiPrices(ctx)}. Thank you`,
  );
});

// ---------- API ----------

When('I pay for the order via the API', async ({ ctx, apiCheckout }) => {
  ctx.apiOrder = await apiCheckout.pay(cardFor(ctx));
});

Then('the API confirms the order', async ({ ctx }) => {
  expect(ctx.apiOrder?.text).toContain('Order Placed!');
  expect(ctx.apiOrder?.text).toContain('Congratulations! Your order has been confirmed!');
});
