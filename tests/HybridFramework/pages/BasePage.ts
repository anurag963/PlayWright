import { Locator, Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { FooterComponent } from '../components/FooterComponent';

export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly footer: FooterComponent;

  /** Relative path of the page, used by open(). */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
  }

  async open() {
    await this.page.goto(this.path);
  }

  /**
   * The site binds its jQuery handlers at the end of the page (after a slow maps script),
   * so interactions right after a navigation can fire before handlers exist.
   */
  protected async clickAndWaitForLoad(target: Locator) {
    await target.click();
    await this.page.waitForLoadState('load');
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}
