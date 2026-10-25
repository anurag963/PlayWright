import { When, Then, expect, productAt, ScenarioContext } from '../fixtures/apiFixtures';
import { CartClient } from '../clients/web/CartClient';
import { env } from '../utils/env';

/** Expected cart: one entry per product id, quantities summed, in first-added order. */
function expectedCart(ctx: ScenarioContext) {
  const byId = new Map<number, number>();
  for (const { id, quantity } of ctx.added) byId.set(id, (byId.get(id) ?? 0) + quantity);
  return [...byId].map(([id, quantity]) => ({ id, quantity }));
}

async function addToCart(ctx: ScenarioContext, cart: CartClient, id: number, quantity: number, product = ctx.products.find((p) => p.id === id)) {
  ctx.cartReply = await cart.add(id, quantity === 1 ? undefined : quantity);
  ctx.added.push({ id, quantity, product });
}

// ---------- Add / remove ----------

When('I add the product at position {int} to the cart', async ({ ctx, cart }, position: number) => {
  const product = productAt(ctx, position);
  await addToCart(ctx, cart, product.id, 1, product);
});

When('I add the product at position {int} to the cart with quantity {int}', async ({ ctx, cart }, position: number, quantity: number) => {
  const product = productAt(ctx, position);
  await addToCart(ctx, cart, product.id, quantity, product);
});

When('I add product {int} to the cart', async ({ ctx, cart }, id: number) => {
  await addToCart(ctx, cart, id, 1);
});

When('I add product {int} to the cart with quantity {int}', async ({ ctx, cart }, id: number, quantity: number) => {
  await addToCart(ctx, cart, id, quantity);
});

When('I add every product found to the cart', async ({ ctx, cart }) => {
  for (const product of ctx.products) await addToCart(ctx, cart, product.id, 1, product);
});

When('I remove product {int} from the cart', async ({ ctx, cart }, id: number) => {
  ctx.cartReply = await cart.remove(id);
  ctx.added = ctx.added.filter((a) => a.id !== id);
});

Then('the cart replies {string}', async ({ ctx }, reply: string) => {
  expect(ctx.cartReply).toBe(reply);
});

// ---------- View ----------

When('I open the cart', async ({ ctx, cart }) => {
  ctx.cartRows = (await cart.view()).rows;
});

Then('the cart contains exactly the added products', async ({ ctx }) => {
  const rows = ctx.cartRows ?? [];
  expect(rows.map((r) => ({ id: r.productId, quantity: r.quantity }))).toEqual(expectedCart(ctx));
});

Then('each cart row has the listed name, price and category', async ({ ctx }) => {
  for (const row of ctx.cartRows ?? []) {
    const product = ctx.added.find((a) => a.id === row.productId)?.product;
    if (!product) throw new Error(`Product ${row.productId} was not added from a product list, so its details are unknown.`);
    expect(row).toMatchObject({
      name: product.name,
      price: product.price,
      category: `${product.category.usertype.usertype} > ${product.category.category}`,
    });
  }
});

Then('each cart row total is price times quantity', async ({ ctx }) => {
  expect(ctx.cartRows?.length).toBeGreaterThan(0);
  for (const row of ctx.cartRows ?? []) {
    expect(CartClient.toAmount(row.total)).toBe(CartClient.toAmount(row.price) * row.quantity);
  }
});

Then('product {int} is in the cart with quantity {int}', async ({ ctx }, id: number, quantity: number) => {
  expect(ctx.cartRows?.find((r) => r.productId === id)?.quantity).toBe(quantity);
});

Then('the cart is empty', async ({ cart }) => {
  const view = await cart.view();
  expect(view.rows).toHaveLength(0);
  expect(view.isEmpty).toBe(true);
});

Then('a new session sees an empty cart', async ({ playwright }) => {
  // A brand-new request context has no session cookie.
  const other = await playwright.request.newContext({ baseURL: env.baseUrl });
  try {
    expect((await new CartClient(other).view()).isEmpty).toBe(true);
  } finally {
    await other.dispose();
  }
});
