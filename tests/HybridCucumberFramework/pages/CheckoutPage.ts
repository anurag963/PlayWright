import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';

  readonly addressDetailsHeading: Locator;
  readonly reviewOrderHeading: Locator;
  readonly deliveryAddress: Locator;
  readonly billingAddress: Locator;
  readonly orderRows: Locator;
  readonly commentTextArea: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addressDetailsHeading = page.locator('h2.heading', { hasText: 'Address Details' });
    this.reviewOrderHeading = page.locator('h2.heading', { hasText: 'Review Your Order' });
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.orderRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.commentTextArea = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.locator('a[href="/payment"]');
  }

  async placeOrder(comment: string) {
    await this.commentTextArea.fill(comment);
    await this.clickAndWaitForLoad(this.placeOrderButton);
  }
}
