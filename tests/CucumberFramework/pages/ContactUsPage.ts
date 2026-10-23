import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  filePath?: string;
}

export class ContactUsPage extends BasePage {
  protected readonly path = '/contact_us';

  readonly getInTouchHeading: Locator;
  readonly name: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly uploadFile: Locator;
  readonly submitButton: Locator;
  readonly successMessage: Locator;
  readonly homeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.getInTouchHeading = page.locator('h2.title', { hasText: 'Get In Touch' });
    this.name = page.locator('[data-qa="name"]');
    this.email = page.locator('[data-qa="email"]');
    this.subject = page.locator('[data-qa="subject"]');
    this.message = page.locator('[data-qa="message"]');
    this.uploadFile = page.locator('input[name="upload_file"]');
    this.submitButton = page.locator('[data-qa="submit-button"]');
    this.successMessage = page.locator('.contact-form .status.alert-success');
    this.homeButton = page.locator('#form-section a.btn-success');
  }

  async fillForm(form: ContactForm) {
    await this.name.fill(form.name);
    await this.email.fill(form.email);
    await this.subject.fill(form.subject);
    await this.message.fill(form.message);
    if (form.filePath) await this.uploadFile.setInputFiles(form.filePath);
  }

  async attachFile(filePath: string) {
    await this.uploadFile.setInputFiles(filePath);
  }

  /** Submits and accepts the browser "Press OK to proceed!" confirm dialog. */
  async submit() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.submitButton.click();
  }
}
