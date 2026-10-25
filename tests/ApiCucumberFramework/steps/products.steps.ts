import { DataTable } from 'playwright-bdd';
import { Given, When, Then, expect, productAt } from '../fixtures/apiFixtures';
import { brandSchema, productSchema } from '../models/schemas';

// ---------- Products ----------

When('I request the list of all products', async ({ ctx, productsApi }) => {
  ctx.response = await productsApi.getAllProducts();
  ctx.products = ctx.response.body.products ?? [];
});

Given('I have the list of all products', async ({ ctx, productsApi }) => {
  const res = await productsApi.getAllProducts();
  expect(res).toHaveResponseCode(200);
  ctx.products = res.body.products;
});

Then('products are returned', async ({ ctx }) => {
  expect(ctx.products.length).toBeGreaterThan(0);
});

Then('every product matches the product schema', async ({ ctx }) => {
  for (const product of ctx.products) expect(product).toMatchObject(productSchema);
});

Then('every product has a unique id', async ({ ctx }) => {
  expect(new Set(ctx.products.map((p) => p.id)).size).toBe(ctx.products.length);
});

When('I open the details page of the product at position {int}', async ({ ctx, site }, position: number) => {
  ctx.viewedProduct = productAt(ctx, position);
  ctx.page = await site.open(`/product_details/${ctx.viewedProduct.id}`);
});

Then("the page shows the product's name, category, price and brand", async ({ ctx }) => {
  const product = ctx.viewedProduct;
  if (!product) throw new Error('No product page opened. Add "When I open the details page of the product at position 1" first.');
  const text = ctx.page?.text ?? '';
  expect(text).toContain(product.name);
  expect(text).toContain(`Category: ${product.category.usertype.usertype} > ${product.category.category}`);
  expect(text).toContain(product.price);
  expect(text).toContain(`Brand: ${product.brand}`);
});

// ---------- Search ----------

When('I search for {string}', async ({ ctx, productsApi }, term: string) => {
  ctx.response = await productsApi.searchProduct(term);
  ctx.products = ctx.response.body.products ?? [];
});

When('I search without a search term', async ({ ctx, productsApi }) => {
  ctx.response = await productsApi.searchProduct();
});

Then('every product name contains {string}', async ({ ctx }, term: string) => {
  for (const product of ctx.products) {
    expect(product).toMatchObject(productSchema);
    expect(product.name.toLowerCase()).toContain(term.toLowerCase());
  }
});

Then(
  'the only product returned is {string} in the {string} category {string}',
  async ({ ctx }, name: string, usertype: string, category: string) => {
    expect(ctx.products.map((p) => p.name)).toEqual([name]);
    expect(ctx.products[0].category).toEqual({ usertype: { usertype }, category });
  },
);

Then('there are products in the {string} category {string}', async ({ ctx }, usertype: string, category: string) => {
  const matching = ctx.products.filter(
    (p) => p.category.usertype.usertype === usertype && p.category.category === category,
  );
  expect(matching.length).toBeGreaterThan(0);
});

// ---------- Brands ----------

When('I request the list of all brands', async ({ ctx, brandsApi }) => {
  ctx.response = await brandsApi.getAllBrands();
  ctx.brands = ctx.response.body.brands ?? [];
});

Then('every brand matches the brand schema', async ({ ctx }) => {
  expect(ctx.brands.length).toBeGreaterThan(0);
  for (const brand of ctx.brands) expect(brand).toMatchObject(brandSchema);
});

Then('the brands include:', async ({ ctx }, table: DataTable) => {
  const names = new Set(ctx.brands.map((b) => b.brand));
  for (const [brand] of table.raw()) expect(names).toContain(brand);
});

Then("every product's brand is in the brand list", async ({ ctx }) => {
  const names = new Set(ctx.brands.map((b) => b.brand));
  for (const product of ctx.products) expect(names).toContain(product.brand);
});
