import { Locator, Page } from '@playwright/test';

/** Footer with the newsletter subscription widget, shared by every page. */
export class FooterComponent {
  readonly subscriptionHeading: Locator;
  readonly subscribeEmailInput: Locator;
  readonly subscribeButton: Locator;
  readonly subscribeSuccess: Locator;
  readonly scrollUpArrow: Locator;

  constructor(page: Page) {
    this.subscriptionHeading = page.locator('footer h2', { hasText: 'Subscription' });
    this.subscribeEmailInput = page.locator('#susbscribe_email'); // typo is in the site's markup
    this.subscribeButton = page.locator('#subscribe');
    this.subscribeSuccess = page.locator('#success-subscribe');
    this.scrollUpArrow = page.locator('#scrollUp');
  }

  async scrollIntoView() {
    await this.subscriptionHeading.scrollIntoViewIfNeeded();
  }

  async subscribe(email: string) {
    await this.subscribeEmailInput.fill(email);
    await this.subscribeButton.click();
  }
}
