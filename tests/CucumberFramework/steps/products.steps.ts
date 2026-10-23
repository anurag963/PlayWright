import { When, Then, expect } from '../fixtures/pomFixtures';
import { uniqueEmail } from '../utils/dataFactory';

// Positions in feature files are 1-based ("the product at position 1"); page objects are 0-based.

Then('the listing title is {string}', async ({ productsPage }, title: string) => {
  await expect(productsPage.listingTitle).toHaveText(title, { ignoreCase: true });
});

Then('products are listed', async ({ productsPage }) => {
  await expect(productsPage.productCards.first()).toBeVisible();
});

When('I view the product at position {int}', async ({ productsPage }, position: number) => {
  await productsPage.viewProductAt(position - 1);
});

Then("I see the product's name, category, price, availability, condition and brand", async ({ productDetailsPage, page }) => {
  await expect(page).toHaveURL(/\/product_details\/\d+$/);
  await expect(productDetailsPage.name).toBeVisible();
  await expect(productDetailsPage.category).toBeVisible();
  await expect(productDetailsPage.price).toHaveText(/Rs\. \d+/);
  await expect(productDetailsPage.availability).toBeVisible();
  await expect(productDetailsPage.condition).toBeVisible();
  await expect(productDetailsPage.brand).toBeVisible();
});

When('I search for {string}', async ({ productsPage }, term: string) => {
  await productsPage.search(term);
});

Then('every listed product name contains {string}', async ({ productsPage }, term: string) => {
  const names = await productsPage.productNames().allInnerTexts();
  expect(names.length, 'search returned no products').toBeGreaterThan(0);
  for (const name of names) {
    expect(name.toLowerCase()).toContain(term.toLowerCase());
  }
});

Then('the category sidebar is visible', async ({ productsPage }) => {
  await expect(productsPage.categorySidebar).toBeVisible();
});

When('I open the {string} category {string}', async ({ productsPage }, category: string, subCategory: string) => {
  if (!['Women', 'Men', 'Kids'].includes(category)) throw new Error(`Unknown category "${category}"`);
  await productsPage.openCategory(category as 'Women' | 'Men' | 'Kids', subCategory);
});

Then('the brands sidebar is visible', async ({ productsPage }) => {
  await expect(productsPage.brandsSidebar).toBeVisible();
});

When('I open the brand {string}', async ({ productsPage }, brand: string) => {
  await productsPage.openBrand(brand);
});

Then('the {string} section is visible', async ({ productDetailsPage, contactUsPage }, section: string) => {
  const sections: Record<string, typeof contactUsPage.getInTouchHeading> = {
    'Write Your Review': productDetailsPage.writeReviewHeading,
    'Get In Touch': contactUsPage.getInTouchHeading,
  };
  const heading = sections[section];
  if (!heading) throw new Error(`Unknown section "${section}". Known: ${Object.keys(sections).join(', ')}`);
  await expect(heading).toBeVisible();
});

When('I submit a review {string} as {string}', async ({ productDetailsPage }, review: string, name: string) => {
  await productDetailsPage.submitReview(name, uniqueEmail('review'), review);
});

Then('I see the review confirmation {string}', async ({ productDetailsPage }, message: string) => {
  await expect(productDetailsPage.reviewSuccess).toHaveText(message);
});
