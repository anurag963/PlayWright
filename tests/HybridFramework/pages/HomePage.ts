import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  protected readonly path = '/';

  readonly logo: Locator;
  readonly activeSliderHeading: Locator;
  readonly categorySidebar: Locator;
  readonly recommendedItems: Locator;
  readonly recommendedHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.logo = page.locator('.logo img');
    this.activeSliderHeading = page.locator('#slider-carousel .item.active h2', {
      hasText: 'Full-Fledged practice website for Automation Engineers',
    });
    this.categorySidebar = page.locator('#accordian');
    this.recommendedItems = page.locator('.recommended_items');
    this.recommendedHeading = this.recommendedItems.locator('h2.title');
  }

  async viewProduct(productId: number) {
    await this.clickAndWaitForLoad(this.page.locator(`a[href="/product_details/${productId}"]`).first());
  }

  /** Adds the first product in the currently visible recommended-items slide. */
  async addFirstRecommendedToCart(): Promise<string> {
    const product = this.recommendedItems.locator('.item.active .productinfo').first();
    const name = (await product.locator('p').innerText()).trim();
    await product.locator('.add-to-cart').click();
    return name;
  }
}
