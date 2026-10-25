import path from 'path';
import { DataTable } from 'playwright-bdd';
import { When, Then, expect, ScenarioContext } from '../fixtures/apiFixtures';
import { ContactForm } from '../clients/web/SiteClient';
import { uniqueEmail } from '../utils/dataFactory';

const TEST_DATA = path.resolve(__dirname, '../testData');

function contactForm(ctx: ScenarioContext, data: Record<string, string> = {}): ContactForm {
  ctx.contactForm = {
    name: data.name ?? 'PW Tester',
    email: data.email ?? uniqueEmail('contact'),
    subject: data.subject ?? 'Automation feedback',
    message: data.message ?? 'This message was sent by the API Cucumber suite.',
    filePath: path.join(TEST_DATA, data.file ?? 'upload.txt'),
  };
  return ctx.contactForm;
}

// ---------- Contact form ----------

When('I submit the contact form with:', async ({ ctx, site }, table: DataTable) => {
  ctx.page = await site.submitContactForm(contactForm(ctx, table.rowsHash()));
});

When('I submit the contact form without a CSRF token', async ({ ctx, site }) => {
  ctx.page = await site.submitContactFormWithoutCsrf(contactForm(ctx));
});

Then('the form submission is accepted', async ({ ctx }) => {
  expect(ctx.page?.status).toBe(200);
  expect(ctx.page?.text).toContain('Get In Touch');
});

// ---------- Pages ----------

When('I open the {string} page', async ({ ctx, site }, pagePath: string) => {
  ctx.page = await site.open(pagePath);
});
