import fs from 'fs';
import path from 'path';
import { WebClient } from '../../core/WebClient';
import { Multipart } from '../../core/BaseClient';
import { pageText } from '../../utils/htmlParser';

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  filePath: string;
}

/** Static pages and the Contact Us form. */
export class SiteClient extends WebClient {
  async open(pagePath: string) {
    const page = await this.getPage(pagePath);
    return { ...page, text: pageText(page.html) };
  }

  /**
   * Note: the "Success!" banner is rendered by client-side JS, and the server answers a
   * valid POST with the same page as a GET – so callers can only assert it was accepted.
   */
  async submitContactForm(form: ContactForm) {
    const page = await this.submitForm('/contact_us', '/contact_us', contactFields(form), contactFile(form));
    return { status: page.status, text: pageText(page.html) };
  }

  /** Same POST without a CSRF token; Django should reject it with 403. */
  async submitContactFormWithoutCsrf(form: ContactForm) {
    const res = await this.send('POST', '/contact_us', { multipart: { ...contactFields(form), ...contactFile(form) } });
    return { status: res.status() };
  }
}

function contactFields(form: ContactForm): Record<string, string> {
  return { name: form.name, email: form.email, subject: form.subject, message: form.message, submit: 'Submit' };
}

function contactFile(form: ContactForm): Multipart {
  return { upload_file: { name: path.basename(form.filePath), mimeType: 'text/plain', buffer: fs.readFileSync(form.filePath) } };
}
