import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductDetailsPage extends BasePage {
  protected readonly path = '/product_details/1';

  readonly name: Locator;
  readonly category: Locator;
  readonly price: Locator;
  readonly availability: Locator;
  readonly condition: Locator;
  readonly brand: Locator;
  readonly quantity: Locator;
  readonly addToCartButton: Locator;
  readonly viewCartLink: Locator;

  readonly writeReviewHeading: Locator;
  readonly reviewName: Locator;
  readonly reviewEmail: Locator;
  readonly reviewText: Locator;
  readonly reviewSubmit: Locator;
  readonly reviewSuccess: Locator;

  constructor(page: Page) {
    super(page);
    const info = page.locator('.product-information');
    this.name = info.locator('h2');
    this.category = info.locator('p', { hasText: 'Category:' });
    this.price = info.locator('span > span');
    this.availability = info.locator('p', { hasText: 'Availability:' });
    this.condition = info.locator('p', { hasText: 'Condition:' });
    this.brand = info.locator('p', { hasText: 'Brand:' });
    this.quantity = page.locator('#quantity');
    this.addToCartButton = info.locator('button.cart');
    this.viewCartLink = page.locator('#cartModal a[href="/view_cart"]');

    this.writeReviewHeading = page.locator('a[href="#reviews"]', { hasText: 'Write Your Review' });
    this.reviewName = page.locator('#review-form #name');
    this.reviewEmail = page.locator('#review-form #email');
    this.reviewText = page.locator('#review-form #review');
    this.reviewSubmit = page.locator('#button-review');
    this.reviewSuccess = page.locator('#review-section .alert-success');
  }

  async openProduct(productId: number) {
    await this.page.goto(`/product_details/${productId}`);
  }

  async setQuantity(qty: number) {
    await this.quantity.fill(String(qty));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async viewCartFromModal() {
    await this.clickAndWaitForLoad(this.viewCartLink);
  }

  async submitReview(name: string, email: string, review: string) {
    await this.reviewName.fill(name);
    await this.reviewEmail.fill(email);
    await this.reviewText.fill(review);
    await this.reviewSubmit.click();
  }
}
