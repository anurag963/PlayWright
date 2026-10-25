import { test, expect } from '../fixtures/pomFixtures';
import { uniqueEmail } from '../utils/dataFactory';

test.describe('Products', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('TC8: Verify All Products and product detail page', async ({ homePage, productsPage, productDetailsPage, page }) => {
    await homePage.header.goToProducts();
    await expect(page).toHaveURL(/\/products$/);
    await expect(productsPage.listingTitle).toHaveText('All Products', { ignoreCase: true });
    await expect(productsPage.productCards.first()).toBeVisible();
    expect(await productsPage.productCards.count()).toBeGreaterThan(0);

    await productsPage.viewProductAt(0);
    await expect(page).toHaveURL(/\/product_details\/\d+$/);
    await expect(productDetailsPage.name).toBeVisible();
    await expect(productDetailsPage.category).toBeVisible();
    await expect(productDetailsPage.price).toHaveText(/Rs\. \d+/);
    await expect(productDetailsPage.availability).toBeVisible();
    await expect(productDetailsPage.condition).toBeVisible();
    await expect(productDetailsPage.brand).toBeVisible();
  });

  test('TC9: Search Product', async ({ homePage, productsPage }) => {
    // The site's search also matches category names, so use a term present in both.
    const term = 'Jeans';
    await homePage.header.goToProducts();
    await expect(productsPage.listingTitle).toHaveText('All Products', { ignoreCase: true });
    await productsPage.search(term);
    await expect(productsPage.listingTitle).toHaveText('Searched Products', { ignoreCase: true });

    const names = await productsPage.productNames().allInnerTexts();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
      expect(name.toLowerCase()).toContain(term.toLowerCase());
    }
  });

  test('Search for a men\'s shirt', async ({ homePage, productsPage, page }) => {
    const productName = 'Men Tshirt';
    await homePage.header.goToProducts();
    await expect(page).toHaveURL(/\/products$/);

    await productsPage.search(productName);

    await expect(page).toHaveURL(/\/products\?search=Men%20Tshirt$/);
    await expect(productsPage.listingTitle).toHaveText('Searched Products', { ignoreCase: true });
    await expect(productsPage.productNames()).toHaveText([productName]);
    expect(await productsPage.productCards.count()).toBe(1);
  });

  test('TC18: View Category Products', async ({ homePage, productsPage, page }) => {
    await expect(homePage.categorySidebar).toBeVisible();

    await productsPage.openCategory('Women', 'Tops');
    await expect(page).toHaveURL(/\/category_products\/\d+$/);
    await expect(productsPage.listingTitle).toHaveText('Women - Tops Products', { ignoreCase: true });

    await productsPage.openCategory('Men', 'Jeans');
    await expect(productsPage.listingTitle).toHaveText('Men - Jeans Products', { ignoreCase: true });
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('TC19: View & Cart Brand Products', async ({ homePage, productsPage, page }) => {
    await homePage.header.goToProducts();
    await expect(productsPage.brandsSidebar).toBeVisible();

    await productsPage.openBrand('Polo');
    await expect(page).toHaveURL(/\/brand_products\/Polo$/);
    await expect(productsPage.listingTitle).toHaveText('Brand - Polo Products', { ignoreCase: true });
    await expect(productsPage.productCards.first()).toBeVisible();

    await productsPage.openBrand('H&M');
    await expect(productsPage.listingTitle).toHaveText('Brand - H&M Products', { ignoreCase: true });
    await expect(productsPage.productCards.first()).toBeVisible();
  });

  test('TC21: Add review on product', async ({ homePage, productsPage, productDetailsPage }) => {
    await homePage.header.goToProducts();
    await expect(productsPage.listingTitle).toHaveText('All Products', { ignoreCase: true });
    await productsPage.viewProductAt(0);
    await expect(productDetailsPage.writeReviewHeading).toBeVisible();
    await productDetailsPage.submitReview('PW Tester', uniqueEmail('review'), 'Great product, automated review!');
    await expect(productDetailsPage.reviewSuccess).toHaveText('Thank you for your review.');
  });
});
