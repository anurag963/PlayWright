import { test, expect } from '../fixtures/apiFixtures';
import { CartClient } from '../clients/web/CartClient';
import { CheckoutAddress } from '../models/types';
import { createCard, UserData } from '../utils/dataFactory';

/** Address block on /checkout must match the data the user registered with. */
function expectAddressMatches(address: CheckoutAddress, user: UserData) {
  expect(address).toEqual({
    fullName: `${user.title}. ${user.firstName} ${user.lastName}`,
    lines: [user.company, user.address1, user.address2],
    cityStateZip: `${user.city} ${user.state} ${user.zipcode}`,
    country: user.country,
    phone: user.mobileNumber,
  });
}

test.describe('Checkout API', () => {
  test('TC14: Place Order: Register while Checkout', async ({ cart, accountApi, auth, checkout, newUser }) => {
    await cart.add(1);

    expect(await accountApi.createAccount(newUser)).toHaveResponseCode(201, 'User created!');
    expect((await auth.login(newUser.email, newUser.password)).loggedInAs).toBe(newUser.name);

    // The guest cart is merged into the user's cart when /view_cart is opened, as in the UI flow.
    expect((await cart.view()).rows.map((r) => r.productId)).toEqual([1]);

    const page = await checkout.view();
    expect(page.text).toContain('Address Details');
    expect(page.text).toContain('Review Your Order');
    expect(page.items.map((i) => i.productId)).toEqual([1]);

    const order = await checkout.pay(createCard({ nameOnCard: `${newUser.firstName} ${newUser.lastName}` }));
    expect(order.text).toContain('Order Placed!');
    expect(order.text).toContain('Congratulations! Your order has been confirmed!');

    expect(await accountApi.deleteAccount(newUser.email, newUser.password)).toHaveResponseCode(200, 'Account deleted!');
  });

  test('TC15: Place Order: Register before Checkout', async ({ cart, accountApi, auth, checkout, newUser }) => {
    expect(await accountApi.createAccount(newUser)).toHaveResponseCode(201, 'User created!');
    expect((await auth.login(newUser.email, newUser.password)).loggedInAs).toBe(newUser.name);

    await cart.add(1);
    const page = await checkout.view();
    expect(page.text).toContain('Address Details');
    expect(page.text).toContain('Review Your Order');

    const order = await checkout.pay(createCard());
    expect(order.text).toContain('Order Placed!');

    expect(await accountApi.deleteAccount(newUser.email, newUser.password)).toHaveResponseCode(200, 'Account deleted!');
  });

  test('TC16: Place Order: Login before Checkout', async ({ auth, cart, checkout, apiUser }) => {
    expect((await auth.login(apiUser.email, apiUser.password)).loggedInAs).toBe(apiUser.name);

    await cart.add(1);
    const page = await checkout.view();
    expect(page.loggedInAs).toBe(apiUser.name);
    expect(page.text).toContain('Review Your Order');

    const order = await checkout.pay(createCard());
    expect(order.text).toContain('Order Placed!');
    expect((await cart.view()).isEmpty).toBe(true);
  });

  test('TC23: Verify address details in checkout page', async ({ auth, cart, checkout, apiUser }) => {
    await auth.login(apiUser.email, apiUser.password);
    await cart.add(1);

    const page = await checkout.view();
    expectAddressMatches(page.delivery, apiUser);
    expectAddressMatches(page.billing, apiUser);
  });

  test('TC23: Checkout shows the address updated via API', async ({ accountApi, auth, cart, checkout, apiUser }) => {
    const updated = { ...apiUser, address1: '742 Evergreen Terrace', city: 'Springfield' };
    expect(await accountApi.updateAccount(updated)).toHaveResponseCode(200, 'User updated!');

    await auth.login(apiUser.email, apiUser.password);
    await cart.add(1);

    const page = await checkout.view();
    expectAddressMatches(page.delivery, updated);
    expectAddressMatches(page.billing, updated);
  });

  test('TC24: Download Invoice after purchase order', async ({ productsApi, auth, cart, checkout, apiUser }) => {
    const [first, second] = (await productsApi.getAllProducts()).body.products;
    await auth.login(apiUser.email, apiUser.password);
    await cart.add(first.id, 2);
    await cart.add(second.id);
    const expectedTotal = CartClient.toAmount(first.price) * 2 + CartClient.toAmount(second.price);

    const order = await checkout.pay(createCard());
    expect(order.amount).toBe(String(expectedTotal));

    const invoice = await checkout.downloadInvoice(order.amount!);
    expect(invoice.status).toBe(200);
    expect(invoice.fileName).toMatch(/invoice/i);
    expect(invoice.contentType).toContain('text/plain');
    expect(invoice.text).toBe(
      `Hi ${apiUser.firstName} ${apiUser.lastName}, Your total purchase amount is ${expectedTotal}. Thank you`,
    );
  });
});
