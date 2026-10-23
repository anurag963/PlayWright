import fs from 'fs';
import { When, Then, expect, currentNewUser } from '../fixtures/pomFixtures';
import { createCard } from '../utils/dataFactory';
import { expectAddressMatches } from '../utils/flows';

When('I proceed to checkout', async ({ cartPage }) => {
  await cartPage.proceedToCheckout();
});

When('I choose to register or log in', async ({ cartPage }) => {
  await cartPage.goToRegisterLogin();
});

Then('the address details and order review are shown', async ({ checkoutPage }) => {
  await expect(checkoutPage.addressDetailsHeading).toBeVisible();
  await expect(checkoutPage.reviewOrderHeading).toBeVisible();
});

Then('the order review lists {int} product(s)', async ({ checkoutPage }, count: number) => {
  await expect(checkoutPage.orderRows).toHaveCount(count);
});

Then('the {word} address matches the registration details', async ({ ctx, checkoutPage }, which: string) => {
  if (which !== 'delivery' && which !== 'billing') throw new Error(`Unknown address type "${which}"`);
  await expectAddressMatches(checkoutPage, which, currentNewUser(ctx));
});

When('I place the order with the comment {string}', async ({ checkoutPage }, comment: string) => {
  await checkoutPage.placeOrder(comment);
});

When('I pay with a valid card', async ({ paymentPage }) => {
  await paymentPage.payAndConfirm(createCard());
});

Then('the order is confirmed', async ({ paymentPage }) => {
  await expect(paymentPage.orderPlacedHeading).toHaveText('Order Placed!', { ignoreCase: true });
  await expect(paymentPage.orderConfirmedMessage).toBeVisible();
});

When('I download the invoice', async ({ ctx, paymentPage }) => {
  ctx.download = await paymentPage.downloadInvoice();
});

Then('the invoice file is downloaded', async ({ ctx }) => {
  if (!ctx.download) throw new Error('No download in this scenario. Run "I download the invoice" first.');
  expect(ctx.download.suggestedFilename()).toMatch(/invoice/i);
  expect(fs.statSync(await ctx.download.path()).size).toBeGreaterThan(0);
});
