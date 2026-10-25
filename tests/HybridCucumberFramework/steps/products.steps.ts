import { Given, When, Then, expect, ScenarioContext } from '../fixtures/hybridFixtures';
import { Product } from '../models/types';

const byId = (a: number, b: number) => a - b;

function idsOf(products: { id: number }[]) {
  return products.map((p) => p.id).sort(byId);
}

function apiProducts(ctx: ScenarioContext, filter: (p: Product) => boolean) {
  const matching = ctx.products.filter(filter);
  expect(matching.length, 'The API returned no products for this filter.').toBeGreaterThan(0);
  return matching;
}

// ---------- API ----------

Given('I have the list of all products from the API', async ({ ctx, productsApi }) => {
  const res = await productsApi.getAllProducts();
  expect(res).toHaveResponseCode(200);
  ctx.products = res.body.products;
});

When('I search the API for {string}', async ({ ctx, productsApi }, term: string) => {
  const res = await productsApi.searchProduct(term);
  expect(res).toHaveResponseCode(200);
  ctx.products = res.body.products;
  expect(ctx.products.length, `The API search for "${term}" returned nothing.`).toBeGreaterThan(0);
});

When('I get the list of all brands from the API', async ({ ctx, brandsApi }) => {
  const res = await brandsApi.getAllBrands();
  expect(res).toHaveResponseCode(200);
  ctx.brands = res.body.brands.map((b) => b.brand);
});

// ---------- UI ----------

When('I search for {string} in the UI', async ({ productsPage }, term: string) => {
  await productsPage.search(term);
  await expect(productsPage.listingTitle).toHaveText('Searched Products', { ignoreCase: true });
});

When('I open the brand {string} in the UI', async ({ productsPage }, brand: string) => {
  await productsPage.openBrand(brand);
  await expect(productsPage.listingTitle).toHaveText(`Brand - ${brand} Products`, { ignoreCase: true });
});

When('I open the {string} category {string} in the UI', async ({ productsPage }, usertype: string, category: string) => {
  await productsPage.openCategory(usertype as 'Women' | 'Men' | 'Kids', category);
  await expect(productsPage.listingTitle).toHaveText(`${usertype} - ${category} Products`, { ignoreCase: true });
});

// ---------- Compare ----------

Then('the UI listing shows exactly the API products in the same order', async ({ ctx, productsPage }) => {
  await expect(productsPage.productCards).toHaveCount(ctx.products.length);
  expect(await productsPage.getListedProducts()).toEqual(ctx.products.map(({ id, name, price }) => ({ id, name, price })));
});

Then('the UI listing shows the API products of brand {string}', async ({ ctx, productsPage }, brand: string) => {
  const expected = apiProducts(ctx, (p) => p.brand === brand);
  expect(idsOf(await productsPage.getListedProducts())).toEqual(idsOf(expected));
});

Then(
  'the UI listing shows the API products in the {string} category {string}',
  async ({ ctx, productsPage }, usertype: string, category: string) => {
    const expected = apiProducts(ctx, (p) => p.category.usertype.usertype === usertype && p.category.category === category);
    expect(idsOf(await productsPage.getListedProducts())).toEqual(idsOf(expected));
  },
);

Then('the UI brands sidebar lists exactly the API brands', async ({ ctx, productsPage }) => {
  await expect(productsPage.brandsSidebar).toBeVisible();
  expect(new Set(await productsPage.getSidebarBrands())).toEqual(new Set(ctx.brands));
});

Then(
  'the UI details pages of the first {int} products show their API name, price, category and brand',
  async ({ ctx, productDetailsPage, $test }, count: number) => {
    for (const product of ctx.products.slice(0, count)) {
      await $test.step(`product ${product.id}: ${product.name}`, async () => {
        await productDetailsPage.openProduct(product.id);
        await expect(productDetailsPage.name).toHaveText(product.name);
        await expect(productDetailsPage.price).toHaveText(product.price);
        await expect(productDetailsPage.category).toHaveText(
          `Category: ${product.category.usertype.usertype} > ${product.category.category}`,
        );
        await expect(productDetailsPage.brand).toHaveText(`Brand: ${product.brand}`);
      });
    }
  },
);
