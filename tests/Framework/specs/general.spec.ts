import path from 'path';
import { test, expect } from '../fixtures/pomFixtures';
import { uniqueEmail } from '../utils/dataFactory';

test.describe('Contact, navigation and footer', () => {
  test.beforeEach(async ({ homePage, page }) => {
    await homePage.open();
    await expect(page).toHaveTitle('Automation Exercise');
  });

  test('TC6: Contact Us Form', async ({ homePage, contactUsPage, page }) => {
    await homePage.header.goToContactUs();
    await expect(contactUsPage.getInTouchHeading).toBeVisible();
    await contactUsPage.fillForm({
      name: 'PW Tester',
      email: uniqueEmail('contact'),
      subject: 'Automation feedback',
      message: 'This message was sent by the Playwright POM framework.',
      filePath: path.resolve(__dirname, '../testData/upload.txt'),
    });
    await contactUsPage.submit();
    await expect(contactUsPage.successMessage).toHaveText('Success! Your details have been submitted successfully.');
    await contactUsPage.homeButton.click();
    await expect(page).toHaveURL(/automationexercise\.com\/?$/);
    await expect(homePage.activeSliderHeading).toBeVisible();
  });

  test('TC7: Verify Test Cases Page', async ({ homePage, testCasesPage, page }) => {
    await homePage.header.goToTestCases();
    await expect(page).toHaveURL(/\/test_cases$/);
    await expect(testCasesPage.heading).toBeVisible();
  });

  test('TC10: Verify Subscription in home page', async ({ homePage }) => {
    await homePage.footer.scrollIntoView();
    await expect(homePage.footer.subscriptionHeading).toBeVisible();
    await homePage.footer.subscribe(uniqueEmail('sub'));
    await expect(homePage.footer.subscribeSuccess).toHaveText('You have been successfully subscribed!');
  });

  test('TC11: Verify Subscription in Cart page', async ({ homePage, cartPage }) => {
    await homePage.header.goToCart();
    await cartPage.footer.scrollIntoView();
    await expect(cartPage.footer.subscriptionHeading).toBeVisible();
    await cartPage.footer.subscribe(uniqueEmail('sub'));
    await expect(cartPage.footer.subscribeSuccess).toHaveText('You have been successfully subscribed!');
  });

  test("TC25: Scroll Up using 'Arrow' button and Scroll Down", async ({ homePage }) => {
    await homePage.scrollToBottom();
    await expect(homePage.footer.subscriptionHeading).toBeInViewport();
    await homePage.footer.scrollUpArrow.click();
    await expect(homePage.activeSliderHeading).toBeInViewport();
  });

  test("TC26: Scroll Up without 'Arrow' button and Scroll Down", async ({ homePage }) => {
    await homePage.scrollToBottom();
    await expect(homePage.footer.subscriptionHeading).toBeInViewport();
    await homePage.scrollToTop();
    await expect(homePage.activeSliderHeading).toBeInViewport();
  });
});
