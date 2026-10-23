import path from 'path';
import { DataTable } from 'playwright-bdd';
import { When, Then, expect } from '../fixtures/pomFixtures';
import { uniqueEmail } from '../utils/dataFactory';

// ---------- Contact Us ----------

When('I fill in the contact form with:', async ({ contactUsPage }, table: DataTable) => {
  const data = table.rowsHash();
  await contactUsPage.fillForm({
    name: data.name,
    email: data.email ?? uniqueEmail('contact'),
    subject: data.subject,
    message: data.message,
  });
});

When('I attach the file {string}', async ({ contactUsPage }, fileName: string) => {
  await contactUsPage.attachFile(path.resolve(__dirname, '../testData', fileName));
});

When('I submit the contact form and confirm', async ({ contactUsPage }) => {
  await contactUsPage.submit();
});

Then('I see the contact message {string}', async ({ contactUsPage }, message: string) => {
  await expect(contactUsPage.successMessage).toHaveText(message);
});

When('I click the Home button on the contact page', async ({ contactUsPage }) => {
  await contactUsPage.homeButton.click();
});

// ---------- Test cases page ----------

Then('I am on the test cases page', async ({ testCasesPage, page }) => {
  await expect(page).toHaveURL(/\/test_cases$/);
  await expect(testCasesPage.heading).toBeVisible();
});

// ---------- Footer / subscription ----------

When('I scroll down to the footer', async ({ homePage }) => {
  await homePage.footer.scrollIntoView();
});

Then('the subscription section is visible', async ({ homePage }) => {
  await expect(homePage.footer.subscriptionHeading).toBeVisible();
});

Then('the subscription section is in view', async ({ homePage }) => {
  await expect(homePage.footer.subscriptionHeading).toBeInViewport();
});

When('I subscribe with a new email address', async ({ homePage }) => {
  await homePage.footer.subscribe(uniqueEmail('sub'));
});

Then('I see the subscription message {string}', async ({ homePage }, message: string) => {
  await expect(homePage.footer.subscribeSuccess).toHaveText(message);
});

// ---------- Scrolling ----------

When('I click the scroll-up arrow', async ({ homePage }) => {
  await homePage.footer.scrollUpArrow.click();
});

Then('the page banner is in view', async ({ homePage }) => {
  await expect(homePage.activeSliderHeading).toBeInViewport();
});
