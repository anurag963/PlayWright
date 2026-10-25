import { Locator, Page } from '@playwright/test';

/** Top navigation bar shared by every page. */
export class HeaderComponent {
  readonly homeLink: Locator;
  readonly productsLink: Locator;
  readonly cartLink: Locator;
  readonly signupLoginLink: Locator;
  readonly logoutLink: Locator;
  readonly deleteAccountLink: Locator;
  readonly testCasesLink: Locator;
  readonly contactUsLink: Locator;
  readonly loggedInAs: Locator;

  constructor(private readonly page: Page) {
    const nav = page.locator('.shop-menu');
    this.homeLink = nav.locator('a[href="/"]');
    this.productsLink = nav.locator('a[href="/products"]');
    this.cartLink = nav.locator('a[href="/view_cart"]');
    this.signupLoginLink = nav.locator('a[href="/login"]');
    this.logoutLink = nav.locator('a[href="/logout"]');
    this.deleteAccountLink = nav.locator('a[href="/delete_account"]');
    this.testCasesLink = nav.locator('a[href="/test_cases"]');
    this.contactUsLink = nav.locator('a[href="/contact_us"]');
    this.loggedInAs = nav.locator('li', { hasText: 'Logged in as' });
  }

  /** Clicks a nav link and waits for the new page's scripts (jQuery handlers) to be ready. */
  private async navigate(link: Locator) {
    await link.click();
    await this.page.waitForLoadState('load');
  }

  async goToHome() { await this.navigate(this.homeLink); }
  async goToProducts() { await this.navigate(this.productsLink); }
  async goToCart() { await this.navigate(this.cartLink); }
  async goToSignupLogin() { await this.navigate(this.signupLoginLink); }
  async goToTestCases() { await this.navigate(this.testCasesLink); }
  async goToContactUs() { await this.navigate(this.contactUsLink); }
  async logout() { await this.navigate(this.logoutLink); }
  async deleteAccount() { await this.navigate(this.deleteAccountLink); }
}
