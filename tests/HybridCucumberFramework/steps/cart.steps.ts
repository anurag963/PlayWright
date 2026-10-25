import { When, Then, expect, expectedCart, productAt, ScenarioContext } from '../fixtures/hybridFixtures';
import { CartClient } from '../clients/web/CartClient';
import { CartPage } from '../pages/CartPage';
import { Product } from '../models/types';

async function addViaApi(ctx: ScenarioContext, apiCart: CartClient, id: number, quantity: number, product?: Product) {
  expect(await apiCart.add(id, quantity === 1 ? undefined : quantity)).toBe('Added To Cart');
  ctx.added.push({ id, quantity, product: product ?? ctx.products.find((p) => p.id === id) });
}

// ---------- Add / remove via the API ----------

When('I add the product at position {int} to the cart via the API', async ({ ctx, apiCart }, position: number) => {
  const product = productAt(ctx, position);
  await addViaApi(ctx, apiCart, product.id, 1, product);
});

When(
  'I add the product at position {int} to the cart via the API with quantity {int}',
  async ({ ctx, apiCart }, position: number, quantity: number) => {
    const product = productAt(ctx, position);
    await addViaApi(ctx, apiCart, product.id, quantity, product);
  },
);

When('I add product {int} to the cart via the API', async ({ ctx, apiCart }, id: number) => {
  await addViaApi(ctx, apiCart, id, 1);
});

When('I add every product found to the cart via the API', async ({ ctx, apiCart }) => {
  expect(ctx.products.length, 'No products to add. Search or list products from the API first.').toBeGreaterThan(0);
  for (const product of ctx.products) await addViaApi(ctx, apiCart, product.id, 1, product);
});

// ---------- Add / remove in the UI ----------

When('I add the product at position {int} to the cart in the UI', async ({ ctx, productsPage }, position: number) => {
  const listed = (await productsPage.getListedProducts())[position - 1];
  await productsPage.addProductToCartAt(position - 1);
  await productsPage.continueShopping();
  ctx.added.push({ id: listed.id, quantity: 1 });
});

When(
  'I add product {int} to the cart from its details page in the UI with quantity {int}',
  async ({ ctx, productDetailsPage }, id: number, quantity: number) => {
    await productDetailsPage.openProduct(id);
    await productDetailsPage.setQuantity(quantity);
    await productDetailsPage.addToCart();
    await productDetailsPage.viewCartFromModal();
    ctx.added.push({ id, quantity });
  },
);

When('I remove product {int} from the cart in the UI', async ({ ctx, cartPage }, id: number) => {
  await cartPage.removeProduct(id);
  await expect(cartPage.rowByProductId(id)).toHaveCount(0);
  ctx.added = ctx.added.filter((a) => a.id !== id);
});

// ---------- Check in the UI ----------

When('I open the cart page in the UI', async ({ cartPage, page }) => {
  await cartPage.open();
  await expect(page).toHaveURL(/\/view_cart$/);
});

Then('the UI cart shows exactly the added products with API names, prices and totals', async ({ ctx, cartPage }) => {
  const expected = expectedCart(ctx).map(({ id, quantity }) => {
    const product = ctx.added.find((a) => a.id === id)?.product;
    if (!product) throw new Error(`Product ${id} was not added from an API product list, so its API data is unknown.`);
    return {
      name: product.name,
      price: product.price,
      quantity: String(quantity),
      total: `Rs. ${CartPage.toAmount(product.price) * quantity}`,
    };
  });
  await expect(cartPage.rows).toHaveCount(expected.length);
  expect(await cartPage.getRows()).toEqual(expected);
});

Then('the UI cart lists the added products', async ({ ctx, cartPage }) => {
  const expected = expectedCart(ctx);
  for (const { id } of expected) await expect(cartPage.rowByProductId(id)).toBeVisible();
  await expect(cartPage.rows).toHaveCount(expected.length);
});

Then('the UI cart is empty', async ({ cartPage }) => {
  await expect(cartPage.emptyCartMessage).toBeVisible();
  await expect(cartPage.rows).toHaveCount(0);
});

// ---------- Check via the API ----------

Then('the API cart contains exactly the added products', async ({ ctx, apiCart }) => {
  // UI "Add to cart" is an AJAX call, so poll until the server has it.
  await expect
    .poll(async () => (await apiCart.view()).rows.map((r) => ({ id: r.productId, quantity: r.quantity })))
    .toEqual(expectedCart(ctx));
});

Then('the API cart is empty', async ({ apiCart }) => {
  expect((await apiCart.view()).isEmpty).toBe(true);
});
