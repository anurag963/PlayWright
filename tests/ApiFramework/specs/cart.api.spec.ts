import { test, expect } from '../fixtures/apiFixtures';
import { CartClient } from '../clients/web/CartClient';

test.describe('Cart API', () => {
  test('TC12: Add Products in Cart', async ({ productsApi, cart }) => {
    const [first, second] = (await productsApi.getAllProducts()).body.products;

    expect(await cart.add(first.id)).toBe('Added To Cart');
    expect(await cart.add(second.id)).toBe('Added To Cart');

    const { rows } = await cart.view();
    expect(rows.map((r) => r.name)).toEqual([first.name, second.name]);
    for (const [row, expected] of [[rows[0], first], [rows[1], second]] as const) {
      expect(row.price).toBe(expected.price);
      expect(row.category).toBe(`${expected.category.usertype.usertype} > ${expected.category.category}`);
      expect(row.quantity).toBe(1);
      expect(CartClient.toAmount(row.total)).toBe(CartClient.toAmount(row.price) * row.quantity);
    }
  });

  test('TC13: Verify Product quantity in Cart', async ({ cart }) => {
    await cart.add(1, 4);

    const { rows } = await cart.view();
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ productId: 1, quantity: 4 });
    expect(CartClient.toAmount(rows[0].total)).toBe(CartClient.toAmount(rows[0].price) * 4);
  });

  test('TC13: Adding the same product again increases its quantity', async ({ cart }) => {
    await cart.add(1, 2);
    await cart.add(1, 3);

    const { rows } = await cart.view();
    expect(rows).toHaveLength(1);
    expect(rows[0].quantity).toBe(5);
  });

  test('TC17: Remove Products From Cart', async ({ cart }) => {
    await cart.add(1);
    expect((await cart.view()).rows.map((r) => r.productId)).toEqual([1]);

    expect(await cart.remove(1)).toBe('Cart removed');

    const after = await cart.view();
    expect(after.rows).toHaveLength(0);
    expect(after.isEmpty).toBe(true);
  });

  test('TC20: Search Products and Verify Cart After Login', async ({ productsApi, cart, auth, apiUser }) => {
    const { products } = (await productsApi.searchProduct('Jeans')).body;
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) await cart.add(product.id);

    const names = products.map((p) => p.name).sort();
    expect((await cart.view()).rows.map((r) => r.name).sort()).toEqual(names);

    expect((await auth.login(apiUser.email, apiUser.password)).loggedInAs).toBe(apiUser.name);

    expect((await cart.view()).rows.map((r) => r.name).sort()).toEqual(names);
  });

  test('Cart is isolated per session', async ({ cart, playwright }) => {
    await cart.add(1);

    // A brand-new request context has no session cookie, so it sees an empty cart.
    const otherContext = await playwright.request.newContext({ baseURL: test.info().project.use.baseURL });
    try {
      expect((await new CartClient(otherContext).view()).isEmpty).toBe(true);
    } finally {
      await otherContext.dispose();
    }
  });
});
