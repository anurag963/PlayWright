import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * /products plus the category / brand / search listings, which share the same layout.
 */
export class ProductsPage extends BasePage {
  protected readonly path = '/products';

  readonly listingTitle: Locator;
  readonly productCards: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly categorySidebar: Locator;
  readonly brandsSidebar: Locator;
  readonly continueShoppingButton: Locator;
  readonly viewCartLink: Locator;

  constructor(page: Page) {
    super(page);
    this.listingTitle = page.locator('.features_items h2.title');
    this.productCards = page.locator('.features_items .product-image-wrapper');
    this.searchInput = page.locator('#search_product');
    this.searchButton = page.locator('#submit_search');
    this.categorySidebar = page.locator('#accordian');
    this.brandsSidebar = page.locator('.brands_products');
    this.continueShoppingButton = page.locator('#cartModal .close-modal');
    this.viewCartLink = page.locator('#cartModal a[href="/view_cart"]');
  }

  productNames(): Locator {
    return this.productCards.locator('.productinfo p');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.clickAndWaitForLoad(this.searchButton);
  }

  async viewProductAt(index: number) {
    await this.clickAndWaitForLoad(this.productCards.nth(index).locator('a[href^="/product_details/"]'));
  }

  /** Hovers the product card at `index` and clicks its "Add to cart"; returns name and price. */
  async addProductToCartAt(index: number): Promise<{ name: string; price: string }> {
    const card = this.productCards.nth(index);
    const name = (await card.locator('.productinfo p').innerText()).trim();
    const price = (await card.locator('.productinfo h2').innerText()).trim();
    await card.hover();
    await card.locator('.productinfo .add-to-cart').click();
    return { name, price };
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async viewCartFromModal() {
    await this.clickAndWaitForLoad(this.viewCartLink);
  }

  /** Adds every product in the current listing to the cart and returns their names. */
  async addAllListedProductsToCart(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      names.push((await this.addProductToCartAt(i)).name);
      await this.continueShopping();
    }
    return names;
  }

  async openCategory(category: 'Women' | 'Men' | 'Kids', subCategory: string) {
    await this.categorySidebar.locator(`a[href="#${category}"]`).click();
    await this.clickAndWaitForLoad(this.page.locator(`#${category}`).getByRole('link', { name: subCategory, exact: true }));
  }

  async openBrand(brand: string) {
    await this.clickAndWaitForLoad(this.brandsSidebar.locator(`a[href="/brand_products/${brand}"]`));
  }
}
