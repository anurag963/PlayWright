import { test, expect } from '../fixtures/hybridFixtures';

test.describe('Products: API and UI', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('HY6: UI products page lists exactly the API products', async ({ productsApi, homePage, productsPage }) => {
    const { products } = (await productsApi.getAllProducts()).body;

    await homePage.header.goToProducts();
    await expect(productsPage.listingTitle).toHaveText('All Products', { ignoreCase: true });
    await expect(productsPage.productCards).toHaveCount(products.length);

    expect(await productsPage.getListedProducts()).toEqual(products.map(({ id, name, price }) => ({ id, name, price })));
  });

  for (const term of ['Jeans', 'Saree', 'Top']) {
    test(`HY7: UI search for "${term}" returns the API search results`, async ({ productsApi, homePage, productsPage }) => {
      const { products } = (await productsApi.searchProduct(term)).body;
      expect(products.length).toBeGreaterThan(0);

      await homePage.header.goToProducts();
      await productsPage.search(term);
      await expect(productsPage.listingTitle).toHaveText('Searched Products', { ignoreCase: true });
      await expect(productsPage.productCards).toHaveCount(products.length);

      const listed = await productsPage.getListedProducts();
      expect(listed.map((p) => p.id)).toEqual(products.map((p) => p.id));
    });
  }

  test('HY8: Product details pages show the API data', async ({ productsApi, productDetailsPage }) => {
    // A sample across categories and brands keeps the test fast.
    const products = (await productsApi.getAllProducts()).body.products.slice(0, 5);

    for (const product of products) {
      await test.step(`product ${product.id}: ${product.name}`, async () => {
        await productDetailsPage.openProduct(product.id);
        await expect(productDetailsPage.name).toHaveText(product.name);
        await expect(productDetailsPage.price).toHaveText(product.price);
        await expect(productDetailsPage.category).toHaveText(
          `Category: ${product.category.usertype.usertype} > ${product.category.category}`,
        );
        await expect(productDetailsPage.brand).toHaveText(`Brand: ${product.brand}`);
      });
    }
  });

  test('HY9: Brands sidebar matches the API brands list', async ({ brandsApi, homePage, productsPage }) => {
    const apiBrands = new Set((await brandsApi.getAllBrands()).body.brands.map((b) => b.brand));

    await homePage.header.goToProducts();
    await expect(productsPage.brandsSidebar).toBeVisible();

    expect(new Set(await productsPage.getSidebarBrands())).toEqual(apiBrands);
  });

  test('HY10: Brand page lists the API products of that brand', async ({ productsApi, homePage, productsPage }) => {
    const brand = 'Polo';
    const expected = (await productsApi.getAllProducts()).body.products.filter((p) => p.brand === brand);

    await homePage.header.goToProducts();
    await productsPage.openBrand(brand);
    await expect(productsPage.listingTitle).toHaveText(`Brand - ${brand} Products`, { ignoreCase: true });

    expect((await productsPage.getListedProducts()).map((p) => p.id).sort((a, b) => a - b)).toEqual(
      expected.map((p) => p.id).sort((a, b) => a - b),
    );
  });

  test('HY11: Category page lists the API products of that category', async ({ productsApi, productsPage }) => {
    const expected = (await productsApi.getAllProducts()).body.products.filter(
      (p) => p.category.usertype.usertype === 'Women' && p.category.category === 'Tops',
    );

    await productsPage.openCategory('Women', 'Tops');
    await expect(productsPage.listingTitle).toHaveText('Women - Tops Products', { ignoreCase: true });

    expect((await productsPage.getListedProducts()).map((p) => p.id).sort((a, b) => a - b)).toEqual(
      expected.map((p) => p.id).sort((a, b) => a - b),
    );
  });
});
