import { Download, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CardData } from '../utils/dataFactory';

/** /payment and the /payment_done confirmation that follows. */
export class PaymentPage extends BasePage {
  protected readonly path = '/payment';

  readonly nameOnCard: Locator;
  readonly cardNumber: Locator;
  readonly cvc: Locator;
  readonly expiryMonth: Locator;
  readonly expiryYear: Locator;
  readonly payButton: Locator;

  readonly orderPlacedHeading: Locator;
  readonly orderConfirmedMessage: Locator;
  readonly downloadInvoiceButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameOnCard = page.locator('[data-qa="name-on-card"]');
    this.cardNumber = page.locator('[data-qa="card-number"]');
    this.cvc = page.locator('[data-qa="cvc"]');
    this.expiryMonth = page.locator('[data-qa="expiry-month"]');
    this.expiryYear = page.locator('[data-qa="expiry-year"]');
    this.payButton = page.locator('[data-qa="pay-button"]');

    this.orderPlacedHeading = page.locator('[data-qa="order-placed"]');
    this.orderConfirmedMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceButton = page.locator('a', { hasText: 'Download Invoice' });
    this.continueButton = page.locator('[data-qa="continue-button"]');
  }

  async payAndConfirm(card: CardData) {
    await this.nameOnCard.fill(card.nameOnCard);
    await this.cardNumber.fill(card.cardNumber);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.expiryMonth);
    await this.expiryYear.fill(card.expiryYear);
    await this.payButton.click();
  }

  async downloadInvoice(): Promise<Download> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.downloadInvoiceButton.click();
    return downloadPromise;
  }
}
