import { test, expect } from '../fixtures/apiFixtures';
import { brandSchema, productSchema } from '../models/schemas';

test.describe('Products API', () => {
  test('TC8: Get all products list', async ({ productsApi }) => {
    const res = await productsApi.getAllProducts();

    expect(res).toHaveResponseCode(200);
    const { products } = res.body;
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) expect(product).toMatchObject(productSchema);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  });

  test('TC8: Product from the list has the details shown on its detail page', async ({ productsApi, site }) => {
    const [first] = (await productsApi.getAllProducts()).body.products;

    const page = await site.open(`/product_details/${first.id}`);

    expect(page.status).toBe(200);
    expect(page.text).toContain(first.name);
    expect(page.text).toContain(`Category: ${first.category.usertype.usertype} > ${first.category.category}`);
    expect(page.text).toContain(first.price);
    expect(page.text).toContain(`Brand: ${first.brand}`);
    expect(page.text).toMatch(/Availability: \S+/);
    expect(page.text).toMatch(/Condition: \S+/);
  });

  test('TC8: POST to all products list is not supported', async ({ productsApi }) => {
    expect(await productsApi.postToProductsList()).toHaveResponseCode(405, 'This request method is not supported.');
  });

  test('TC9: Search Product', async ({ productsApi }) => {
    // The site's search also matches category names, so use a term present in both.
    const term = 'Jeans';
    const res = await productsApi.searchProduct(term);

    expect(res).toHaveResponseCode(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    for (const product of res.body.products) {
      expect(product).toMatchObject(productSchema);
      expect(product.name.toLowerCase()).toContain(term.toLowerCase());
    }
  });

  test('TC9: Search Product without search_product parameter', async ({ productsApi }) => {
    expect(await productsApi.searchProduct()).toHaveResponseCode(
      400,
      'Bad request, search_product parameter is missing in POST request.',
    );
  });

  test("Search for a men's shirt", async ({ productsApi }) => {
    const productName = 'Men Tshirt';
    const res = await productsApi.searchProduct(productName);

    expect(res).toHaveResponseCode(200);
    expect(res.body.products.map((p) => p.name)).toEqual([productName]);
    expect(res.body.products[0].category).toEqual({ usertype: { usertype: 'Men' }, category: 'Tshirts' });
  });

  test('TC18: View Category Products', async ({ productsApi }) => {
    const { products } = (await productsApi.getAllProducts()).body;
    const inCategory = (usertype: string, category: string) =>
      products.filter((p) => p.category.usertype.usertype === usertype && p.category.category === category);

    expect(inCategory('Women', 'Tops').length).toBeGreaterThan(0);
    expect(inCategory('Men', 'Jeans').length).toBeGreaterThan(0);
  });

  test('TC19: Get all brands list', async ({ brandsApi, productsApi }) => {
    const res = await brandsApi.getAllBrands();

    expect(res).toHaveResponseCode(200);
    for (const brand of res.body.brands) expect(brand).toMatchObject(brandSchema);

    const brandNames = new Set(res.body.brands.map((b) => b.brand));
    expect(brandNames).toContain('Polo');
    expect(brandNames).toContain('H&M');

    // Every brand used by a product is listed, so each brand page in the sidebar has products.
    const { products } = (await productsApi.getAllProducts()).body;
    for (const product of products) expect(brandNames).toContain(product.brand);
    for (const name of ['Polo', 'H&M']) expect(products.some((p) => p.brand === name)).toBe(true);
  });

  test('TC19: PUT to all brands list is not supported', async ({ brandsApi }) => {
    expect(await brandsApi.putToBrandsList()).toHaveResponseCode(405, 'This request method is not supported.');
  });
});
