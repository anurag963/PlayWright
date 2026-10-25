import { When, Then, expect, currentUser, currentUserData, ScenarioContext } from '../fixtures/apiFixtures';
import { CartClient } from '../clients/web/CartClient';
import { createCard } from '../utils/dataFactory';

function checkoutPage(ctx: ScenarioContext) {
  if (!ctx.checkout) throw new Error('Checkout page not opened. Add "When I open the checkout page" first.');
  return ctx.checkout;
}

function placedOrder(ctx: ScenarioContext) {
  if (!ctx.order) throw new Error('No order yet. Add "When I pay with a valid card" first.');
  return ctx.order;
}

/** Sum of price x quantity for everything added, using prices from the product list. */
function cartTotal(ctx: ScenarioContext): number {
  return ctx.added.reduce((sum, { id, quantity, product }) => {
    if (!product) throw new Error(`Price of product ${id} is unknown. Add products from a product list to check totals.`);
    return sum + CartClient.toAmount(product.price) * quantity;
  }, 0);
}

// ---------- Checkout page ----------

When('I open the checkout page', async ({ ctx, checkout }) => {
  ctx.checkout = await checkout.view();
});

Then('the checkout shows the address details and order review', async ({ ctx }) => {
  const page = checkoutPage(ctx);
  expect(page.text).toContain('Address Details');
  expect(page.text).toContain('Review Your Order');
});

Then('the order review lists the added products', async ({ ctx }) => {
  expect(checkoutPage(ctx).items.map((i) => i.productId)).toEqual([...new Set(ctx.added.map((a) => a.id))]);
});

Then('the checkout shows the user as logged in', async ({ ctx }) => {
  expect(checkoutPage(ctx).loggedInAs).toBe(currentUser(ctx).name);
});

Then('the {word} address matches the user', async ({ ctx }, block: string) => {
  if (block !== 'delivery' && block !== 'billing') throw new Error(`Address block must be "delivery" or "billing", got "${block}".`);
  const user = currentUserData(ctx);
  expect(checkoutPage(ctx)[block]).toEqual({
    fullName: `${user.title}. ${user.firstName} ${user.lastName}`,
    lines: [user.company, user.address1, user.address2],
    cityStateZip: `${user.city} ${user.state} ${user.zipcode}`,
    country: user.country,
    phone: user.mobileNumber,
  });
});

// ---------- Payment and invoice ----------

When('I pay with a valid card', async ({ ctx, checkout }) => {
  const name = ctx.userData ? `${ctx.userData.firstName} ${ctx.userData.lastName}` : undefined;
  ctx.order = await checkout.pay(createCard(name ? { nameOnCard: name } : {}));
});

Then('the order is placed', async ({ ctx }) => {
  const order = placedOrder(ctx);
  expect(order.text).toContain('Order Placed!');
  expect(order.text).toContain('Congratulations! Your order has been confirmed!');
});

Then('the order amount equals the cart total', async ({ ctx }) => {
  expect(placedOrder(ctx).amount).toBe(String(cartTotal(ctx)));
});

When('I download the invoice', async ({ ctx, checkout }) => {
  const { amount } = placedOrder(ctx);
  if (!amount) throw new Error(`Order amount missing from the payment redirect: ${placedOrder(ctx).url}`);
  ctx.invoice = await checkout.downloadInvoice(amount);
});

Then('the invoice file is downloaded', async ({ ctx }) => {
  expect(ctx.invoice?.status).toBe(200);
  expect(ctx.invoice?.fileName).toMatch(/invoice/i);
  expect(ctx.invoice?.contentType).toContain('text/plain');
});

Then('the invoice names the user and the order amount', async ({ ctx }) => {
  const user = currentUserData(ctx);
  expect(ctx.invoice?.text).toBe(
    `Hi ${user.firstName} ${user.lastName}, Your total purchase amount is ${placedOrder(ctx).amount}. Thank you`,
  );
});
