import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class TestCasesPage extends BasePage {
  protected readonly path = '/test_cases';

  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h2.title', { hasText: 'Test Cases' });
  }
}
