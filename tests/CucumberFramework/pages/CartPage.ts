import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface CartRow {
  name: string;
  price: string;
  quantity: string;
  total: string;
}

export class CartPage extends BasePage {
  protected readonly path = '/view_cart';

  readonly breadcrumb: Locator;
  readonly cartTable: Locator;
  readonly rows: Locator;
  readonly emptyCartMessage: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly registerLoginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.breadcrumb = page.locator('.breadcrumb .active', { hasText: 'Shopping Cart' });
    this.cartTable = page.locator('#cart_info_table');
    this.rows = page.locator('#cart_info_table tbody tr');
    this.emptyCartMessage = page.locator('#empty_cart');
    this.proceedToCheckoutButton = page.locator('.check_out', { hasText: 'Proceed To Checkout' });
    this.registerLoginLink = page.locator('#checkoutModal a[href="/login"]');
  }

  rowByProductId(productId: number): Locator {
    return this.page.locator(`#product-${productId}`);
  }

  rowByName(name: string): Locator {
    return this.rows.filter({ has: this.page.locator('.cart_description h4 a', { hasText: name }) });
  }

  async getRows(): Promise<CartRow[]> {
    const result: CartRow[] = [];
    for (const row of await this.rows.all()) {
      result.push({
        name: (await row.locator('.cart_description h4 a').innerText()).trim(),
        price: (await row.locator('.cart_price p').innerText()).trim(),
        quantity: (await row.locator('.cart_quantity button').innerText()).trim(),
        total: (await row.locator('.cart_total_price').innerText()).trim(),
      });
    }
    return result;
  }

  async removeProduct(productId: number) {
    await this.rowByProductId(productId).locator('.cart_quantity_delete').click();
  }

  async removeProductByName(name: string) {
    await this.rowByName(name).locator('.cart_quantity_delete').click();
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }

  /** Clicks "Register / Login" in the modal shown to guests on checkout. */
  async goToRegisterLogin() {
    await this.clickAndWaitForLoad(this.registerLoginLink);
  }

  /** "Rs. 1,500" -> 1500 */
  static toAmount(price: string): number {
    return Number(price.replace(/[^\d]/g, ''));
  }
}
